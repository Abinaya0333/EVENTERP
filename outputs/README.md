# Event Management System

This output contains both parts of the project:

- `frontend/frontend` - the provided React frontend extracted fully from `frontend.zip` without source/UI changes.
- `backend` - the generated Django REST Framework backend connected to the frontend API base URL.

## Connection

The frontend already contains:

```env
VITE_API_URL=http://localhost:8000/api
```

The backend exposes its REST API at:

```text
http://localhost:8000/api
```

The backend CORS settings allow Vite development origins:

```text
http://localhost:5173
http://127.0.0.1:5173
```

## Run Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## Run Frontend

Open a second terminal:

```powershell
cd frontend\frontend
npm run dev
```

Then open the Vite URL shown in the terminal, normally:

```text
http://localhost:5173
```
