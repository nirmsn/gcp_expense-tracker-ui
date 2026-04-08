from datetime import date
from werkzeug.security import generate_password_hash, check_password_hash
from .extensions import db


class User(db.Model):
    __tablename__ = "users"

    id            = db.Column(db.Integer,     primary_key=True)
    name          = db.Column(db.String(100), nullable=False)
    email         = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at    = db.Column(db.DateTime,    server_default=db.func.now())

    expenses = db.relationship("Expense", backref="user", lazy=True, cascade="all, delete-orphan")

    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {"id": self.id, "name": self.name, "email": self.email}


class Category(db.Model):
    __tablename__ = "categories"

    id    = db.Column(db.Integer,    primary_key=True)
    name  = db.Column(db.String(100), nullable=False)
    color = db.Column(db.String(20),  default="#6366f1")

    expenses = db.relationship("Expense", backref="category", lazy=True)

    def to_dict(self):
        return {"id": self.id, "name": self.name, "color": self.color}


class Expense(db.Model):
    __tablename__ = "expenses"

    id           = db.Column(db.Integer,       primary_key=True)
    user_id      = db.Column(db.Integer,       db.ForeignKey("users.id"),      nullable=False)
    title        = db.Column(db.String(255),   nullable=False)
    amount       = db.Column(db.Numeric(10, 2), nullable=False)
    category_id  = db.Column(db.Integer,       db.ForeignKey("categories.id"), nullable=True)
    expense_date = db.Column(db.Date,          nullable=False, default=date.today)
    note         = db.Column(db.Text,          nullable=True)
    created_at   = db.Column(db.DateTime,      server_default=db.func.now())

    def to_dict(self):
        return {
            "id":           self.id,
            "title":        self.title,
            "amount":       str(self.amount),
            "category_id":  self.category_id,
            "expense_date": str(self.expense_date),
            "note":         self.note or "",
            "category":     self.category.to_dict() if self.category else None,
        }
