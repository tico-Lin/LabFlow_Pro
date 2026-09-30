from fastapi import FastAPI
from labflow.server.api.v1 import notes
import labflow

app = FastAPI(title="LabFlow Pro API", version=labflow.__version__)
app.include_router(notes.router, prefix="/api/v1/notes", tags=["notes"])

@app.get("/health")
def health_check():
    return {"status": "ok", "version": labflow.__version__}


def main() -> None:
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
