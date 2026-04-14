# Technology Stack

**Analysis Date:** 2026-04-12

## Languages

**Primary:**
- Python 3.12+ - Backend (Django REST Framework, CV parsing, email, Stripe integration)
- TypeScript 5.4.2 - Frontend (React + Vite SPA)
- Node.js 20+ - Frontend tooling and build

**Secondary:**
- JavaScript - Build configuration (postcss.config.js, tailwind.config.js, vite.config.ts)
- SQL - Database queries via Django ORM

## Runtime

**Environment:**
- Python runtime for backend (wsgi via Django, production-ready with decouple)
- Node.js 20+ for frontend build and development server
- Browser runtime for React SPA

**Package Manager:**
- npm - Frontend (frontend/package.json with package-lock.json present)
- pip - Backend (backend/requirements.txt, with virtual environment in .venv/)

## Frameworks

**Core:**
- Django 5.1.6 - Backend web framework with admin, ORM, migrations
- Django REST Framework 3.15.2 - API serialization, authentication, throttling
- React 18.2.0 - Frontend UI library
- Vite 5.4.17 - Frontend build tool and dev server

**Authentication:**
- djangorestframework-simplejwt 5.3.1 - JWT token generation and validation
- dj-rest-auth 6.0.0 - Auth endpoints wrapper
- django-allauth 65.4.1 - Email verification, account management, social auth hooks

**Testing:**
- pytest 8.3.4 - Backend test runner
- pytest-django 4.9.0 - Django test utilities
- vitest 1.6.0 - Frontend unit test runner
- @testing-library/react 14.3.1 - React component testing

**Build/Dev:**
- TypeScript 5.4.2 - Type checking for frontend
- ESLint 8.57.0 - Frontend linting with @typescript-eslint/eslint-plugin 7.3.1
- Prettier 0.5.12 (prettier-plugin-tailwindcss) - Code formatting
- Tailwind CSS 3.4.1 - Utility-first styling
- PostCSS 8.4.37 - CSS transformation

## Key Dependencies

**Critical - Backend:**
- stripe 11.5.0 - Stripe payment processing, checkout sessions, webhooks
- psycopg[binary] - PostgreSQL adapter (production database)
- django-storages[s3] - S3-compatible file storage (MinIO, AWS)
- PyPDF2 3.0.1 - CV PDF parsing
- python-docx 1.1.2 - CV DOCX parsing
- nltk 3.9.1 - Natural language processing for CV analysis
- python-decouple 3.8 - Environment variable management

**Infrastructure - Backend:**
- asgiref 3.8.1 - ASGI server adapter
- django-cors-headers 4.7.0 - Cross-origin resource sharing
- django-filter 25.1 - QuerySet filtering for APIs
- Markdown 3.7 - Content formatting
- sqlparse 0.5.3 - SQL parsing
- dj-database-url - DATABASE_URL parsing

**Critical - Frontend:**
- axios 1.8.1 - HTTP client for backend API calls
- @stripe/stripe-js 5.8.0 - Stripe.js library for payment UI
- react-router-dom 7.2.0 - Frontend routing
- flowbite-react 0.8.0 - Pre-built React components
- react-i18next 17.0.2 - Internationalization (i18n)
- react-dropzone 15.0.0 - File upload UI
- jszip 3.10.1 - Client-side zip file creation
- file-saver 2.0.5 - Client-side file downloads

**Testing - Backend:**
- factory-boy 3.3.1 - Test fixture generation
- coverage 7.6.1 - Code coverage reporting

## Configuration

**Environment:**
- Backend: `.env` file with python-decouple for secure secret management (STRIPE_SECRET_KEY, DATABASE_URL, JWT_* settings, email config, S3 credentials)
- Frontend: `.env.local` (Vite environment variables: VITE_API_BASE_URL, VITE_API_URL, VITE_STRIPE_PUBLISHABLE_KEY)
- Database: PostgreSQL (default in production), SQLite (local development via `db.sqlite3`)

**Build:**
- `tsconfig.json` - TypeScript compilation target ES2020, strict mode enabled, jsx: react-jsx
- `vite.config.ts` - Code splitting (vendor-react, vendor-ui, vendor-i18n, cv-builder, dashboard chunks), sourcemaps enabled, test config with jsdom
- `postcss.config.js` - PostCSS configuration (Tailwind plugin)
- `tailwind.config.js` - Tailwind CSS customization
- `.eslintrc.cjs` - ESLint rules configuration
- `Dockerfile` - Containerization for backend and frontend
- `docker-compose.yml` - Local development with PostgreSQL, MinIO (S3-compatible), backend, and frontend services

## Platform Requirements

**Development:**
- Python 3.12+ (3.14 also supported with updated requirements)
- Node.js 20+
- npm 10+
- Virtual environment (.venv/) for Python dependencies
- Docker and Docker Compose (optional, for containerized local development)

**Production:**
- Backend: Django runtime on managed service (Heroku, Railway, Render, AWS, etc.)
- Frontend: Static hosting (CDN, S3, Netlify, Vercel, etc.)
- Database: PostgreSQL (managed service via DATABASE_URL)
- Object storage: S3-compatible service (AWS S3, MinIO, or equivalent) via django-storages
- Email: SMTP server (Gmail, SendGrid, AWS SES, etc.) configured via EMAIL_* env vars

---

*Stack analysis: 2026-04-12*
