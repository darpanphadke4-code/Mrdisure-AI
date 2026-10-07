# backend/app/database.py
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

logger = logging.getLogger("medisure.database")

Base = declarative_base()

def get_engine():
    db_url = settings.DATABASE_URL
    try:
        if db_url.startswith("sqlite"):
            return create_engine(
                db_url,
                connect_args={"check_same_thread": False}
            )
        else:
            return create_engine(
                db_url,
                pool_pre_ping=True,
                pool_size=10,
                max_overflow=20
            )
    except Exception as exc:
        logger.warning(
            f"Failed to initialize database with URL '{db_url}': {exc}. "
            "Falling back to local SQLite database."
        )
        return create_engine(
            "sqlite:///./medisure.db",
            connect_args={"check_same_thread": False}
        )

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    # Import all models to ensure they are registered with Base metadata
    import app.models  # noqa: F401
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables verified and initialized successfully.")
