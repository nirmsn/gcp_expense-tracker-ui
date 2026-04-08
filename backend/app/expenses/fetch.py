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
    cats = Category.query.order_by(Category.name).all()
    return jsonify([c.to_dict() for c in cats]), 200


@fetch_bp.get("/")
@jwt_required()
def list_expenses():
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
    uid     = _current_user_id()
    expense = Expense.query.filter_by(id=expense_id, user_id=uid).first_or_404()
    return jsonify(expense.to_dict()), 200
