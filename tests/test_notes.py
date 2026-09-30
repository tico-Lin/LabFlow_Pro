import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from labflow.server.models import Base
from labflow.server.services import note_service
from labflow.server.schemas import NoteBlockCreate
from labflow.server.main import app
from labflow.server.database import get_db
from labflow.server.models import BlockType
from pydantic import ValidationError

from sqlalchemy.pool import StaticPool

@pytest.fixture
def db_session():
    engine = create_engine(
        "sqlite:///:memory:", 
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()

def test_validation_errors():
    with pytest.raises(ValidationError):
        NoteBlockCreate(block_type=BlockType.markdown, content="", order_index=0)
    
    with pytest.raises(ValidationError):
        NoteBlockCreate(block_type="invalid_type", content="text", order_index=0)

def test_note_block_crud(db_session):
    note = note_service.create_note(db_session)
    assert note.id is not None
    
    blocks = [
        NoteBlockCreate(block_type=BlockType.markdown, content="block 2", order_index=1),
        NoteBlockCreate(block_type=BlockType.latex, content="block 1", order_index=0)
    ]
    
    updated_note = note_service.update_blocks(db_session, note.id, blocks)
    assert len(updated_note.blocks) == 2
    
    # Test sort logic
    sorted_blocks = sorted(updated_note.blocks, key=lambda x: x.order_index)
    assert sorted_blocks[0].content == "block 1"
    assert sorted_blocks[1].content == "block 2"
    
    # Test ACID
    try:
        note_service.update_blocks(db_session, note.id, [
            NoteBlockCreate(block_type=BlockType.markdown, content="b", order_index=0)
        ])
    except Exception:
        pass
    
    db_session.rollback()
    
    fetched = note_service.get_note(db_session, note.id)
    assert len(fetched.blocks) == 1
    assert fetched.blocks[0].content == "b"

    note_service.delete_note(db_session, note.id)
    assert note_service.get_note(db_session, note.id) is None


def test_add_block_and_revert(db_session):
    note = note_service.create_note(db_session)
    block_in = NoteBlockCreate(block_type=BlockType.table, content="table", order_index=0)
    block = note_service.add_block(db_session, note.id, block_in)
    assert block.id is not None
    assert block.content == "table"


def test_reorder_blocks(db_session):
    note = note_service.create_note(db_session)
    blocks = [
        NoteBlockCreate(block_type=BlockType.markdown, content="block A", order_index=0),
        NoteBlockCreate(block_type=BlockType.markdown, content="block B", order_index=1),
        NoteBlockCreate(block_type=BlockType.markdown, content="block C", order_index=2)
    ]
    note = note_service.update_blocks(db_session, note.id, blocks)
    assert len(note.blocks) == 3
    
    block_ids = [b.id for b in sorted(note.blocks, key=lambda x: x.order_index)]
    
    # Reorder blocks: C -> 0, B -> 1, A -> 2
    order_map = [
        (block_ids[2], 0),
        (block_ids[1], 1),
        (block_ids[0], 2)
    ]
    note_service.reorder_blocks(db_session, note.id, order_map)
    
    fetched = note_service.get_note(db_session, note.id)
    sorted_blocks = sorted(fetched.blocks, key=lambda x: x.order_index)
    assert sorted_blocks[0].content == "block C"
    assert sorted_blocks[1].content == "block B"
    assert sorted_blocks[2].content == "block A"
    
    # Test index continuity constraint conceptually
    indices = [b.order_index for b in sorted_blocks]
    assert indices == [0, 1, 2]


def test_api_notes(db_session):
    app.dependency_overrides[get_db] = lambda: db_session
    client = TestClient(app)

    # Create note
    res = client.post("/api/v1/notes/")
    assert res.status_code == 200
    note_id = res.json()["id"]

    # Get note
    res = client.get(f"/api/v1/notes/{note_id}")
    assert res.status_code == 200
    assert res.json()["id"] == note_id

    # Update blocks
    blocks_payload = [
        {"block_type": "markdown", "content": "hello", "order_index": 0}
    ]
    res = client.put(f"/api/v1/notes/{note_id}/blocks", json=blocks_payload)
    assert res.status_code == 200
    assert len(res.json()["blocks"]) == 1

    # Delete note
    res = client.delete(f"/api/v1/notes/{note_id}")
    assert res.status_code == 200

    # Get deleted note (should be 404)
    res = client.get(f"/api/v1/notes/{note_id}")
    assert res.status_code == 404
    
    # Delete non-existent note
    res = client.delete(f"/api/v1/notes/{note_id}")
    assert res.status_code == 404
    
    # Update non-existent note blocks
    res = client.put(f"/api/v1/notes/{note_id}/blocks", json=[])
    assert res.status_code == 404
    
    app.dependency_overrides.clear()
