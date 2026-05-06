from flask import Flask
from dotenv import load_dotenv
from app.extensions import db, jwt, migrate, cors, socketio, limiter, bcrypt
from app.config import config

load_dotenv()


def create_app(config_name: str = 'default') -> Flask:
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app, origins=app.config['CORS_ORIGINS'])
    socketio.init_app(app)
    limiter.init_app(app)
    bcrypt.init_app(app)

    from app.auth import auth_bp
    from app.mandates import mandates_bp
    from app.agents import agents_bp
    from app.trades import trades_bp
    from app.reports import reports_bp
    from app.alerts import alerts_bp
    from app.blockchain import blockchain_bp
    from app.portfolio import portfolio_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(mandates_bp, url_prefix='/api/mandates')
    app.register_blueprint(agents_bp, url_prefix='/api/agents')
    app.register_blueprint(trades_bp, url_prefix='/api/trades')
    app.register_blueprint(reports_bp, url_prefix='/api/reports')
    app.register_blueprint(alerts_bp, url_prefix='/api/alerts')
    app.register_blueprint(blockchain_bp, url_prefix='/api/blockchain')
    app.register_blueprint(portfolio_bp, url_prefix='/api/portfolio')

    @app.route('/api/health')
    def health():
        return {'status': 'ok', 'service': 'mantlemandate-backend'}, 200

    return app
