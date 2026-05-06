from app.models.base import BaseModel
from app.extensions import db


class Wallet(BaseModel):
    __tablename__ = 'wallets'

    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    address = db.Column(db.String(42), nullable=False)
    network = db.Column(db.String(50), nullable=False, default='mantle')
    is_primary = db.Column(db.Boolean, nullable=False, default=False)
    connected_at = db.Column(db.DateTime, nullable=False, default=db.func.now())

    agents = db.relationship('Agent', backref='wallet', lazy='dynamic')

    def to_dict(self):
        return {
            'id': str(self.id),
            'address': self.address,
            'network': self.network,
            'is_primary': self.is_primary,
            'connected_at': self.connected_at.isoformat(),
        }

    def __repr__(self):
        return f'<Wallet {self.address[:10]}...>'
