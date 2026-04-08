from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token

from ..extensions import db
from ..models import User

auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/register")
def register():
    """Register a new user account.
    ---
    tags:
      - Auth
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required: [name, email, password]
          properties:
            name:
              type: string
              example: John Doe
            email:
              type: string
              example: john@example.com
            password:
              type: string
              example: secret123
    responses:
      201:
        description: Account created, returns JWT and user object
        schema:
          type: object
          properties:
            access_token:
              type: string
            user:
              type: object
              properties:
                id: {type: integer}
                name: {type: string}
                email: {type: string}
      400:
        description: Validation error
      409:
        description: Email already registered
    """
    data = request.get_json(silent=True) or {}
    name     = (data.get("name")     or "").strip()
    email    = (data.get("email")    or "").strip().lower()
    password = (data.get("password") or "").strip()

    if not name or not email or not password:
        return jsonify(detail="name, email and password are required"), 400
    if len(password) < 8:
        return jsonify(detail="Password must be at least 8 characters"), 400
    if User.query.filter_by(email=email).first():
        return jsonify(detail="Email already registered"), 409

    user = User(name=name, email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify(access_token=token, user=user.to_dict()), 201


@auth_bp.post("/login")
def login():
    """Login and obtain a JWT access token.
    ---
    tags:
      - Auth
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required: [email, password]
          properties:
            email:
              type: string
              example: demo@example.com
            password:
              type: string
              example: demo1234
    responses:
      200:
        description: Login successful, returns JWT and user object
        schema:
          type: object
          properties:
            access_token:
              type: string
            user:
              type: object
              properties:
                id: {type: integer}
                name: {type: string}
                email: {type: string}
      401:
        description: Invalid credentials
    """
    data = request.get_json(silent=True) or {}
    email    = (data.get("email")    or "").strip().lower()
    password = (data.get("password") or "").strip()

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify(detail="Invalid email or password"), 401

    token = create_access_token(identity=str(user.id))
    return jsonify(access_token=token, user=user.to_dict()), 200
