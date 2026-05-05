from flask import request, jsonify
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity,
)
from app.auth import auth_bp
from app.extensions import db, bcrypt
from app.models.user import User


@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    # TODO: marshmallow schema validation
    if User.query.filter_by(email=data['email']).first():
        return jsonify(error='Email already registered'), 409

    user = User(
        email=data['email'],
        name=data['name'],
        password_hash=bcrypt.generate_password_hash(data['password']).decode('utf-8'),
    )
    db.session.add(user)
    db.session.commit()

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    return jsonify(access_token=access_token, refresh_token=refresh_token, user_id=str(user.id)), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()

    if not user or not bcrypt.check_password_hash(user.password_hash, data['password']):
        return jsonify(error='Invalid credentials'), 401

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    return jsonify(access_token=access_token, refresh_token=refresh_token), 200


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    access_token = create_access_token(identity=user_id)
    return jsonify(access_token=access_token), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify(error='User not found'), 404
    return jsonify(id=str(user.id), email=user.email, name=user.name, plan=user.plan), 200
