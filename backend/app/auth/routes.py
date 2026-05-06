from flask import request, jsonify
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity,
)
from marshmallow import ValidationError
from app.auth import auth_bp
from app.auth.schemas import SignupSchema, LoginSchema
from app.extensions import db, bcrypt
from app.models.user import User


@auth_bp.route('/signup', methods=['POST'])
def signup():
    schema = SignupSchema()
    try:
        data = schema.load(request.get_json() or {})
    except ValidationError as e:
        return jsonify(error='Validation failed', message=e.messages), 422

    if User.query.filter_by(email=data['email']).first():
        return jsonify(error='Conflict', message='Email already registered'), 409

    user = User(
        name=data['name'],
        email=data['email'],
        password_hash=bcrypt.generate_password_hash(data['password']).decode('utf-8'),
    )
    db.session.add(user)
    db.session.commit()

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    return jsonify(
        data={
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': {'id': str(user.id), 'email': user.email, 'name': user.name, 'plan': user.plan},
        },
        message='Account created',
    ), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    schema = LoginSchema()
    try:
        data = schema.load(request.get_json() or {})
    except ValidationError as e:
        return jsonify(error='Validation failed', message=e.messages), 422

    user = User.query.filter_by(email=data['email']).first()
    if not user or not bcrypt.check_password_hash(user.password_hash, data['password']):
        return jsonify(error='Unauthorized', message='Incorrect email or password'), 401

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    return jsonify(
        data={
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': {'id': str(user.id), 'email': user.email, 'name': user.name, 'plan': user.plan},
        },
        message='Logged in',
    ), 200


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    access_token = create_access_token(identity=user_id)
    return jsonify(data={'access_token': access_token}, message='Token refreshed'), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if not user:
        return jsonify(error='Not found', message='User not found'), 404
    return jsonify(
        data={'id': str(user.id), 'email': user.email, 'name': user.name, 'plan': user.plan,
              'ens_name': user.ens_name, 'trial_ends_at': user.trial_ends_at.isoformat() if user.trial_ends_at else None},
        message='OK',
    ), 200


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    # Token blocklist can be implemented here with Redis if needed
    return jsonify(data=None, message='Logged out'), 200
