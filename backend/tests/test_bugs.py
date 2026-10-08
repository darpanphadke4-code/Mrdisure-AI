# backend/tests/test_bugs.py
import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models.user import User
from app.models.policy import Policy
from app.models.chat_session import ChatSession
from app.models.chat_message import ChatMessage
from app.models.report import Report

client = TestClient(app)

@pytest.fixture
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture
def test_user(db_session):
    user = db_session.query(User).filter(User.email == "darpan.patel@healthmail.com").first()
    if not user:
        user = User(
            id=str(uuid.uuid4()),
            name="Darpan Patel",
            email="darpan.patel@healthmail.com",
            password_hash="test_hash"
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
    return user

@pytest.fixture
def other_user(db_session):
    user = db_session.query(User).filter(User.email == "unauthorized@healthmail.com").first()
    if not user:
        user = User(
            id=str(uuid.uuid4()),
            name="Other User",
            email="unauthorized@healthmail.com",
            password_hash="test_hash"
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
    return user

@pytest.fixture
def test_policy(db_session, test_user):
    policy_id = f"pol-bug-test-{uuid.uuid4()}"
    policy = Policy(
        id=policy_id,
        user_id=test_user.id,
        original_filename="test_policy.pdf",
        stored_filename="test_policy.pdf",
        file_path="uploads/test_policy.pdf",
        file_type="application/pdf",
        file_size=1024,
        processing_status="COMPLETED",
        policy_name="MediSure Gold Protection"
    )
    db_session.add(policy)
    db_session.commit()
    db_session.refresh(policy)
    yield policy
    try:
        db_session.query(Report).filter(Report.policy_id == policy_id).delete()
        db_session.query(ChatMessage).filter(ChatMessage.session_id.in_(
            db_session.query(ChatSession.id).filter(ChatSession.policy_id == policy_id)
        )).delete(synchronize_session=False)
        db_session.query(ChatSession).filter(ChatSession.policy_id == policy_id).delete()
        db_session.query(Policy).filter(Policy.id == policy_id).delete()
        db_session.commit()
    except Exception:
        db_session.rollback()


# ========================================================
# BUG 1 TESTS: CHAT SESSION DELETION
# ========================================================

def test_authorized_chat_deletion(db_session, test_user, test_policy):
    """
    Verify an authorized user can delete their chat session,
    which deletes the session and associated messages, but keeps the policy.
    """
    session_id = f"sess-{uuid.uuid4()}"
    session = ChatSession(
        id=session_id,
        user_id=test_user.id,
        policy_id=test_policy.id,
        title="Inquiry on Coverage"
    )
    db_session.add(session)
    db_session.commit()

    # Add 2 messages to this session
    msg1 = ChatMessage(
        id=f"msg-{uuid.uuid4()}",
        session_id=session_id,
        role="user",
        content="Is laparoscopic surgery covered?"
    )
    msg2 = ChatMessage(
        id=f"msg-{uuid.uuid4()}",
        session_id=session_id,
        role="assistant",
        content="Yes, laparoscopic surgery is covered under Section 2."
    )
    db_session.add_all([msg1, msg2])
    db_session.commit()

    # Verify session and messages exist
    assert db_session.query(ChatSession).filter(ChatSession.id == session_id).count() == 1
    assert db_session.query(ChatMessage).filter(ChatMessage.session_id == session_id).count() == 2

    # Execute DELETE request
    response = client.delete(f"/api/chat/sessions/{session_id}")
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True
    assert res_data["data"]["session_id"] == session_id

    # Verify session and messages are deleted from database
    assert db_session.query(ChatSession).filter(ChatSession.id == session_id).count() == 0
    assert db_session.query(ChatMessage).filter(ChatMessage.session_id == session_id).count() == 0

    # Verify associated policy is NOT deleted
    assert db_session.query(Policy).filter(Policy.id == test_policy.id).count() == 1

def test_unauthorized_chat_deletion(db_session, other_user, test_policy):
    """
    Verify a user cannot delete another user's chat session (returns 403).
    """
    session_id = f"sess-other-{uuid.uuid4()}"
    # Session owned by other_user
    session = ChatSession(
        id=session_id,
        user_id=other_user.id,
        policy_id=test_policy.id,
        title="Other user session"
    )
    db_session.add(session)
    db_session.commit()

    # Client authenticates as test_user by default
    response = client.delete(f"/api/chat/sessions/{session_id}")
    assert response.status_code == 403
    assert "not authorized" in response.json()["detail"].lower()

    # Ensure session still exists in DB
    assert db_session.query(ChatSession).filter(ChatSession.id == session_id).count() == 1

def test_delete_nonexistent_chat_session():
    """
    Verify deleting a nonexistent session returns 404.
    """
    fake_id = f"nonexistent-sess-{uuid.uuid4()}"
    response = client.delete(f"/api/chat/sessions/{fake_id}")
    assert response.status_code == 404

# ========================================================
# BUG 2 TESTS: PERSISTENT ANALYSIS REPORTS
# ========================================================

def test_create_and_retrieve_report(db_session, test_user, test_policy):
    """
    Verify report creation persists to database and returns formatted DTO.
    """
    payload = {
        "reportName": "Cholecystectomy Cost Analysis",
        "policyId": test_policy.id,
        "policyName": test_policy.policy_name,
        "provider": "Care Health Insurance",
        "patientName": "Darpan Patel",
        "patientAge": 34,
        "diagnosis": "Acute Cholelithiasis",
        "hospitalName": "Apollo Multispeciality Hospital",
        "totalBilled": 250000,
        "estimatedInsurerShare": 210000,
        "estimatedPatientShare": 40000,
        "deductibleApplied": 15000,
        "status": "Completed"
    }

    # 1. Create Report
    response = client.post("/api/reports", json=payload)
    assert response.status_code == 201
    res_data = response.json()
    assert res_data["success"] is True
    report_id = res_data["data"]["id"]
    assert report_id is not None
    assert res_data["data"]["reportName"] == "Cholecystectomy Cost Analysis"
    assert res_data["data"]["totalBilled"] == 250000
    assert res_data["data"]["policyId"] == test_policy.id

    # 2. Verify in database
    db_report = db_session.query(Report).filter(Report.id == report_id).first()
    assert db_report is not None
    assert db_report.user_id == test_user.id
    assert db_report.policy_id == test_policy.id
    assert db_report.title == "Cholecystectomy Cost Analysis"

    # 3. Retrieve via GET /api/reports
    list_res = client.get("/api/reports")
    assert list_res.status_code == 200
    reports_list = list_res.json()["data"]
    assert any(r["id"] == report_id for r in reports_list)

    # 4. Retrieve single report by ID
    get_res = client.get(f"/api/reports/{report_id}")
    assert get_res.status_code == 200
    single_data = get_res.json()["data"]
    assert single_data["id"] == report_id
    assert single_data["patientName"] == "Darpan Patel"
    assert single_data["estimatedPatientShare"] == 40000

    # Cleanup
    db_session.query(Report).filter(Report.id == report_id).delete()
    db_session.commit()

def test_unauthorized_report_access(db_session, other_user, test_policy):
    """
    Verify user cannot view or delete another user's report (returns 403).
    """
    report_id = str(uuid.uuid4())
    other_report = Report(
        id=report_id,
        user_id=other_user.id,
        policy_id=test_policy.id,
        title="Confidential Report",
        report_type="claim_estimate",
        content={"secret": "data", "totalBilled": 500000}
    )
    db_session.add(other_report)
    db_session.commit()

    try:
        # Access by default user -> 403
        get_res = client.get(f"/api/reports/{report_id}")
        assert get_res.status_code == 403

        # Delete by default user -> 403
        del_res = client.delete(f"/api/reports/{report_id}")
        assert del_res.status_code == 403

        # Verify report is still in database
        assert db_session.query(Report).filter(Report.id == report_id).count() == 1
    finally:
        db_session.query(Report).filter(Report.id == report_id).delete()
        db_session.commit()

def test_delete_report_persisted(db_session, test_user, test_policy):
    """
    Verify deleting a report deletes the database record and does not delete policy.
    """
    report_id = str(uuid.uuid4())
    report = Report(
        id=report_id,
        user_id=test_user.id,
        policy_id=test_policy.id,
        title="Temporary Audit",
        report_type="claim_estimate",
        content={"reportName": "Temporary Audit", "totalBilled": 100000}
    )
    db_session.add(report)
    db_session.commit()

    # Delete request
    del_res = client.delete(f"/api/reports/{report_id}")
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True

    # Verify deleted from DB
    assert db_session.query(Report).filter(Report.id == report_id).count() == 0

    # Policy remains intact
    assert db_session.query(Policy).filter(Policy.id == test_policy.id).count() == 1

    # Second delete returns 404
    del_res_again = client.delete(f"/api/reports/{report_id}")
    assert del_res_again.status_code == 404
