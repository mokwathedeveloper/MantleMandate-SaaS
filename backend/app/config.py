import os
from datetime import timedelta
from sqlalchemy.pool import StaticPool


class BaseConfig:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:3000').split(',')


class DevelopmentConfig(BaseConfig):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        'postgresql://mantlemandate:devpassword@localhost:5432/mantlemandate'
    )
    REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
    CELERY_BROKER_URL = REDIS_URL
    CELERY_RESULT_BACKEND = REDIS_URL


class ProductionConfig(BaseConfig):
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    REDIS_URL = os.environ.get('REDIS_URL')
    CELERY_BROKER_URL = REDIS_URL
    CELERY_RESULT_BACKEND = REDIS_URL


class TestingConfig(BaseConfig):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:////tmp/mantlemandate_test.db'
    SQLALCHEMY_ENGINE_OPTIONS = {'connect_args': {'check_same_thread': False}}
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(seconds=300)
    CELERY_TASK_ALWAYS_EAGER = True
    OPENROUTER_API_KEY = os.environ.get('ANTHROPIC_API_KEY', 'test-key')
    BYBIT_API_KEY = os.environ.get('BYBIT_API_KEY', 'test-key')
    BYBIT_SECRET = os.environ.get('BYBIT_SECRET', 'test-secret')
    MANTLE_RPC_URL = os.environ.get('MANTLE_RPC_URL', 'http://localhost:8545')


_LOCAL_DB = 'sqlite:///' + os.path.abspath(
    os.path.join(os.path.dirname(__file__), '..', 'mantlemandate_local.db')
)


class LocalConfig(BaseConfig):
    """SQLite + no Redis — runs without Docker for local development."""
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = _LOCAL_DB
    SQLALCHEMY_ENGINE_OPTIONS = {'connect_args': {'check_same_thread': False}}
    CELERY_TASK_ALWAYS_EAGER = True
    CELERY_BROKER_URL = 'memory://'
    CELERY_RESULT_BACKEND = 'cache+memory://'
    OPENROUTER_API_KEY = os.environ.get('ANTHROPIC_API_KEY', '')
    BYBIT_API_KEY = os.environ.get('BYBIT_API_KEY', '')
    BYBIT_SECRET = os.environ.get('BYBIT_SECRET', '')


config = {
    'development': DevelopmentConfig,
    'local': LocalConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': LocalConfig,
}
