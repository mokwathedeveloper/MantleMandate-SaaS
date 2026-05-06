from sqlalchemy import JSON as JSONB
from app.models.base import BaseModel
from app.extensions import db


class Report(BaseModel):
    __tablename__ = 'reports'

    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    name = db.Column(db.String(255), nullable=False)
    report_type = db.Column(db.String(50), nullable=False)
    date_from = db.Column(db.Date, nullable=True)
    date_to = db.Column(db.Date, nullable=True)
    parameters = db.Column(JSONB, nullable=True, default=dict)
    file_url = db.Column(db.String(500), nullable=True)
    generated_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'report_type': self.report_type,
            'date_from': self.date_from.isoformat() if self.date_from else None,
            'date_to': self.date_to.isoformat() if self.date_to else None,
            'parameters': self.parameters,
            'file_url': self.file_url,
            'generated_at': self.generated_at.isoformat() if self.generated_at else None,
            'created_at': self.created_at.isoformat(),
        }

    def __repr__(self):
        return f'<Report {self.name}>'
