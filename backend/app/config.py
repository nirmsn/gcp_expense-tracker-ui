import os
from datetime import timedelta


class Config:
    # MySQL
    MYSQL_HOST     = os.getenv("MYSQL_HOST",     "mysql")
    MYSQL_PORT     = os.getenv("MYSQL_PORT",     "3306")
    MYSQL_USER     = os.getenv("MYSQL_USER",     "expense_user")
    MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "expense_pass")
    MYSQL_DB       = os.getenv("MYSQL_DB",       "expense_db")

    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}"
        f"@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT
    JWT_SECRET_KEY        = os.getenv("JWT_SECRET_KEY", "change-me-in-production")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
