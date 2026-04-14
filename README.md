# CV Platform Monorepo

Stack principale:
- `frontend/`: React + Vite + TypeScript.
- `backend/`: Django + DRF + JWT + Stripe + parsing CV.

## Struttura progetto

- `frontend/`: applicazione web client.
- `backend/api/`: API business (CV, dashboard, stripe, parsing).
- `backend/mybackend/`: configurazione Django.
- `.github/workflows/ci.yml`: pipeline CI.

## API design

- Endpoint applicativi versionati: `/api/v1/...`
- Endpoint legacy deprecati: `/api/legacy/...`
- Auth: `/auth/...` (JWT + dj-rest-auth)

## Prerequisiti

- Python 3.12+ (3.14 supportato con requirements aggiornati)
- Node.js 20+
- npm 10+

## Avvio locale

### 1) Backend

```bash
python -m venv .venv
.venv\Scripts\python -m pip install --upgrade pip
.venv\Scripts\python -m pip install -r backend/requirements.txt
copy backend/.env.example backend/.env
.venv\Scripts\python backend/manage.py migrate
.venv\Scripts\python backend/manage.py runserver
```

Backend in locale: `http://localhost:8000`

### 2) Frontend

```bash
cd frontend
npm install
copy .env.example .env.local
npm run dev
```

Frontend in locale: `http://localhost:5173`

## Variabili ambiente

### Backend (`backend/.env`)

- `SECRET_KEY`
- `DEBUG`
- `ALLOWED_HOSTS`
- `CORS_ALLOWED_ORIGINS`
- `CSRF_TRUSTED_ORIGINS`
- `DATABASE_URL` (default sqlite locale)
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `JWT_ACCESS_TOKEN_LIFETIME_MINUTES`
- `JWT_REFRESH_TOKEN_LIFETIME_DAYS`

Storage object per produzione (S3 compatibile):
- `USE_S3_STORAGE`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_STORAGE_BUCKET_NAME`
- `AWS_S3_REGION_NAME`
- `AWS_S3_ENDPOINT_URL`

### Frontend (`frontend/.env.local`)

- `VITE_API_BASE_URL` (consigliato)
- `VITE_API_URL` (compatibilità con codice legacy)
- `VITE_STRIPE_PUBLISHABLE_KEY`

## Deploy consigliato (efficiente)

- Frontend statico su CDN/edge hosting.
- Backend Django su runtime managed.
- PostgreSQL gestito via `DATABASE_URL`.
- Upload su object storage (`django-storages` + S3 compatibile).

## Note NLP / spaCy

`spaCy` non è obbligatorio per far girare la piattaforma principale. Serve solo per script demo:

```bash
pip install "spacy>=3.8.7"
python -m spacy download en_core_web_sm
python -m spacy download it_core_news_sm
```
