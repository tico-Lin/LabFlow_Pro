from fastapi import FastAPI
from app.api.v1 import notes

__version__ = "0.3.0"

app = FastAPI(title="LabFlow Pro API", version=__version__)
app.include_router(notes.router, prefix="/api/v1/notes", tags=["notes"])
