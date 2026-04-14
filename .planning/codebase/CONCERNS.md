# Concerns

## Critical

### Monolithic views.py (807 lines)
- `backend/api/views.py` is 807 lines and growing
- Despite a `services/` layer existing, views still contain inline logic
- Risk: merge conflicts, hard to navigate, violations of single responsibility
- Recommendation: split into view modules per domain (cv_views.py, job_views.py, auth_views.py)

### SQLite in Production
- `db.sqlite3` is the current database — not suitable for concurrent production load
- `dj_database_url` is wired in, so switching to Postgres is straightforward
- No evidence of a migration plan

### Email Verification Token in Plaintext
- `UserProfile.email_verification_token` stored as `CharField(max_length=64)` — plaintext in DB
- If database is compromised, tokens can be used to verify accounts
- Should be stored as a hash (e.g., SHA-256)

## High

### N+1 Queries in Dashboard
- `CVDashboardView` (or equivalent) likely fetches CVs then lazily loads related objects in a loop
- No `select_related`/`prefetch_related` observed in reviewed code
- Will degrade significantly with real user data volumes

### Synchronous CV Parsing
- CV parsing (`parse_cv_from_file`) runs synchronously in the request/response cycle
- The embedded `Resume-Matcher` library can be slow on large files
- No Celery/task queue integration — blocks the Django thread during parsing
- Risk: request timeouts, poor UX on slow connections

### Inconsistent Error Handling / Logging
- Mix of `logger.error(...)` and bare `print()` in `api/views.py` and services
- No structured logging — hard to aggregate in production log systems
- Error messages sometimes in Italian, sometimes in English — inconsistent API surface

### Unvalidated raw_json Storage
- `CVData` model stores parsed CV as `raw_json` without schema validation
- Malformed or unexpected resume-matcher output can silently store bad data
- Downstream job matching relies on this field

## Medium

### Missing GDPR / Data Deletion Features
- No user data export endpoint
- No account deletion flow visible in frontend routes or backend views
- Personal data (CVs, job matches) stored indefinitely

### Stripe Webhook Security
- `stripe_service.py` handles webhooks but error handling may be weak
- If webhook signature verification is missing or incomplete, replay attacks are possible
- No test coverage for webhook handling

### Frontend Alert() Usage
- `UploadButton.tsx` uses `alert()` for file validation errors and upload status
- Breaks UX on mobile, not i18n-friendly, blocks the thread
- Should use a toast/notification component

### No CI/CD Pipeline
- No `.github/workflows/`, `Jenkinsfile`, or equivalent found
- Tests must be run manually; no enforcement on commits/PRs
- No automated build or deployment

### JWT Tokens in localStorage
- `access_token` and `refresh_token` stored in `localStorage`
- Vulnerable to XSS attacks — any injected script can steal tokens
- HttpOnly cookies would be safer (backend already supports SessionAuthentication)

## Low

### Legacy URL Compatibility Layer
- `backend/api/legacy_urls.py` maintains old endpoint paths
- Unclear which clients still depend on these or when they can be removed

### MongoDB Scripts Present but Unused
- `MongoDB/` directory at root contains scripts/configs
- Current app uses SQLite/relational DB only
- Dead code or future migration artifact — needs clarification

### Single Frontend Test File
- All frontend tests in one `app.test.tsx` file (will become unwieldy)
- No test colocation with components

### Missing Request Timeout on Axios
- `cvApi.ts` axios instance has no `timeout` configured
- Long-running backend operations (CV parsing) will leave the client waiting indefinitely

### `indexflow.html` at Root
- Standalone HTML file at repo root (`indexflow.html`) — unclear purpose
- Not integrated with the frontend build or backend

## Tech Debt Inventory

| Item | Location | Severity |
|---|---|---|
| Monolithic views.py | `backend/api/views.py` | High |
| SQLite in production | `backend/db.sqlite3` | Critical |
| Plaintext email tokens | `backend/api/models.py` `UserProfile` | Critical |
| N+1 queries | `backend/api/views.py` dashboard views | High |
| Sync CV parsing | `backend/api/services/cv_service.py` | High |
| Mixed print/logger | `backend/api/views.py`, services | Medium |
| No GDPR deletion | frontend + backend | Medium |
| alert() in components | `frontend/src/components/UploadButton.tsx` | Medium |
| JWT in localStorage | `frontend/src/api/cvApi.ts` | Medium |
| No CI pipeline | repo root | Medium |
| No axios timeout | `frontend/src/api/cvApi.ts` | Low |
| Legacy URL layer | `backend/api/legacy_urls.py` | Low |
