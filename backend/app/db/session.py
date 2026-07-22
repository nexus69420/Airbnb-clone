"""
Database engine and session factory.

Why this file exists:
  Centralizes DB connection setup. Routers receive sessions via get_db()
  dependency injection — never instantiate sessions ad hoc.
"""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings

settings = get_settings()

# check_same_thread=False is required for SQLite + FastAPI async workers.
connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}

engine = create_engine(
    settings.database_url,
    connect_args=connect_args,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """
    Yield a request-scoped database session.

    Input: none (FastAPI Depends)
    Output: SQLAlchemy Session, always closed after the request
    Reasoning: Prevents connection leaks and keeps transaction boundaries per request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
