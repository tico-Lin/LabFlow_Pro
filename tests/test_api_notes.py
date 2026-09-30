from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import Base
from app.database import get_db
from fastapi import FastAPI
from app.api import notes

# Setup a test app
app = FastAPI()
app.include_router(notes.router, prefix="/api/v1/notes")

from sqlalchemy.pool import StaticPool

engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
Base.metadata.create_all(bind=engine)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def test_create_note():
    response = client.post("/api/v1/notes/")
    assert response.status_code == 200
    assert "id" in response.json()
    assert response.json()["blocks"] == []

def test_get_note():
    post_res = client.post("/api/v1/notes/")
    note_id = post_res.json()["id"]
    
    get_res = client.get(f"/api/v1/notes/{note_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == note_id
    
    get_res_fail = client.get(f"/api/v1/notes/999")
    assert get_res_fail.status_code == 404

def test_update_blocks():
    post_res = client.post("/api/v1/notes/")
    note_id = post_res.json()["id"]
    
    blocks = [
        {
            "block_type": "markdown",
            "content": "hello API",
            "order_index": 0
        }
    ]
    
    put_res = client.put(f"/api/v1/notes/{note_id}/blocks", json=blocks)
    assert put_res.status_code == 200
    res_data = put_res.json()
    assert len(res_data["blocks"]) == 1
    assert res_data["blocks"][0]["content"] == "hello API"
    
    put_res_fail = client.put(f"/api/v1/notes/999/blocks", json=blocks)
    assert put_res_fail.status_code == 404

def test_delete_note():
    post_res = client.post("/api/v1/notes/")
    note_id = post_res.json()["id"]
    
    del_res = client.delete(f"/api/v1/notes/{note_id}")
    assert del_res.status_code == 200
    
    del_res_fail = client.delete(f"/api/v1/notes/999")
    assert del_res_fail.status_code == 404
