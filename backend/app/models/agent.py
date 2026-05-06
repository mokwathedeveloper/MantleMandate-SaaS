from app.models.base import BaseModel
from app.extensions import db


class Agent(BaseModel):
    __tablename__ = 'agents'

    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    mandate_id = db.Column(db.String(36), db.ForeignKey('mandates.id', ondelete='SET NULL'), nullable=True, index=True)
    wallet_id = db.Column(db.String(36), db.ForeignKey('wallets.id', ondelete='SET NULL'), nullable=True)
    name = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='inactive', index=True)
    capital_cap = db.Column(db.Numeric(20, 2), nullable=True)
    deployed_at = db.Column(db.DateTime, nullable=True)
    last_trade_at = db.Column(db.DateTime, nullable=True)
    total_pnl = db.Column(db.Numeric(20, 6), nullable=False, default=0)
    total_roi = db.Column(db.Numeric(10, 6), nullable=False, default=0)
    total_volume = db.Column(db.Numeric(20, 2), nullable=False, default=0)
    drawdown_current = db.Column(db.Numeric(10, 6), nullable=False, default=0)
    celery_task_id = db.Column(db.String(255), nullable=True)

    trades = db.relationship('Trade', backref='agent', lazy='dynamic', cascade='all, delete-orphan')
    audit_logs = db.relationship('AuditLog', backref='agent', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': str(self.id),
            'mandate_id': str(self.mandate_id) if self.mandate_id else None,
            'mandate_name': self.mandate.name if self.mandate else None,
            'name': self.name,
            'status': self.status,
            'capital_cap': float(self.capital_cap) if self.capital_cap else None,
            'total_pnl': float(self.total_pnl),
            'total_roi': float(self.total_roi),
            'total_volume': float(self.total_volume),
            'drawdown_current': float(self.drawdown_current),
            'deployed_at': self.deployed_at.isoformat() if self.deployed_at else None,
            'last_trade_at': self.last_trade_at.isoformat() if self.last_trade_at else None,
            'created_at': self.created_at.isoformat(),
        }

    def __repr__(self):
        return f'<Agent {self.name} [{self.status}]>'
