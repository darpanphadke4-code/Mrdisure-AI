# backend/tests/test_rag.py
import os
import shutil
import tempfile
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from app.main import app
from app.database import Base, SessionLocal, engine
from app.models.user import User
from app.models.policy import Policy
from app.models.policy_clause import PolicyClause
from app.models.policy_chunk import PolicyChunk
from app.models.chat_session import ChatSession
from app.models.chat_message import ChatMessage
from app.services.chunking_service import chunking_service
from app.services.embedding_service import embedding_service, OllamaServiceError
from app.services.vector_store import VectorStoreService
from app.services.retrieval_service import RetrievalService
from app.services.rag_service import rag_service
from app.services.indexing_service import IndexingService

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_database():
    """Ensure database tables are initialized and clean."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    # Ensure default test user exists
    user = db.query(User).filter(User.id == "user-default-darpan").first()
    if not user:
        user = User(
            id="user-default-darpan",
            name="Darpan Patel",
            email="darpan@medisure.ai",
            password_hash="demo_hash"
        )
        db.add(user)
        db.commit()
    db.close()
    yield

@pytest.fixture
def temp_chroma():
    """Create an isolated temporary ChromaDB store for testing."""
    temp_dir = tempfile.mkdtemp()
    vs = VectorStoreService(persist_directory=temp_dir)
    yield vs
    shutil.rmtree(temp_dir, ignore_errors=True)

# 1. Chunk creation test
def test_chunk_creation():
    mock_clause_1 = PolicyClause(
        id="c-1",
        policy_id="pol-test-1",
        page_number=1,
        section_title="Room Rent Clause",
        clause_type="ROOM_RENT",
        content="Room rent daily limit is capped at INR 5,000 per day."
    )
    long_text = "This is a detailed policy provision. " * 30
    mock_clause_2 = PolicyClause(
        id="c-2",
        policy_id="pol-test-1",
        page_number=2,
        section_title="Detailed Exclusions",
        clause_type="EXCLUSION",
        content=long_text
    )

    chunks = chunking_service.create_chunks_from_clauses(
        "pol-test-1",
        [mock_clause_1, mock_clause_2]
    )

    assert len(chunks) >= 2
    assert chunks[0]["page_number"] == 1
    assert "Room Rent Clause" in chunks[0]["section_title"]
    assert "INR 5,000" in chunks[0]["content"]

# 2. Chunk metadata preservation test
def test_chunk_metadata():
    clause = PolicyClause(
        id="c-meta-1",
        policy_id="pol-test-meta",
        page_number=4,
        section_title="Waiting Period PED",
        clause_type="WAITING_PERIOD",
        content="Pre-existing diseases have a 36-month waiting period."
    )
    chunks = chunking_service.create_chunks_from_clauses("pol-test-meta", [clause])
    assert len(chunks) == 1
    c = chunks[0]
    assert c["policy_id"] == "pol-test-meta"
    assert c["clause_id"] == "c-meta-1"
    assert c["page_number"] == 4
    assert c["section_title"] == "Waiting Period PED"
    assert c["chunk_index"] == 0
    assert len(c["content_hash"]) == 64

# 3. Embedding service with mocked Ollama
@patch("httpx.Client.post")
def test_embedding_service_mocked(mock_post):
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {"embedding": [0.1, 0.2, 0.3, 0.4]}
    mock_post.return_value = mock_resp

    emb = embedding_service.embed_text("What is my deductible?")
    assert emb == [0.1, 0.2, 0.3, 0.4]

# 4. Vector insertion
def test_vector_insertion(temp_chroma):
    temp_chroma.add_chunks(
        policy_id="pol-vec-1",
        chunk_ids=["chunk-1", "chunk-2"],
        embeddings=[[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]],
        documents=["Room rent limit 5000", "Deductible is 15000"],
        metadatas=[
            {"page_number": 1, "section_title": "Room Rent", "clause_id": "c1"},
            {"page_number": 2, "section_title": "Deductible", "clause_id": "c2"}
        ]
    )
    count = temp_chroma.count_policy_chunks("pol-vec-1")
    assert count == 2

# 5. Policy-filtered retrieval
def test_policy_filtered_retrieval(temp_chroma):
    temp_chroma.add_chunks(
        policy_id="pol-filt-1",
        chunk_ids=["chunk-f1"],
        embeddings=[[1.0, 0.0, 0.0]],
        documents=["Room rent limit ₹5,000 per day"],
        metadatas=[{"page_number": 1, "section_title": "Room Rent", "clause_id": "c1"}]
    )

    results = temp_chroma.query_similar_chunks(
        policy_id="pol-filt-1",
        query_embedding=[1.0, 0.0, 0.0],
        top_k=1
    )
    assert len(results) == 1
    assert results[0]["policy_id"] == "pol-filt-1"
    assert results[0]["page_number"] == 1
    assert "₹5,000" in results[0]["content"]

# 6. Cross-policy isolation test
def test_cross_policy_isolation(temp_chroma):
    """Ensure querying Policy A NEVER returns Policy B vectors."""
    # Policy A: Room rent = ₹5,000
    temp_chroma.add_chunks(
        policy_id="policy-A",
        chunk_ids=["chunk-A1"],
        embeddings=[[0.9, 0.1, 0.0]],
        documents=["Policy A: Room rent is ₹5,000 per day."],
        metadatas=[{"page_number": 2, "section_title": "Room Rent A", "clause_id": "cA"}]
    )
    # Policy B: Room rent = ₹10,000
    temp_chroma.add_chunks(
        policy_id="policy-B",
        chunk_ids=["chunk-B1"],
        embeddings=[[0.9, 0.1, 0.0]],
        documents=["Policy B: Room rent is ₹10,000 per day."],
        metadatas=[{"page_number": 2, "section_title": "Room Rent B", "clause_id": "cB"}]
    )

    # Query scoped to Policy A
    res_A = temp_chroma.query_similar_chunks(
        policy_id="policy-A",
        query_embedding=[0.9, 0.1, 0.0],
        top_k=5
    )
    assert len(res_A) == 1
    assert res_A[0]["policy_id"] == "policy-A"
    assert "₹5,000" in res_A[0]["content"]
    assert "₹10,000" not in res_A[0]["content"]

    # Query scoped to Policy B
    res_B = temp_chroma.query_similar_chunks(
        policy_id="policy-B",
        query_embedding=[0.9, 0.1, 0.0],
        top_k=5
    )
    assert len(res_B) == 1
    assert res_B[0]["policy_id"] == "policy-B"
    assert "₹10,000" in res_B[0]["content"]
    assert "₹5,000" not in res_B[0]["content"]

# 7. RAG prompt construction
def test_rag_prompt_construction():
    template = rag_service.prompt_template
    formatted = template.format(
        context="[Page 2]: Room rent limit INR 5000",
        question="What is the room rent limit?"
    )
    assert "POLICY CONTEXT:" in formatted
    assert "[Page 2]: Room rent limit INR 5000" in formatted
    assert "What is the room rent limit?" in formatted
    assert "Rules:" in formatted

# 8. Citation generation
@patch("app.services.retrieval_service.retrieval_service.retrieve_relevant_chunks")
@patch("app.services.llm_service.llm_service.generate")
def test_citation_generation(mock_llm, mock_retrieve):
    mock_retrieve.return_value = [
        {
            "chunk_id": "ch-1",
            "page_number": 2,
            "section_title": "Room Rent Limits",
            "clause_id": "cl-1",
            "content": "Room Rent is ₹5,000/day.",
            "similarity": 0.88
        }
    ]
    mock_llm.return_value = "Your policy covers room rent up to ₹5,000 per day [Page 2]."

    res = rag_service.answer_question("pol-test-1", "What is room rent?")
    assert res["context_found"] is True
    assert len(res["citations"]) == 1
    citation = res["citations"][0]
    assert citation["page"] == 2
    assert citation["section"] == "Room Rent Limits"
    assert citation["clause_id"] == "cl-1"
    assert citation["chunk_id"] == "ch-1"

# 9. Ollama unavailable handling
@patch("httpx.Client.post")
def test_ollama_unavailable_handling(mock_post):
    import httpx
    mock_post.side_effect = httpx.ConnectError("Connection refused to 11434")

    with pytest.raises(OllamaServiceError) as exc_info:
        embedding_service.embed_text("Test question")
    assert "Local AI service is not running" in str(exc_info.value)

# 10. Unknown answer handling
@patch("app.services.retrieval_service.retrieval_service.retrieve_relevant_chunks")
def test_unknown_answer_handling(mock_retrieve):
    # Simulated empty retrieval for irrelevant query (e.g., "What is the capital of France?")
    mock_retrieve.return_value = []

    res = rag_service.answer_question("pol-test-1", "What is the capital of France?")
    assert res["context_found"] is False
    assert res["citations"] == []
    assert "does not establish the answer" in res["answer"]

# 11 & 12. Chat session creation & chat history API
@patch("app.services.rag_service.rag_service.answer_question")
def test_chat_session_creation_and_history(mock_rag):
    import uuid
    pol_id = f"pol-chat-{uuid.uuid4()}"
    db = SessionLocal()
    pol = Policy(
        id=pol_id,
        user_id="user-default-darpan",
        original_filename="Test.pdf",
        stored_filename="test.pdf",
        file_path="dummy.pdf",
        file_size=1024,
        processing_status="COMPLETED",
        policy_name="Care Shield Plus"
    )
    db.add(pol)
    db.commit()

    try:
        mock_rag.return_value = {
            "answer": "Your policy covers room rent up to ₹5,000 per day.",
            "citations": [{"page": 2, "section": "Room Rent", "clause_id": "c1", "chunk_id": "ch1"}],
            "retrieval_count": 1,
            "context_found": True
        }

        # 11. Send chat message without session_id (should auto-create session)
        chat_resp = client.post(
            "/api/chat",
            json={
                "policy_id": pol_id,
                "question": "What is the room rent limit?"
            }
        )
        assert chat_resp.status_code == 200
        data = chat_resp.json()["data"]
        session_id = data["session_id"]
        assert session_id is not None
        assert "₹5,000" in data["answer"]
        assert len(data["citations"]) == 1

        # 12. Retrieve chat history
        hist_resp = client.get(f"/api/chat/sessions/{session_id}")
        assert hist_resp.status_code == 200
        hist_data = hist_resp.json()["data"]
        assert hist_data["id"] == session_id
        assert len(hist_data["messages"]) == 2  # user + assistant
        assert hist_data["messages"][0]["role"] == "user"
        assert hist_data["messages"][1]["role"] == "assistant"
        assert len(hist_data["messages"][1]["citations"]) == 1
    finally:
        db.query(ChatMessage).filter(ChatMessage.session_id.in_(
            db.query(ChatSession.id).filter(ChatSession.policy_id == pol_id)
        )).delete(synchronize_session=False)
        db.query(ChatSession).filter(ChatSession.policy_id == pol_id).delete()
        db.query(Policy).filter(Policy.id == pol_id).delete()
        db.commit()
        db.close()

# 13. Unauthorized policy access
def test_unauthorized_policy_access():
    import uuid
    other_pol_id = f"pol-other-{uuid.uuid4()}"
    db = SessionLocal()
    try:
        # Policy belonging to other user
        other_pol = Policy(
            id=other_pol_id,
            user_id="user-someone-else",
            original_filename="Other.pdf",
            stored_filename="other.pdf",
            file_path="other.pdf",
            file_size=1024,
            processing_status="COMPLETED"
        )
        db.add(other_pol)
        db.commit()

        # Current user tries to chat against other user's policy
        resp = client.post(
            "/api/chat",
            json={"policy_id": other_pol_id, "question": "What is covered?"}
        )
        assert resp.status_code == 404
    finally:
        db.query(Policy).filter(Policy.id == other_pol_id).delete()
        db.commit()
        db.close()

# 14. Unauthorized session access
def test_unauthorized_session_access():
    import uuid
    sess_id = f"sess-other-{uuid.uuid4()}"
    temp_pol_id = f"pol-temp-{uuid.uuid4()}"
    db = SessionLocal()
    try:
        other_sess = ChatSession(
            id=sess_id,
            user_id="user-someone-else",
            policy_id=temp_pol_id,
            title="Secret Session"
        )
        db.add(other_sess)
        db.commit()

        resp = client.get(f"/api/chat/sessions/{sess_id}")
        assert resp.status_code == 404
    finally:
        db.query(ChatSession).filter(ChatSession.id == sess_id).delete()
        db.commit()
        db.close()
