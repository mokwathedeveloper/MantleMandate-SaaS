from flask import Blueprint

mandates_bp = Blueprint('mandates', __name__)

from app.mandates import routes  # noqa: E402, F401
