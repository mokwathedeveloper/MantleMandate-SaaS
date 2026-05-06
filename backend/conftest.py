import pytest
from app import create_app
from app.extensions import db as _db


@pytest.fixture(scope='session')
def app():
    application = create_app('testing')
    ctx = application.app_context()
    ctx.push()
    _db.create_all()
    yield application
    _db.drop_all()
    ctx.pop()


@pytest.fixture()
def client(app):
    return app.test_client()


@pytest.fixture()
def auth_headers(client):
    """Sign up + log in, return JWT Authorization header."""
    import uuid
    email = f'testuser_{uuid.uuid4().hex[:8]}@example.com'
    client.post('/api/auth/signup', json={
        'name': 'Test User',
        'email': email,
        'password': 'Password1!',
    })
    resp = client.post('/api/auth/login', json={
        'email': email,
        'password': 'Password1!',
    })
    body = resp.get_json()
    token = body.get('data', {}).get('access_token') or body.get('access_token')
    return {'Authorization': f'Bearer {token}'}
