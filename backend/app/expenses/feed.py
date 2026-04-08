from datetime import date

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from ..extensions import db
from ..models import Expense

feed_bp = Blueprint("feed", __name__)


def _current_user_id() -> int:
    return int(get_jwt_identity())


def _parse_body():
    data = request.get_json(silent=True) or {}
    title        = (data.get("title") or "").strip()
    amount       = data.get("amount")
    category_id  = data.get("category_id")
    expense_date = data.get("expense_date")
    note         = (data.get("note") or "").strip()

    if not title:
        return None, "title is required"
    try:
        amount = float(amount)
        if amount < 0:
            raise ValueError
    except (TypeError, ValueError):
        return None, "amount must be a non-negative number"
    try:
        expense_date = date.fromisoformat(expense_date) if expense_date else date.today()
    except ValueError:
        return None, "expense_date must be YYYY-MM-DD"

    return dict(
        title=title, amount=amount,
        category_id=int(category_id) if category_id else None,
        expense_date=expense_date, note=note,
    ), None


@feed_bp.post("/")
@jwt_required()
def create_expense():
    uid = _current_user_id()
    payload, err = _parse_body()
    if err:
        return jsonify(detail=err), 400

    expense = Expense(user_id=uid, **payload)
    db.session.add(expense)
    db.session.commit()
    db.session.refresh(expense)
    return jsonify(expense.to_dict()), 201


@feed_bp.put("/<int:expense_id>")
@jwt_required()
def update_expense(expense_id):
    uid     = _current_user_id()
    expense = Expense.query.filter_by(id=expense_id, user_id=uid).first_or_404()

    payload, err = _parse_body()
    if err:
        return jsonify(detail=err), 400

    for k, v in payload.items():
        setattr(expense, k, v)
    db.session.commit()
    db.session.refresh(expense)
    return jsonify(expense.to_dict()), 200


@feed_bp.delete("/<int:expense_id>")
@jwt_required()
def delete_expense(expense_id):
    uid     = _current_user_id()
    expense = Expense.query.filter_by(id=expense_id, user_id=uid).first_or_404()
    db.session.delete(expense)
    db.session.commit()
    return jsonify(message="deleted"), 200
