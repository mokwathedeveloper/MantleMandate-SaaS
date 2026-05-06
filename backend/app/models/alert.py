from app.models.base import BaseModel
from app.extensions import db


class Alert(BaseModel):
    __tablename__ = 'alerts'

    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    agent_id = db.Column(db.String(36), db.ForeignKey('agents.id', ondelete='SET NULL'), nullable=True)
    alert_type = db.Column(db.String(50), nullable=False, index=True)
    severity = db.Column(db.String(10), nullable=False, default='low')
    title = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text, nullable=True)
    is_read = db.Column(db.Boolean, nullable=False, default=False, index=True)

    def to_dict(self):
        return {
            'id': str(self.id),
            'agent_id': str(self.agent_id) if self.agent_id else None,
            'alert_type': self.alert_type,
            'severity': self.severity,
            'title': self.title,
            'message': self.message,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat(),
        }

    def __repr__(self):
        return f'<Alert {self.alert_type} [{self.severity}]>'
