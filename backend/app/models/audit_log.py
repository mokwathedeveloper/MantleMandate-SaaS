from sqlalchemy import JSON as JSONB
from app.models.base import BaseModel
from app.extensions import db


class AuditLog(BaseModel):
    __tablename__ = 'audit_logs'

    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    agent_id = db.Column(db.String(36), db.ForeignKey('agents.id', ondelete='CASCADE'), nullable=True, index=True)
    trade_id = db.Column(db.String(36), db.ForeignKey('trades.id', ondelete='SET NULL'), nullable=True, index=True)
    event_type = db.Column(db.String(50), nullable=False, index=True)
    decision_hash = db.Column(db.String(66), nullable=True)
    tx_hash = db.Column(db.String(66), nullable=True, index=True)
    block_number = db.Column(db.BigInteger, nullable=True)
    details = db.Column(JSONB, nullable=True, default=dict)

    def to_dict(self):
        return {
            'id': str(self.id),
            'agent_id': str(self.agent_id) if self.agent_id else None,
            'trade_id': str(self.trade_id) if self.trade_id else None,
            'event_type': self.event_type,
            'decision_hash': self.decision_hash,
            'tx_hash': self.tx_hash,
            'block_number': self.block_number,
            'details': self.details,
            'created_at': self.created_at.isoformat(),
        }

    def __repr__(self):
        return f'<AuditLog {self.event_type}>'
