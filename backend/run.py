import os
from app import create_app
from app.extensions import db, socketio

config_name = os.environ.get('FLASK_ENV', 'local')
app = create_app(config_name)

# Auto-create tables when running locally without migrations
if config_name in ('local', 'testing'):
    with app.app_context():
        db.create_all()

if __name__ == '__main__':
    socketio.run(app, debug=(config_name != 'production'), host='0.0.0.0', port=5000)
