from sqlalchemy import JSON as JSONB
from app.models.base import BaseModel
from app.extensions import db


class Mandate(BaseModel):
    __tablename__ = 'mandates'

    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    name = db.Column(db.String(255), nullable=False)
    mandate_text = db.Column(db.Text, nullable=False)
    parsed_policy = db.Column(JSONB, nullable=True)
    policy_hash = db.Column(db.String(66), nullable=True, index=True)
    base_currency = db.Column(db.String(10), nullable=False, default='USDC')
    strategy_type = db.Column(db.String(50), nullable=True)
    risk_params = db.Column(JSONB, nullable=True, default=dict)
    capital_cap = db.Column(db.Numeric(20, 2), nullable=True)
    status = db.Column(db.String(20), nullable=False, default='draft', index=True)
    on_chain_tx = db.Column(db.String(66), nullable=True)

    agents = db.relationship('Agent', backref='mandate', lazy='dynamic')
    trades = db.relationship('Trade', backref='mandate', lazy='dynamic')

    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'mandate_text': self.mandate_text,
            'parsed_policy': self.parsed_policy,
            'policy_hash': self.policy_hash,
            'base_currency': self.base_currency,
            'strategy_type': self.strategy_type,
            'risk_params': self.risk_params,
            'capital_cap': float(self.capital_cap) if self.capital_cap else None,
            'status': self.status,
            'on_chain_tx': self.on_chain_tx,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
        }

    def __repr__(self):
        return f'<Mandate {self.name} [{self.status}]>'
