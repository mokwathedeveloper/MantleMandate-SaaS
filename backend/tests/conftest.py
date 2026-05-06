import uuid
import pytest
from app import create_app
from app.extensions import db as _db


@pytest.fixture(scope='session')
def app():
    application = create_app('testing')
    with application.app_context():
        _db.create_all()
        yield application
        _db.drop_all()


@pytest.fixture(scope='function')
def client(app):
    return app.test_client()


@pytest.fixture(scope='function')
def db(app):
    yield _db
    _db.session.rollback()


@pytest.fixture(scope='function')
def auth_headers(client):
    email = f'testuser_{uuid.uuid4().hex[:8]}@mantlemandate.com'
    client.post('/api/auth/signup', json={
        'name': 'Test User',
        'email': email,
        'password': 'TestPass123!',
    })
    res = client.post('/api/auth/login', json={
        'email': email,
        'password': 'TestPass123!',
    })
    body = res.get_json()
    token = (body.get('data') or {}).get('access_token') or body.get('access_token')
    return {'Authorization': f'Bearer {token}'}
