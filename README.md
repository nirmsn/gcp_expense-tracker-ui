# Expense Tracker

Full-stack expense tracking app — React UI + Python Flask API + MySQL.

## Repo structure

```
.
├── frontend/             # React 18 UI
│   ├── src/
│   │   ├── api/          # Axios clients + AuthContext
│   │   ├── components/   # ExpenseForm, PrivateRoute
│   │   └── pages/        # Login, Register, Dashboard
│   ├── public/
│   ├── Dockerfile        # Multi-stage production build (Nginx)
│   ├── Dockerfile.dev    # Dev build (Node, port 3000)
│   ├── nginx.conf
│   ├── package.json
│   └── .env.example
├── backend/              # Python Flask REST API
│   ├── app/
│   │   ├── auth/         # /api/auth blueprints
│   │   └── expenses/     # /api/expenses/feed & fetch blueprints
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── wsgi.py
│   └── .env.example
├── mysql/                # MySQL 8.0 Docker image + init schema
│   ├── Dockerfile
│   └── init.sql
├── docker-compose.yml    # Local dev stack (all 3 services)
└── k8s/                  # Helm charts & native manifests (GKE)
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

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
# Edit backend/.env to set custom passwords / JWT secret if needed
```

### 3. Start all services

```bash
docker compose up --build
```

This starts three containers:

| Container          | Port | Description        |
|--------------------|------|--------------------|
| `expense-mysql`    | 3306 | MySQL 8.0 database |
| `expense-backend`  | 5000 | Flask REST API     |
| `expense-frontend` | 8080 | React UI (Nginx)   |

### 4. Open the app

```
http://localhost:8080
```

Register a new account or use the demo credentials:

| Field    | Value            |
|----------|------------------|
| Email    | demo@example.com |
| Password | demo1234         |

### Stop / clean up

```bash
# Stop containers
docker compose down

# Stop and wipe the database volume (full reset)
docker compose down -v
```

---

## Swagger API Docs

Interactive API documentation is available when the backend is running.

```
http://localhost:5000/apidocs
```

### How to use Swagger UI

1. Start the backend (`docker compose up backend` or standalone — see below)
2. Open `http://localhost:5000/apidocs` in your browser
3. Call `POST /api/auth/login` (or `/register`) — copy the `access_token` from the response
4. Click the **Authorize** button (top right)
5. Enter `Bearer <your_token>` and click **Authorize**
6. All protected endpoints are now unlocked for testing

### Available endpoints in Swagger

| Tag        | Method | Path                                 | Auth |
|------------|--------|--------------------------------------|------|
| Auth       | POST   | `/api/auth/register`                 | No   |
| Auth       | POST   | `/api/auth/login`                    | No   |
| Categories | GET    | `/api/expenses/fetch/categories/`    | JWT  |
| Expenses   | GET    | `/api/expenses/fetch/`               | JWT  |
| Expenses   | GET    | `/api/expenses/fetch/summary`        | JWT  |
| Expenses   | GET    | `/api/expenses/fetch/{expense_id}`   | JWT  |
| Expenses   | POST   | `/api/expenses/feed/`                | JWT  |
| Expenses   | PUT    | `/api/expenses/feed/{expense_id}`    | JWT  |
| Expenses   | DELETE | `/api/expenses/feed/{expense_id}`    | JWT  |

Raw OpenAPI spec: `http://localhost:5000/apispec.json`

---

## Frontend Docker deployment

### Production image (Nginx, port 8080)

```bash
# Build
docker build -t expense-frontend:latest ./frontend

# Run (standalone, pointing at a running backend)
docker run -p 8080:8080 expense-frontend:latest
```

> The production image bakes the `REACT_APP_*` env vars at **build time**.
> To target a specific backend, pass them during build:
>
> ```bash
> docker build \
>   --build-arg REACT_APP_AUTH_URL=https://api.example.com/api/auth \
>   --build-arg REACT_APP_FEED_URL=https://api.example.com/api/expenses/feed \
>   --build-arg REACT_APP_FETCH_URL=https://api.example.com/api/expenses/fetch \
>   -t expense-frontend:latest ./frontend
> ```

### Dev image (hot-reload, port 3000)

```bash
docker build -f frontend/Dockerfile.dev -t expense-frontend:dev ./frontend
docker run -p 3000:3000 -v $(pwd)/frontend/src:/app/src expense-frontend:dev
```

### Push to GCP Artifact Registry

```bash
# Authenticate
gcloud auth configure-docker us-central1-docker.pkg.dev

# Build & tag
docker build -t us-central1-docker.pkg.dev/<PROJECT>/my-repo/expense-frontend:latest ./frontend

# Push
docker push us-central1-docker.pkg.dev/<PROJECT>/my-repo/expense-frontend:latest
```

---

## Run backend only (without Docker)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

export MYSQL_HOST=127.0.0.1
export MYSQL_USER=expense_user
export MYSQL_PASSWORD=expense_pass
export MYSQL_DB=expense_db
export JWT_SECRET_KEY=dev-secret

python wsgi.py
# API: http://localhost:5000
# Swagger: http://localhost:5000/apidocs
```

## Run frontend only (without Docker)

```bash
cd frontend
npm install

REACT_APP_AUTH_URL=http://localhost:5000/api/auth \
REACT_APP_FEED_URL=http://localhost:5000/api/expenses/feed \
REACT_APP_FETCH_URL=http://localhost:5000/api/expenses/fetch \
npm start
# UI: http://localhost:3000
```
