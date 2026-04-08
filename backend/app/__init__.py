from flask import Flask
from flask_cors import CORS

from .config import Config
from .extensions import db, jwt
from .auth.routes import auth_bp
from .expenses.feed import feed_bp
from .expenses.fetch import fetch_bp


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    CORS(app, resources={r"/api/*": {"origins": "*"}})

    db.init_app(app)
    jwt.init_app(app)

    app.register_blueprint(auth_bp,  url_prefix="/api/auth")
    app.register_blueprint(feed_bp,  url_prefix="/api/expenses/feed")
    app.register_blueprint(fetch_bp, url_prefix="/api/expenses/fetch")

    with app.app_context():
        db.create_all()
        _seed_categories()

    return app


def _seed_categories():
    from .models import Category
    if Category.query.count() == 0:
        defaults = [
            Category(name="Food",          color="#f59e0b"),
            Category(name="Transport",     color="#3b82f6"),
            Category(name="Shopping",      color="#ec4899"),
            Category(name="Health",        color="#10b981"),
            Category(name="Entertainment", color="#8b5cf6"),
            Category(name="Utilities",     color="#64748b"),
            Category(name="Other",         color="#6366f1"),
        ]
        db.session.add_all(defaults)
        db.session.commit()
