from sqlalchemy.orm import Session
from app.models import ExperimentNote, NoteBlock
from app.schemas import NoteBlockCreate
from typing import List
from .versioning_service import create_revision

def create_note(db: Session) -> ExperimentNote:
    note = ExperimentNote()
    db.add(note)
    db.commit()
    db.refresh(note)
    create_revision(db, note.id, [], [], "system")
    return note

def get_note(db: Session, note_id: int) -> ExperimentNote:
    return db.query(ExperimentNote).filter(ExperimentNote.id == note_id).first()

def delete_note(db: Session, note_id: int):
    note = get_note(db, note_id)
    if note:
        db.delete(note)
        db.commit()
        return True
    return False

def add_block(db: Session, note_id: int, block_in: NoteBlockCreate, user: str = "system") -> NoteBlock:
    note = get_note(db, note_id)
    old_blocks = [b for b in note.blocks] if note else []
    
    block = NoteBlock(
        note_id=note_id,
        block_type=block_in.block_type,
        content=block_in.content,
        order_index=block_in.order_index,
        metadata_=block_in.metadata
    )
    db.add(block)
    db.commit()
    db.refresh(block)
    
    note = get_note(db, note_id)
    create_revision(db, note.id, old_blocks, note.blocks, user)
    return block

def update_blocks(db: Session, note_id: int, blocks_in: List[NoteBlockCreate], user: str = "system", create_rev: bool = True):
    note = get_note(db, note_id)
    if not note:
        return None
    old_blocks = [b for b in note.blocks]
    
    for b in note.blocks:
        db.delete(b)
    db.flush()
    
    new_blocks = []
    for i, b_in in enumerate(blocks_in):
        b = NoteBlock(
            note_id=note_id,
            block_type=b_in.block_type,
            content=b_in.content,
            order_index=b_in.order_index if b_in.order_index is not None else i,
            metadata_=b_in.metadata
        )
        db.add(b)
        new_blocks.append(b)
    db.commit()
    
    note = get_note(db, note_id)
    if create_rev:
        create_revision(db, note.id, old_blocks, note.blocks, user)
    return note

