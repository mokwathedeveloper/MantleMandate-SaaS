import uuid
from sqlalchemy import String
from app.extensions import db


def _uuid_col():
    """Use String(36) for SQLite compatibility; UUID for PostgreSQL."""
    from sqlalchemy import inspect as _inspect
    return db.Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )


class BaseModel(db.Model):
    __abstract__ = True

    id = db.Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = db.Column(db.DateTime, nullable=False, default=db.func.now())
    updated_at = db.Column(db.DateTime, nullable=False, default=db.func.now(), onupdate=db.func.now())
