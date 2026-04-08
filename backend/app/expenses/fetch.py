from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func

from ..extensions import db
from ..models import Expense, Category

fetch_bp = Blueprint("fetch", __name__)


def _current_user_id() -> int:
    return int(get_jwt_identity())


@fetch_bp.get("/categories/")
@jwt_required()
def list_categories():
    """List all expense categories.
    ---
    tags:
      - Categories
    security:
      - BearerAuth: []
    responses:
      200:
        description: List of categories
        schema:
          type: array
          items:
            type: object
            properties:
              id: {type: integer, example: 1}
              name: {type: string, example: Food}
              color: {type: string, example: '#f59e0b'}
      401:
        description: Missing or invalid token
    """
    cats = Category.query.order_by(Category.name).all()
    return jsonify([c.to_dict() for c in cats]), 200


@fetch_bp.get("/")
@jwt_required()
def list_expenses():
    """List expenses for the authenticated user.
    ---
    tags:
      - Expenses
    security:
      - BearerAuth: []
    parameters:
      - in: query
        name: limit
        type: integer
        default: 50
        description: Maximum number of results
    responses:
      200:
        description: List of expenses
        schema:
          type: array
          items:
            $ref: '#/definitions/Expense'
      401:
        description: Missing or invalid token
    definitions:
      Expense:
        type: object
        properties:
          id: {type: integer}
          title: {type: string}
          amount: {type: string, example: '250.00'}
          category_id: {type: integer}
          expense_date: {type: string, format: date}
          note: {type: string}
          category:
            type: object
            properties:
              id: {type: integer}
              name: {type: string}
              color: {type: string}
    """
    uid   = _current_user_id()
    limit = request.args.get("limit", 50, type=int)
    expenses = (
        Expense.query
        .filter_by(user_id=uid)
        .order_by(Expense.expense_date.desc(), Expense.created_at.desc())
        .limit(limit)
        .all()
    )
    return jsonify([e.to_dict() for e in expenses]), 200


@fetch_bp.get("/summary")
@jwt_required()
def summary():
    """Get dashboard summary (total spent, count, breakdown by category).
    ---
    tags:
      - Expenses
    security:
      - BearerAuth: []
    responses:
      200:
        description: Summary data
        schema:
          type: object
          properties:
            total:
              type: number
              example: 5613.5
            count:
              type: integer
              example: 10
            by_category:
              type: array
              items:
                type: object
                properties:
                  name: {type: string}
                  color: {type: string}
                  total: {type: number}
      401:
        description: Missing or invalid token
    """
    uid = _current_user_id()

    row = (
        db.session.query(
            func.sum(Expense.amount).label("total"),
            func.count(Expense.id).label("count"),
        )
        .filter(Expense.user_id == uid)
        .one()
    )

    by_cat = (
        db.session.query(
            Category.name,
            Category.color,
            func.sum(Expense.amount).label("total"),
        )
        .join(Expense, Expense.category_id == Category.id)
        .filter(Expense.user_id == uid)
        .group_by(Category.id)
        .order_by(func.sum(Expense.amount).desc())
        .all()
    )

    return jsonify(
        total=float(row.total or 0),
        count=row.count or 0,
        by_category=[
            {"name": r.name, "color": r.color, "total": float(r.total)}
            for r in by_cat
        ],
    ), 200


@fetch_bp.get("/<int:expense_id>")
@jwt_required()
def get_expense(expense_id):
    """Get a single expense by ID.
    ---
    tags:
      - Expenses
    security:
      - BearerAuth: []
    parameters:
      - in: path
        name: expense_id
        type: integer
        required: true
    responses:
      200:
        description: Expense object
        schema:
          $ref: '#/definitions/Expense'
      401:
        description: Missing or invalid token
      404:
        description: Expense not found
    """
    uid     = _current_user_id()
    expense = Expense.query.filter_by(id=expense_id, user_id=uid).first_or_404()
    return jsonify(expense.to_dict()), 200
