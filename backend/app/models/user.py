from app.models.base import BaseModel
from app.extensions import db


class User(BaseModel):
    __tablename__ = 'users'

    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    name = db.Column(db.String(100), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    plan = db.Column(db.String(50), nullable=False, default='operator')
    trial_ends_at = db.Column(db.DateTime, nullable=True)
    ens_name = db.Column(db.String(255), nullable=True)

    mandates = db.relationship('Mandate', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    agents = db.relationship('Agent', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    wallets = db.relationship('Wallet', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    alerts = db.relationship('Alert', backref='user', lazy='dynamic', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<User {self.email}>'
