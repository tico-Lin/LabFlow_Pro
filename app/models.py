from enum import Enum
from sqlalchemy import Column, Integer, String, Enum as SQLEnum, ForeignKey, JSON, DateTime, Boolean
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class BlockType(str, Enum):
    markdown = "markdown"
    latex = "latex"
    table = "table"
    chemical_structure = "chemical_structure"


class ExperimentNote(Base):
    __tablename__ = "experiment_notes"
    id = Column(Integer, primary_key=True, index=True)
    is_deleted = Column(Boolean, default=False, nullable=False)
    blocks = relationship("NoteBlock", back_populates="note",
                          cascade="all, delete-orphan")
    revisions = relationship(
        "NoteRevision", back_populates="note", cascade="all, delete-orphan")


class NoteBlock(Base):
    __tablename__ = "note_blocks"
    id = Column(Integer, primary_key=True, index=True)
    note_id = Column(Integer, ForeignKey(
        "experiment_notes.id"), nullable=False)
    block_type = Column(SQLEnum(BlockType), nullable=False)
    content = Column(JSON, nullable=False)
    order_index = Column(Integer, nullable=False)
    metadata_ = Column("metadata", JSON, nullable=True)

    note = relationship("ExperimentNote", back_populates="blocks")


class NoteRevision(Base):
    __tablename__ = "note_revisions"
    id = Column(Integer, primary_key=True, index=True)
    note_id = Column(Integer, ForeignKey(
        "experiment_notes.id"), nullable=False)
    version_number = Column(Integer, nullable=False)
    parent_hash = Column(String, nullable=True)
    current_hash = Column(String, nullable=False)
    diff_patch = Column(JSON, nullable=False)
    created_at = Column(DateTime, nullable=False)
    created_by = Column(String, nullable=False)

    note = relationship("ExperimentNote", back_populates="revisions")
