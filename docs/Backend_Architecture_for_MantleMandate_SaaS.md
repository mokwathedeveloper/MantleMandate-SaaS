# Backend Architecture — MantleMandate
## Stack: Flask (Python) · PostgreSQL · Redis · Celery · Flask-SocketIO

> **Backend language is Python/Flask — NOT Node.js/Express.**
> For the complete stack reference see `MASTER_Architecture_and_Stack.md`.

---

## 1. FLASK APPLICATION STRUCTURE

The Flask backend uses the **Application Factory pattern** with **Blueprints** for modularity.

```
backend/
├── app/
│   ├── __init__.py          # create_app() factory function
│   ├── extensions.py        # db, jwt, migrate, cors, socketio, bcrypt, limiter
│   ├── config.py            # DevelopmentConfig, ProductionConfig, TestingConfig
│   ├── auth/                # Authentication blueprint
│   ├── mandates/            # Mandates blueprint
│   ├── agents/              # Agents blueprint
│   ├── trades/              # Trades & audit blueprint
│   ├── reports/             # Reports blueprint
│   ├── alerts/              # Alerts & WebSocket blueprint
│   ├── blockchain/          # web3.py + contract interaction
│   └── models/              # Shared SQLAlchemy base models
├── ai/                      # AI service layer (Python)
├── migrations/              # Flask-Migrate (Alembic) — NOT manual SQL
├── tests/                   # pytest test suite
├── celery_worker.py
├── run.py
├── requirements.txt
└── .env
```

---

## 2. USER AUTHENTICATION AND AUTHORIZATION

### Technology
- **Flask-JWT-Extended** — JWT access tokens (15 min) + refresh tokens (30 days)
- **flask-bcrypt** — password hashing (bcrypt, NOT md5 or sha)
- **httpOnly cookies** — store refresh token (prevents XSS)

### Endpoints
```
POST /api/auth/signup          # Register new user
POST /api/auth/login           # Login → access_token + refresh_token
POST /api/auth/logout          # Invalidate refresh token
POST /api/auth/refresh         # Use refresh token to get new access token
GET  /api/auth/me              # Get authenticated user profile
```

### Python Implementation Pattern
```python
# backend/app/auth/routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from app.extensions import db, bcrypt
from app.models.user import User
from app.auth.schemas import SignupSchema, LoginSchema
from marshmallow import ValidationError

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/signup', methods=['POST'])
def signup():
    schema = SignupSchema()
    try:
        data = schema.load(request.get_json())
    except ValidationError as e:
        return jsonify(error='Validation failed', message=e.messages), 422

    if User.query.filter_by(email=data['email']).first():
        return jsonify(error='Email already registered'), 409

    password_hash = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    user = User(name=data['name'], email=data['email'], password_hash=password_hash)
    db.session.add(user)
    db.session.commit()

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    return jsonify(access_token=access_token, refresh_token=refresh_token, user=user.to_dict()), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    schema = LoginSchema()
    try:
        data = schema.load(request.get_json())
    except ValidationError as e:
        return jsonify(error='Validation failed', message=e.messages), 422

    user = User.query.filter_by(email=data['email']).first()
    if not user or not bcrypt.check_password_hash(user.password_hash, data['password']):
        return jsonify(error='Invalid email or password'), 401

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    return jsonify(access_token=access_token, refresh_token=refresh_token, user=user.to_dict()), 200
```

### Database Schema (PostgreSQL via SQLAlchemy)
```python
# backend/app/models/user.py
from app.extensions import db
import uuid

class User(db.Model):
    __tablename__ = 'users'
    id            = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email         = db.Column(db.String(255), unique=True, nullable=False)
    name          = db.Column(db.String(100), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    plan          = db.Column(db.String(50), default='operator')
    trial_ends_at = db.Column(db.DateTime, nullable=True)
    created_at    = db.Column(db.DateTime, default=db.func.now())
    updated_at    = db.Column(db.DateTime, default=db.func.now(), onupdate=db.func.now())
    mandates      = db.relationship('Mandate', backref='user', lazy='dynamic')
    wallets       = db.relationship('Wallet', backref='user', lazy='dynamic')

    def to_dict(self):
        return {
            'id': str(self.id),
            'email': self.email,
            'name': self.name,
            'plan': self.plan,
            'createdAt': self.created_at.isoformat()
        }
```

---

## 3. MANDATE CREATION AND AI AGENT DEPLOYMENT

### Endpoints
```
GET    /api/mandates              # List user's mandates
POST   /api/mandates              # Create mandate
GET    /api/mandates/<id>         # Get single mandate
PUT    /api/mandates/<id>         # Update mandate
DELETE /api/mandates/<id>         # Delete mandate
POST   /api/mandates/<id>/parse   # Parse plain-English → structured policy
GET    /api/mandates/<id>/hash    # Get on-chain policy hash
```

### Plain-English Mandate Parsing (AI Layer — Python)
```python
# backend/ai/mandate_parser.py
from typing import Dict, Any

def parse_mandate(mandate_text: str) -> Dict[str, Any]:
    """
    Parse plain-English mandate text into a structured policy dict.
    Uses NLP + rule-based extraction.
    Returns structured policy that can be compiled to an on-chain hash.
    """
    # NLP extraction of: asset, trigger, risk_per_trade, take_profit, schedule, venue
    policy = {
        'asset': extract_asset(mandate_text),
        'trigger': extract_trigger(mandate_text),
        'risk_per_trade_pct': extract_risk(mandate_text),
        'take_profit_pct': extract_take_profit(mandate_text),
        'schedule': extract_schedule(mandate_text),
        'venue': 'auto'  # default: best-price routing
    }
    return policy

def generate_policy_hash(policy: Dict[str, Any]) -> str:
    """Compute deterministic SHA-256 hash of the policy dict for on-chain registration."""
    import hashlib, json
    policy_str = json.dumps(policy, sort_keys=True)
    return '0x' + hashlib.sha256(policy_str.encode()).hexdigest()
```

