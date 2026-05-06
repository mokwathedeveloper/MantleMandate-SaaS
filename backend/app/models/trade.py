from app.models.base import BaseModel
from app.extensions import db


class Trade(BaseModel):
    __tablename__ = 'trades'

    agent_id = db.Column(db.String(36), db.ForeignKey('agents.id', ondelete='CASCADE'), nullable=False, index=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    mandate_id = db.Column(db.String(36), db.ForeignKey('mandates.id', ondelete='SET NULL'), nullable=True, index=True)
    asset_pair = db.Column(db.String(20), nullable=False)
    direction = db.Column(db.String(4), nullable=False)
    amount_usd = db.Column(db.Numeric(20, 6), nullable=False)
    price = db.Column(db.Numeric(20, 6), nullable=False)
    pnl = db.Column(db.Numeric(20, 6), nullable=True)
    protocol = db.Column(db.String(50), nullable=True)
    tx_hash = db.Column(db.String(66), nullable=True, index=True)
    block_number = db.Column(db.BigInteger, nullable=True)
    status = db.Column(db.String(20), nullable=False, default='pending', index=True)
    mandate_rule_applied = db.Column(db.Text, nullable=True)
    gas_used = db.Column(db.BigInteger, nullable=True)

    audit_logs = db.relationship('AuditLog', backref='trade', lazy='dynamic')

    def to_dict(self):
        return {
            'id': str(self.id),
            'agent_id': str(self.agent_id),
            'mandate_id': str(self.mandate_id) if self.mandate_id else None,
            'mandate_name': self.mandate.name if self.mandate else None,
            'asset_pair': self.asset_pair,
            'direction': self.direction,
            'amount_usd': float(self.amount_usd),
            'price': float(self.price),
            'pnl': float(self.pnl) if self.pnl is not None else None,
            'protocol': self.protocol,
            'tx_hash': self.tx_hash,
            'block_number': self.block_number,
            'status': self.status,
            'mandate_rule_applied': self.mandate_rule_applied,
            'created_at': self.created_at.isoformat(),
        }

    def __repr__(self):
        return f'<Trade {self.asset_pair} {self.direction} [{self.status}]>'
