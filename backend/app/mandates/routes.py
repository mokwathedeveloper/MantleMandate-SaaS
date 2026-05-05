from flask import jsonify
from flask_jwt_extended import jwt_required
from app.mandates import mandates_bp


@mandates_bp.route('', methods=['GET'])
@jwt_required()
def index():
    # TODO: implement
    return jsonify(data=[]), 200
