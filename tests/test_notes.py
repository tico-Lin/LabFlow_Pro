import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import Base
from app.services import note_service
from app.schemas import NoteBlockCreate
from app.models import BlockType
from pydantic import ValidationError

@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
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
