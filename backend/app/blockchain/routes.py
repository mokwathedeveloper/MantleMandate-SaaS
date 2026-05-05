from flask import jsonify
from flask_jwt_extended import jwt_required
from app.blockchain import blockchain_bp


@blockchain_bp.route('', methods=['GET'])
@jwt_required()
def index():
    # TODO: implement
    return jsonify(data=[]), 200
