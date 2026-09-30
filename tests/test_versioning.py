import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import Base, NoteRevision
from app.services import note_service
from app.services.versioning_service import revert_to_version
from app.schemas import NoteBlockCreate
from app.models import BlockType

@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()

def test_versioning_continuity_and_revert(db_session):
    note = note_service.create_note(db_session)
    
    # 10 edits
    states = []
    for i in range(1, 11):
        blocks = [
            NoteBlockCreate(block_type=BlockType.markdown, content=f"content {i}", order_index=0)
        ]
        note_service.update_blocks(db_session, note.id, blocks)
        states.append(blocks)
        
    revisions = db_session.query(NoteRevision).filter(NoteRevision.note_id == note.id).order_by(NoteRevision.version_number.asc()).all()
    assert len(revisions) == 11 # initial + 10 edits
    
    # Verify version continuity
    for i in range(1, len(revisions)):
        assert revisions[i].parent_hash == revisions[i-1].current_hash
        assert revisions[i].version_number == i + 1
        
    # Random revert
    target_version = 5 # State index 3 (0-indexed was empty, 1 was state 0, 5 is state 3)
    revert_to_version(db_session, note.id, target_version)
    
    fetched = note_service.get_note(db_session, note.id)
    assert len(fetched.blocks) == 1
    assert fetched.blocks[0].content == "content 4" # target_version 5 means 4th edit
    
    # Check revisions after revert
    # The revert_to_version added a new revision.
    new_revisions = db_session.query(NoteRevision).filter(NoteRevision.note_id == note.id).order_by(NoteRevision.version_number.asc()).all()
    assert len(new_revisions) == 12
    assert new_revisions[-1].version_number == 12

