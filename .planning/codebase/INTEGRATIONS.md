# External Integrations

**Analysis Date:** 2026-04-12

## APIs & External Services

**Payment Processing:**
- Stripe - Checkout sessions, payment intents, webhook processing
  - SDK/Client: `stripe` (Python backend), `@stripe/stripe-js` (React frontend)
  - Auth: `STRIPE_SECRET_KEY` (backend), `STRIPE_PUBLISHABLE_KEY` (frontend)
  - Webhook: `STRIPE_WEBHOOK_SECRET` for signature verification
  - Implementation: `backend/api/services/stripe_service.py` - creates checkout sessions, verifies webhooks
  - Frontend: `frontend/src/pages/StripeCheckout.tsx` - loads Stripe.js for payment UI

**Job Board APIs:**
- LinkedIn Jobs (requires official partnership)
  - SDK/Client: requests library (Python)
  - Adapter: `backend/api/services/job_adapters.py::LinkedInAdapter` (placeholder for official API partnership)
  - Rate limiting: 2 seconds between requests
  - Caching: 1-hour TTL via Django cache framework

**Email:**
- Gmail SMTP (configurable via environment)
  - Backend: Django's built-in email framework
  - Configuration: `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD` (Gmail app password)
  - Service: `backend/api/services/email_service.py` - verification, password reset, transactional emails
  - Console backend for local development (DEBUG=True prints emails to console)

## Data Storage

**Databases:**
- PostgreSQL (production)
  - Connection: `DATABASE_URL` environment variable (dj-database-url)
  - Client: Django ORM via psycopg[binary]
  - Migrations: `backend/api/migrations/` (Django migrations system)

- SQLite (local development)
  - File: `backend/db.sqlite3`
  - Default when DATABASE_URL not set

**File Storage:**
- MinIO (local development) - S3-compatible object storage
  - Connection: `docker-compose.yml` service definition
  - Credentials: MINIO_ROOT_USER=minioadmin, MINIO_ROOT_PASSWORD=minioadmin
  - Endpoint: http://minio:9000, console at http://minio:9001
  - Bucket: cv-assets (must be pre-created)

- AWS S3 or S3-compatible service (production)
  - Client: django-storages[s3] with boto3
  - Configuration: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_STORAGE_BUCKET_NAME`, `AWS_S3_REGION_NAME`, `AWS_S3_ENDPOINT_URL`
  - Toggle: `USE_S3_STORAGE=true` in .env
  - Implementation: Backend settings.py line 236-244 - configures S3Boto3Storage when enabled

**Caching:**
- Django cache framework (in-memory for development)
  - Used by: Job adapter caching (1-hour TTL for search results)
  - Production-ready for Redis or Memcached (configurable via CACHES setting)

## Authentication & Identity

**Auth Provider:**
- Custom JWT + django-allauth hybrid
  - JWT: `djangorestframework-simplejwt` - AccessToken (60 min default), RefreshToken (7 days default)
  - AllAuth: Email verification, password reset, social account hooks (Google, GitHub, etc.)
  - Session: JWT stored in localStorage (frontend), optional cookie-based (JWT_AUTH_COOKIE=cv-auth)
  - Implementation: `backend/mybackend/settings.py` (SIMPLE_JWT, REST_AUTH, ACCOUNT settings)
  - Endpoints: `/auth/token/` (login), `/auth/token/refresh/` (refresh), `/auth/registration/` (signup), allauth endpoints for password reset

## Monitoring & Observability

**Error Tracking:**
- Not detected - no Sentry, Rollbar, or similar configured

**Logs:**
- Django logging framework (default)
  - Console output in development
  - Logger usage: `backend/api/services/stripe_service.py`, `backend/api/services/cv_service.py`
  - Production: Configure via settings.py LOGGING or third-party handler

## CI/CD & Deployment

**Hosting:**
- Not configured in codebase - requires external platform (Heroku, Railway, AWS, Vercel, etc.)

**CI Pipeline:**
- GitHub Actions workflow present: `.github/workflows/ci.yml` (file exists but content not analyzed)

**Containerization:**
- Docker support for both frontend and backend
  - Backend Dockerfile: `backend/Dockerfile` - Python-based, runs Django with gunicorn (assumed)
  - Frontend Dockerfile: `frontend/Dockerfile` - Node-based, builds React with Vite
  - Compose: `docker-compose.yml` - Orchestrates backend, frontend, PostgreSQL, MinIO for local development

## Environment Configuration

**Required env vars - Backend:**
- Core: `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, `SITE_NAME`, `SITE_DOMAIN`
- Frontend URL: `FRONTEND_URL` (for email links), `FRONTEND_DEFAULT_LANG`
- CORS/Security: `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`
- Database: `DATABASE_URL` (postgres://user:pass@host:port/db)
- JWT: `JWT_ACCESS_TOKEN_LIFETIME_MINUTES`, `JWT_REFRESH_TOKEN_LIFETIME_DAYS`
- Email: `EMAIL_BACKEND`, `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USE_TLS`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `EMAIL_RECIPIENT`
- Account: `ACCOUNT_EMAIL_VERIFICATION` (mandatory|optional|none)
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- S3 Storage: `USE_S3_STORAGE`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_STORAGE_BUCKET_NAME`, `AWS_S3_REGION_NAME`, `AWS_S3_ENDPOINT_URL`

**Required env vars - Frontend:**
- API: `VITE_API_BASE_URL` (http://localhost:8000 in dev)
- Legacy: `VITE_API_URL` (backward compatibility, same as VITE_API_BASE_URL)
- Stripe: `VITE_STRIPE_PUBLISHABLE_KEY` (pk_test_... in dev)

**Secrets location:**
- Backend: `.env` file (git-ignored, copy from `.env.example`)
- Frontend: `.env.local` file (Vite convention, git-ignored)
- Docker Compose: `docker-compose.yml` (hardcoded for local dev only, not secrets)

## Webhooks & Callbacks

**Incoming:**
- Stripe webhooks - POST endpoint for webhook events
  - Handler: `backend/api/services/stripe_service.py::verify_webhook_signature()`
  - Events: payment_intent.succeeded, checkout.session.completed, etc.
  - Verification: STRIPE_WEBHOOK_SECRET used to verify signature

**Outgoing:**
- Email confirmations - SPA frontend links (FRONTEND_URL/verify-email?token=...)
  - Generated by: `backend/api/services/email_service.py`
  - Token-based verification, no webhook pattern

## Third-Party Integrations Summary

| Service | Purpose | Backend | Frontend | Auth |
|---------|---------|---------|----------|------|
| Stripe | Payments | stripe SDK | @stripe/stripe-js | sk_test_, pk_test_ |
| PostgreSQL | Data persistence | psycopg | None | DATABASE_URL |
| MinIO (local) | File storage | django-storages | None | MINIO credentials |
| AWS S3 (prod) | File storage | django-storages+boto3 | None | AWS credentials |
| Gmail/SMTP | Transactional email | Django mail | None | EMAIL_HOST_* |
| LinkedIn API | Job listings | requests | None | API partnership key |

---

*Integration audit: 2026-04-12*
