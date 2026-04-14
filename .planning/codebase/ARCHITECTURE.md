# Architecture

## Pattern

Full-stack SPA + REST API:

- **Frontend**: React 18 SPA (TypeScript + Vite), communicates with backend via JSON REST API
- **Backend**: Django 4 monolith with DRF, logic decomposed into a `services/` layer
- **Auth**: JWT (SimpleJWT) — access/refresh tokens stored in `localStorage`; axios interceptor auto-refreshes on 401

## Layers

### Frontend

```
Browser → React Router (/:lang/*) → Page Component
                                   → Custom Hook (e.g. useCVUpload)
                                   → API Layer (src/api/cvApi.ts)
                                   → Axios instance (with JWT interceptor)
                                   → Django REST API
```

- All HTTP calls go through `frontend/src/api/cvApi.ts` — single centralized API module
- Axios interceptors inject `Authorization: Bearer <token>` on every request and silently refresh on 401
- Pages are lazy-loaded via `React.lazy()` with `Suspense` fallback

### Backend

```
HTTP Request → Django URL Router → DRF View (api/views.py)
                                 → Service Layer (api/services/)
                                 → ORM Models (api/models.py)
                                 → Database
```

- Views are thin; business logic lives in `api/services/`:
  - `cv_service.py` — CV parsing and validation
  - `job_matching.py` — resume-to-job matching logic
  - `job_adapters.py` — external job search adapters
  - `stripe_service.py` — subscription/payment handling
  - `email_service.py` — transactional emails

## Entry Points

| Layer | Entry Point |
|---|---|
| Frontend (dev) | `frontend/index.html` → `src/main.tsx` |
| Frontend (prod) | `frontend/dist/index.html` (Vite build) |
| Backend | `backend/mybackend/wsgi.py` / `asgi.py` |
| URL root | `backend/mybackend/urls.py` → `backend/api/urls.py` |

## Routing

Frontend uses language-prefixed routes: `/:lang/...` (e.g. `/it/dashboard`). Root `/` redirects to `/it`. A `LocalizedRoute` wrapper syncs `i18n.language` with the URL param.

Backend URL namespaces:
- `/api/v1/` — main REST endpoints
- `/auth/` — JWT token issuance + allauth registration flows
- `/admin/` — Django admin

## Data Flow (CV Upload)

```
User selects file
  → UploadButton.tsx / useCVUpload hook
  → POST /api/v1/upload/ (multipart)
  → views.CVUploadView → services.cv_service.parse_cv_from_file()
  → Resume-Matcher library (api/Resume-Matcher/)
  → CVData model saved (raw_json + structured fields)
  → Response → React state update → UI feedback
```

## Auth Flow

```
Register → POST /auth/registration/ (dj-rest-auth + allauth)
         → email verification token sent
         → GET /auth/verify-email/?key=... (frontend VerifyEmail page)

Login → POST /auth/token/ → {access, refresh} stored in localStorage
      → JWT injected into all subsequent requests via axios interceptor
      → 401 response → interceptor tries POST /auth/token/refresh/
      → if refresh expired → clear tokens → redirect to /:lang home
```

## Key Abstractions

| Abstraction | Location | Purpose |
|---|---|---|
| `CVData` model | `api/models.py` | Stores parsed CV as `raw_json` + structured fields |
| `Entitlement` model | `api/models.py` | Controls feature access per user/plan |
| `JobMatch` model | `api/models.py` | Persists resume↔job matching results |
| `useCVUpload` hook | `src/hooks/useCVUpload.ts` | Upload state machine (idle/uploading/success/error) |
| `cvApi.ts` | `src/api/cvApi.ts` | Centralized HTTP client with JWT management |

## Infrastructure

- **Containerized**: Docker + docker-compose (`frontend/Dockerfile`, `backend/Dockerfile`, `docker-compose.yml`)
- **Database**: SQLite (dev/current), `dj_database_url` used for production DB URL override
- **Static/Media**: `backend/media/` for uploaded files; S3 optional via `USE_S3_STORAGE` env flag
- **Rate limiting**: DRF throttling — 30/min anon, 100/min authenticated
