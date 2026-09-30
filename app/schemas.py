from pydantic import BaseModel, field_validator, ConfigDict
from typing import List, Optional, Any, Dict
from app.models import BlockType
from datetime import datetime


class NoteBlockBase(BaseModel):
    block_type: BlockType
    content: Any
    order_index: int
    metadata: Optional[Dict[str, Any]] = None

    @field_validator("content")
    @classmethod
    def content_must_not_be_empty(cls, v):
        if not v:
            raise ValueError("Content cannot be empty")
        return v


class NoteBlockCreate(NoteBlockBase):
    pass


class NoteBlockResponse(NoteBlockBase):
    id: int
    note_id: int

    from pydantic import model_validator

    @model_validator(mode='before')
    @classmethod
    def extract_metadata(cls, data: Any) -> Any:
        if hasattr(data, 'metadata_'):
            # Convert SQLAlchemy obj to dict
            d = {c.name: getattr(data, c.name) for c in data.__table__.columns}
            d['metadata'] = data.metadata_
            return d
        return data

    model_config = ConfigDict(from_attributes=True)


class ExperimentNoteBase(BaseModel):
    pass


class ExperimentNoteResponse(ExperimentNoteBase):
    id: int
    blocks: List[NoteBlockResponse] = []

    model_config = ConfigDict(from_attributes=True)


class NoteRevisionResponse(BaseModel):
    id: int
    note_id: int
    version_number: int
    parent_hash: Optional[str]
    current_hash: str
    diff_patch: Any
    created_at: datetime
    created_by: str

    model_config = ConfigDict(from_attributes=True)
