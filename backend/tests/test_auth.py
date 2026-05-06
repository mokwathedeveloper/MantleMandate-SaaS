"""Tests for /api/auth/* endpoints."""
import pytest


class TestSignup:
    def test_signup_success(self, client):
        resp = client.post('/api/auth/signup', json={
            'name': 'Alice',
            'email': 'alice@example.com',
            'password': 'Password1!',
        })
        assert resp.status_code == 201
        data = resp.get_json()
        assert 'access_token' in data['data']
        assert 'refresh_token' in data['data']
        assert data['data']['user']['email'] == 'alice@example.com'

    def test_signup_duplicate_email(self, client):
        payload = {'name': 'Bob', 'email': 'bob@example.com', 'password': 'Password1!'}
        client.post('/api/auth/signup', json=payload)
        resp = client.post('/api/auth/signup', json=payload)
        assert resp.status_code == 409

    def test_signup_missing_fields(self, client):
        resp = client.post('/api/auth/signup', json={'email': 'bad@example.com'})
        assert resp.status_code == 422

    def test_signup_invalid_email(self, client):
        resp = client.post('/api/auth/signup', json={
            'name': 'Charlie', 'email': 'not-an-email', 'password': 'Password1!'
        })
        assert resp.status_code == 422

    def test_signup_short_password(self, client):
        resp = client.post('/api/auth/signup', json={
            'name': 'Dave', 'email': 'dave@example.com', 'password': 'abc'
        })
        assert resp.status_code == 422


class TestLogin:
    def test_login_success(self, client):
        client.post('/api/auth/signup', json={
            'name': 'Eve', 'email': 'eve@example.com', 'password': 'Password1!'
        })
        resp = client.post('/api/auth/login', json={
            'email': 'eve@example.com', 'password': 'Password1!'
        })
        assert resp.status_code == 200
        assert 'access_token' in resp.get_json()['data']

    def test_login_wrong_password(self, client):
        client.post('/api/auth/signup', json={
            'name': 'Frank', 'email': 'frank@example.com', 'password': 'Password1!'
        })
        resp = client.post('/api/auth/login', json={
            'email': 'frank@example.com', 'password': 'WrongPassword1!'
        })
        assert resp.status_code == 401

    def test_login_unknown_user(self, client):
        resp = client.post('/api/auth/login', json={
            'email': 'nobody@example.com', 'password': 'Password1!'
        })
        assert resp.status_code == 401

    def test_login_missing_fields(self, client):
        resp = client.post('/api/auth/login', json={'email': 'x@x.com'})
        assert resp.status_code == 422


class TestMe:
    def test_me_authenticated(self, client, auth_headers):
        resp = client.get('/api/auth/me', headers=auth_headers)
        assert resp.status_code == 200
        assert 'email' in resp.get_json()['data']

    def test_me_unauthenticated(self, client):
        resp = client.get('/api/auth/me')
        assert resp.status_code == 401


class TestLogout:
    def test_logout_success(self, client, auth_headers):
        resp = client.post('/api/auth/logout', headers=auth_headers)
        assert resp.status_code in (200, 204)
