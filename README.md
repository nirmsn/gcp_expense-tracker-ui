# Expense Tracker

Full-stack expense tracking app — React UI + Python Flask API + MySQL.

## Repo structure

```
.
├── backend/          # Flask API (Python 3.12)
├── mysql/            # MySQL 8.0 Docker image + init schema
├── src/              # React 18 frontend
├── docker-compose.yml
└── Dockerfile        # Frontend (multi-stage Nginx)
```

---

## Run locally with Docker Compose

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) + Docker Compose v2

### 1. Clone the repo

```bash
git clone https://github.com/nirmsn/gcp_expense-tracker-ui.git
cd gcp_expense-tracker-ui
```

### 2. Configure backend environment

```bash
cp backend/.env.example backend/.env
# Edit backend/.env if you want custom passwords / JWT secret
```

### 3. Start all services

```bash
docker compose up --build
```

This starts three containers:

| Container          | Port  | Description          |
|--------------------|-------|----------------------|
| `expense-mysql`    | 3306  | MySQL 8.0 database   |
| `expense-backend`  | 5000  | Flask REST API       |
| `expense-frontend` | 8080  | React UI (Nginx)     |

### 4. Open the app

```
http://localhost:8080
```

Register a new account or use the seeded demo credentials:

| Field    | Value              |
|----------|--------------------|
| Email    | demo@example.com   |
| Password | demo1234           |

> The demo user's password hash is a placeholder in `backend/init.sql`.
> Use **Register** to create your own account for full functionality.

---

## Run backend only (without Docker)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Set env vars (or export them manually)
export MYSQL_HOST=127.0.0.1
export MYSQL_USER=expense_user
export MYSQL_PASSWORD=expense_pass
export MYSQL_DB=expense_db
export JWT_SECRET_KEY=dev-secret

python wsgi.py
```

API available at `http://localhost:5000`.

---

## Run frontend only (without Docker)

```bash
npm install
REACT_APP_AUTH_URL=http://localhost:5000/api/auth \
REACT_APP_FEED_URL=http://localhost:5000/api/expenses/feed \
REACT_APP_FETCH_URL=http://localhost:5000/api/expenses/fetch \
npm start
```

UI available at `http://localhost:3000`.

---

## API endpoints

| Method | Path                            | Auth | Description           |
|--------|---------------------------------|------|-----------------------|
| POST   | `/api/auth/register`            | No   | Create account        |
| POST   | `/api/auth/login`               | No   | Login, returns JWT    |
| GET    | `/api/expenses/fetch/`          | JWT  | List expenses         |
| GET    | `/api/expenses/fetch/summary`   | JWT  | Dashboard summary     |
| GET    | `/api/expenses/fetch/categories/` | JWT | List categories     |
| POST   | `/api/expenses/feed/`           | JWT  | Create expense        |
| PUT    | `/api/expenses/feed/<id>`       | JWT  | Update expense        |
| DELETE | `/api/expenses/feed/<id>`       | JWT  | Delete expense        |

---

## Stop and clean up

```bash
# Stop containers
docker compose down

# Stop and remove the database volume (full reset)
docker compose down -v
```
