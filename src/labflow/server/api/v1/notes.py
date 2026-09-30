from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from labflow.server.schemas import ExperimentNoteResponse, NoteBlockCreate
from labflow.server.services import note_service
from labflow.server.database import get_db

router = APIRouter()


@router.post("/", response_model=ExperimentNoteResponse)
def create_note(db: Session = Depends(get_db)):
    return note_service.create_note(db)


@router.get("/{note_id}", response_model=ExperimentNoteResponse)
def get_note(note_id: int, db: Session = Depends(get_db)):
    note = note_service.get_note(db, note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note


@router.put("/{note_id}/blocks", response_model=ExperimentNoteResponse)
def update_blocks(note_id: int, blocks: List[NoteBlockCreate], db: Session = Depends(get_db)):
    note = note_service.update_blocks(db, note_id, blocks)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note


@router.delete("/{note_id}")
def delete_note(note_id: int, db: Session = Depends(get_db)):
    success = note_service.delete_note(db, note_id)
    if not success:
        raise HTTPException(status_code=404, detail="Note not found")
    return {"message": "Note deleted"}
