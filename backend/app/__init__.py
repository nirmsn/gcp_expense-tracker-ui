import os

from flask import Flask
from flask_cors import CORS
from flasgger import Swagger

from .config import Config
from .extensions import db, jwt
from .auth.routes import auth_bp
from .expenses.feed import feed_bp
from .expenses.fetch import fetch_bp

SWAGGER_CONFIG = {
    "headers": [],
    "specs": [
        {
            "endpoint": "apispec",
            "route": "/apispec.json",
        }
    ],
    "static_url_path": "/flasgger_static",
    "swagger_ui": True,
    "specs_route": "/apidocs",
    "title": "Expense Tracker API",
    "uiversion": 3,
}

SWAGGER_TEMPLATE = {
    "info": {
        "title": "Expense Tracker API",
        "description": (
            "REST API for the Expense Tracker application.\n\n"
            "**Auth:** All `/expenses/*` endpoints require a Bearer JWT token.\n"
            "Obtain a token via `POST /auth/login` or `POST /auth/register`, "
            "then click **Authorize** and enter `Bearer <token>`."
        ),
        "version": "1.0.0",
    },
    "securityDefinitions": {
        "BearerAuth": {
            "type": "apiKey",
            "name": "Authorization",
            "in": "header",
            "description": "Enter: **Bearer &lt;JWT token&gt;**",
        }
    },
    "security": [{"BearerAuth": []}],
}


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    allowed_origins = os.getenv("CORS_ORIGINS", "https://dev.ivoxa.ai").split(",")
    CORS(app, resources={r"/*": {"origins": allowed_origins}})

    db.init_app(app)
    jwt.init_app(app)
    Swagger(app, config=SWAGGER_CONFIG, template=SWAGGER_TEMPLATE)

    app.register_blueprint(auth_bp,  url_prefix="/auth")
    app.register_blueprint(feed_bp,  url_prefix="/expenses/feed")
    app.register_blueprint(fetch_bp, url_prefix="/expenses/fetch")

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
