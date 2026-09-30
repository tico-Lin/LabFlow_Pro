import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from labflow.server.main import app
from labflow.server.database import get_db
from labflow.server.models import Base

engine = create_engine(
    "sqlite:///file:testdb?mode=memory&cache=shared&uri=true",
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

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
    # Create first
    resp1 = client.post("/api/v1/notes/")
    note_id = resp1.json()["id"]
    
    resp2 = client.get(f"/api/v1/notes/{note_id}")
    assert resp2.status_code == 200
    assert resp2.json()["id"] == note_id

def test_get_note_not_found():
    resp = client.get("/api/v1/notes/9999")
    assert resp.status_code == 404

def test_update_blocks():
    resp1 = client.post("/api/v1/notes/")
    note_id = resp1.json()["id"]
    
    blocks = [
        {"block_type": "markdown", "content": "hello", "order_index": 0}
    ]
    resp2 = client.put(f"/api/v1/notes/{note_id}/blocks", json=blocks)
    assert resp2.status_code == 200
    assert len(resp2.json()["blocks"]) == 1
    assert resp2.json()["blocks"][0]["content"] == "hello"

def test_update_blocks_not_found():
    resp = client.put("/api/v1/notes/9999/blocks", json=[])
    assert resp.status_code == 404

def test_delete_note():
    resp1 = client.post("/api/v1/notes/")
    note_id = resp1.json()["id"]
    
    resp2 = client.delete(f"/api/v1/notes/{note_id}")
    assert resp2.status_code == 200
    
    resp3 = client.get(f"/api/v1/notes/{note_id}")
    assert resp3.status_code == 404

def test_delete_note_not_found():
    resp = client.delete("/api/v1/notes/9999")
    assert resp.status_code == 404

