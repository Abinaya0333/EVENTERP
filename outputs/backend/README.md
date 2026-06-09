# Event Management Django REST Backend

Generated backend for the provided React frontend and PostgreSQL schema.

## Stack

- Django 5
- Django REST Framework
- PostgreSQL
- JWT auth with `djangorestframework-simplejwt`
- Role-based access control through `accounts.Profile.role`

## Frontend-matched auth endpoints

- `POST /api/token/` with `{ "email": "...", "password": "..." }`
- `POST /api/token/refresh/`
- `GET /api/users/me/`
- `PATCH /api/users/me/`
- `POST /api/register/` with `{ "email": "...", "password": "...", "name": "...", "role": "PARTICIPANT" }`
- `POST /api/logout/` with `{ "refresh": "..." }`

## Main API resources

- `/api/users/`
- `/api/profiles/`
- `/api/departments/`
- `/api/events/`
- `/api/registrations/`
- `/api/attendance/`
- `/api/feedback/`
- `/api/certificates/`
- `/api/committees/`
- `/api/committee-members/`
- `/api/tasks/`
- `/api/budgets/`
- `/api/expenses/`
- `/api/notifications/`
- `/api/event-reports/`

## Roles

- `ADMIN`
- `CONVENER`
- `PARTICIPANT`
- `SANCTIONER`
- `COMMITTEE_MEMBER`

## Setup

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
python manage.py initdb
python manage.py migrate
python seed_demo.py
python manage.py createsuperuser
python manage.py runserver
```

Set the frontend `VITE_API_URL` to `http://localhost:8000/api` if needed. The generated backend does not modify the frontend UI.
