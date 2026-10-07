# backend/app/routes/chat.py
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.policy import Policy
from app.models.chat_session import ChatSession
from app.models.chat_message import ChatMessage
from app.routes.policies import get_current_user
from app.schemas.policy import StandardResponse
from app.schemas.chat import (
    ChatRequest,
    ChatResponseData,
    ChatSessionDTO,
    ChatMessageDTO,
    CitationItem,
    AIHealthDTO
)
from app.services.embedding_service import embedding_service, OllamaServiceError
from app.services.llm_service import llm_service
from app.services.rag_service import rag_service
from app.config import settings

logger = logging.getLogger("medisure.chat")

router = APIRouter(prefix="/api", tags=["chat"])

@router.get("/ai/health", response_model=StandardResponse)
def get_ai_health():
    """
    Check availability of local Ollama instance and configured models.
    """
    ollama_ok = embedding_service.is_available() and llm_service.is_available()
    data = AIHealthDTO(
        ollama_available=ollama_ok,
        llm_model=settings.OLLAMA_LLM_MODEL,
        embedding_model=settings.OLLAMA_EMBEDDING_MODEL,
        base_url=settings.OLLAMA_BASE_URL
    )
    return StandardResponse(
        success=True,
        data=data.model_dump(),
        message="AI health status checked"
    )

@router.post("/chat", response_model=StandardResponse)
def chat_with_policy(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Ask a question against a specific policy using local RAG.
    Enforces user authorization and strict policy isolation.
    """
    # 1. Authorize policy access
    policy = db.query(Policy).filter(
        Policy.id == payload.policy_id,
        Policy.user_id == current_user.id
    ).first()
    if not policy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Policy '{payload.policy_id}' not found or access denied."
        )

    # 2. Get or create chat session
    session = None
    if payload.session_id:
        session = db.query(ChatSession).filter(
            ChatSession.id == payload.session_id,
            ChatSession.user_id == current_user.id
        ).first()
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Chat session '{payload.session_id}' not found or access denied."
            )
        # Ensure session matches policy
        if session.policy_id != policy.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Session belongs to a different policy. Cross-policy mixing is forbidden."
            )

    if not session:
        session_title = f"{policy.policy_name or 'Policy'} Consultation"
        session = ChatSession(
            user_id=current_user.id,
            policy_id=policy.id,
            title=session_title[:250]
        )
        db.add(session)
        db.flush()

    # 3. Store user message in DB
    user_msg = ChatMessage(
        session_id=session.id,
        role="user",
        content=payload.question.strip()
    )
    db.add(user_msg)
    db.flush()

    # 4. Generate grounded RAG answer
    try:
        rag_result = rag_service.answer_question(
            policy_id=policy.id,
            question=payload.question
        )
    except OllamaServiceError as err:
        logger.warning(f"Ollama unavailable during chat: {err}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(err)
        )
    except Exception as err:
        logger.error(f"Error generating RAG answer: {err}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate answer: {str(err)}"
        )

    answer_text = rag_result.get("answer", "")
    citations_data = rag_result.get("citations", [])

    # 5. Store assistant message with citations in DB
    assistant_msg = ChatMessage(
        session_id=session.id,
        role="assistant",
        content=answer_text,
        citations_json=citations_data
    )
    db.add(assistant_msg)
    db.commit()

    response_data = ChatResponseData(
        session_id=session.id,
        policy_id=policy.id,
        answer=answer_text,
        citations=[CitationItem(**c) for c in citations_data],
        context_found=rag_result.get("context_found", True)
    )

    return StandardResponse(
        success=True,
        data=response_data.model_dump(),
        message="Assistant response generated successfully"
    )

@router.get("/chat/sessions/{session_id}", response_model=StandardResponse)
def get_chat_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve full chat history for a session owned by the authenticated user.
    """
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found or access denied."
        )

    messages = db.query(ChatMessage).filter(
        ChatMessage.session_id == session_id
    ).order_by(ChatMessage.created_at).all()

    formatted_messages = []
    for m in messages:
        citations = []
        if m.citations_json and isinstance(m.citations_json, list):
            citations = [CitationItem(**c) for c in m.citations_json]

        formatted_messages.append(
            ChatMessageDTO(
                id=m.id,
                session_id=m.session_id,
                role=m.role,
                content=m.content,
                citations=citations,
                created_at=m.created_at
            ).model_dump()
        )

    dto = {
        "id": session.id,
        "user_id": session.user_id,
        "policy_id": session.policy_id,
        "title": session.title,
        "created_at": session.created_at.isoformat(),
        "updated_at": session.updated_at.isoformat(),
        "messages": formatted_messages
    }

    return StandardResponse(
        success=True,
        data=dto,
        message="Chat session retrieved"
    )

@router.get("/chat/sessions", response_model=StandardResponse)
def list_chat_sessions(
    policy_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List chat sessions for the current user, optionally filtered by policy_id.
    """
    query = db.query(ChatSession).filter(ChatSession.user_id == current_user.id)
    if policy_id:
        query = query.filter(ChatSession.policy_id == policy_id)

    sessions = query.order_by(ChatSession.updated_at.desc()).all()
    result = []
    for s in sessions:
        last_msg = db.query(ChatMessage).filter(
            ChatMessage.session_id == s.id
        ).order_by(ChatMessage.created_at.desc()).first()

        result.append({
            "id": s.id,
            "policy_id": s.policy_id,
            "title": s.title,
            "updated_at": s.updated_at.isoformat(),
            "created_at": s.created_at.isoformat(),
            "last_message": last_msg.content[:100] if last_msg else None
        })

    return StandardResponse(
        success=True,
        data=result,
        message=f"Retrieved {len(result)} chat sessions"
    )