### Agent Deployment (Celery Task)
```python
# backend/app/agents/executor.py
from celery import shared_task
from app.extensions import db
from app.models.agent import Agent

@shared_task(bind=True, max_retries=3)
def run_agent_loop(self, agent_id: str):
    """Celery background task that runs the AI agent trading loop."""
    agent = Agent.query.get(agent_id)
    if not agent or agent.status != 'active':
        return
    # 1. Fetch market data from Bybit (read-only)
    # 2. Run AI model to get trading signal
    # 3. Check mandate policy (risk limits, drawdown, cooldown)
    # 4. If signal passes all checks → execute trade on Mantle via web3.py
    # 5. Log trade to DB
    # 6. Push SocketIO alert to user
    # 7. Repeat
```

---

## 4. DATABASE MANAGEMENT

### Using Flask-Migrate (NOT raw SQL migrations)
```bash
# Initialize (run once)
flask db init

# After changing SQLAlchemy models, create a migration
flask db migrate -m "add wallet table"

# Apply migration to database
flask db upgrade

# Rollback one migration
flask db downgrade
```

**Never write raw `CREATE TABLE` SQL by hand.** Define SQLAlchemy models → let Flask-Migrate generate the SQL.

---

## 5. REAL-TIME DATA (Flask-SocketIO)

### Server-side (Flask)
```python
# backend/app/alerts/emitter.py
from app.extensions import socketio

def emit_trade_executed(user_id: str, trade: dict):
    socketio.emit('trade:executed', trade, room=f'user_{user_id}')

def emit_agent_status(user_id: str, agent_id: str, status: str):
    socketio.emit('agent:status', {'agentId': agent_id, 'status': status}, room=f'user_{user_id}')

def emit_alert(user_id: str, alert: dict):
    socketio.emit('alert:new', alert, room=f'user_{user_id}')
```

### Client-side (Next.js TypeScript)
```typescript
// frontend/hooks/useAlerts.ts
import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAlertStore } from '@/store/alertStore';

export function useAlerts(token: string) {
  const addAlert = useAlertStore((s) => s.addAlert);

  useEffect(() => {
    const socket: Socket = io(process.env.NEXT_PUBLIC_WS_URL!, {
      auth: { token }
    });

    socket.on('alert:new', (alert) => addAlert(alert));
    socket.on('trade:executed', (trade) => addAlert({ ...trade, type: 'trade_executed' }));

    return () => { socket.disconnect(); };
  }, [token]);
}
```

---

## 6. BLOCKCHAIN INTERACTION (web3.py — Python)

```python
# backend/app/blockchain/mantle.py
from web3 import Web3
import os

def get_mantle_connection() -> Web3:
    """Connect to Mantle Network RPC."""
    rpc_url = os.getenv('MANTLE_RPC_URL', 'https://rpc.mantle.xyz')
    w3 = Web3(Web3.HTTPProvider(rpc_url))
    assert w3.is_connected(), "Cannot connect to Mantle Network"
    return w3

def register_policy_on_chain(policy_hash: str, wallet_address: str) -> str:
    """Register a mandate policy hash on Mantle Network. Returns TX hash."""
    w3 = get_mantle_connection()
    # Load MandatePolicy contract ABI
    # Build and sign transaction
    # Return tx_hash
    ...
```

---

## 7. SECURITY

| Concern | Solution |
|---------|----------|
| Authentication | Flask-JWT-Extended (access + refresh tokens) |
| Password storage | flask-bcrypt (bcrypt, cost factor 12) |
| Transport | TLS/HTTPS enforced in production (Nginx) |
| CORS | Flask-CORS, restrict to frontend domain only |
| Rate limiting | Flask-Limiter (e.g. 5 login attempts / minute) |
| SQL injection | SQLAlchemy ORM (parameterized queries, never raw string concat) |
| Secrets | python-dotenv `.env` file, never hardcoded |
| API authorization | `@jwt_required()` decorator on all protected routes |
| Private keys | Never stored in DB, only in `.env`, used in-memory only |

---

## 8. TESTING (pytest — NOT Mocha/Chai)

```bash
cd backend
source venv/bin/activate
pytest tests/ -v --cov=app
```

```python
# backend/tests/conftest.py
import pytest
from app import create_app
from app.extensions import db as _db

@pytest.fixture(scope='session')
def app():
    app = create_app('testing')
    with app.app_context():
        _db.create_all()
        yield app
        _db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def auth_token(client):
    client.post('/api/auth/signup', json={
        'name': 'Test', 'email': 'test@test.com', 'password': 'Test1234!'
    })
    res = client.post('/api/auth/login', json={
        'email': 'test@test.com', 'password': 'Test1234!'
    })
    return res.json['access_token']
```

---

## 9. DEPLOYMENT

```
Production:
  Frontend  → Vercel (automatic Next.js deploy)
  Backend   → Railway or Render (Flask + Gunicorn + Gevent)
  DB        → Supabase or AWS RDS (PostgreSQL)
  Cache     → Upstash Redis
  Workers   → Celery workers on same Railway/Render service
  S3        → AWS S3 (exported reports)

Gunicorn command:
  gunicorn -k geventwebsocket.gunicorn.workers.GeventWebSocketWorker \
           -w 1 -b 0.0.0.0:5000 "app:create_app()"
```

> **Note on Gunicorn workers**: Flask-SocketIO requires `gevent` or `eventlet` for WebSocket support. Use `-w 1` (single worker) with gevent async.
