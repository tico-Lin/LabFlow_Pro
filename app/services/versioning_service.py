import jsonpatch
import hashlib
import json
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models import NoteRevision


def get_blocks_dict(blocks):
    return [
        {
            "block_type": b.block_type.value,
            "content": b.content,
            "order_index": b.order_index,
            "metadata": b.metadata_
        }
        for b in sorted(blocks, key=lambda x: x.order_index)
    ]


def hash_data(data):
    return hashlib.sha256(json.dumps(data, sort_keys=True).encode()).hexdigest()


def create_revision(db: Session, note_id: int, old_blocks, new_blocks, user: str = "system"):
    old_data = get_blocks_dict(old_blocks)
    new_data = get_blocks_dict(new_blocks)

    patch = jsonpatch.make_patch(old_data, new_data)

    last_rev = db.query(NoteRevision).filter(NoteRevision.note_id == note_id).order_by(
        NoteRevision.version_number.desc()).first()

    parent_hash = last_rev.current_hash if last_rev else None
    current_hash = hash_data(new_data)

    version_number = last_rev.version_number + 1 if last_rev else 1

    if last_rev and not patch.patch:
        return last_rev

    rev = NoteRevision(
        note_id=note_id,
        version_number=version_number,
        parent_hash=parent_hash,
        current_hash=current_hash,
        diff_patch=patch.patch,
        created_at=datetime.now(timezone.utc),
        created_by=user
    )
    db.add(rev)
    db.commit()
    db.refresh(rev)
    return rev


def revert_to_version(db: Session, note_id: int, target_version: int, user: str = "system"):
    revisions = db.query(NoteRevision).filter(
        NoteRevision.note_id == note_id,
        NoteRevision.version_number <= target_version
    ).order_by(NoteRevision.version_number.asc()).all()

    if not revisions:
        return None

    state = []
    for rev in revisions:
        patch = jsonpatch.JsonPatch(rev.diff_patch)
        state = patch.apply(state)

    from app.services.note_service import update_blocks
    from app.schemas import NoteBlockCreate

    blocks_in = []
    for s in state:
        blocks_in.append(NoteBlockCreate(
            block_type=s["block_type"],
            content=s["content"],
            order_index=s["order_index"],
            metadata=s["metadata"]
        ))

    return update_blocks(db, note_id, blocks_in, user, create_rev=True)
