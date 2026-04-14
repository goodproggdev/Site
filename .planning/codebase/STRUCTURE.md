# Structure

## Repository Root

```
Site-main/
├── frontend/           # React + TypeScript SPA (Vite)
├── backend/            # Django + DRF REST API
├── CVs/                # Sample CV files
├── MongoDB/            # MongoDB-related scripts/configs
├── docker-compose.yml  # Multi-service orchestration
├── Run.bat             # Windows dev startup script
├── config.txt          # Misc config notes
├── indexflow.html      # Standalone flow/diagram page
└── plan.md             # Project planning notes
```

## Frontend (`frontend/`)

```
frontend/
├── src/
│   ├── main.tsx                 # App entry point, i18n init
│   ├── App.tsx                  # Router setup, lazy page loading
│   ├── index.css                # Global Tailwind + custom classes
│   ├── api/
│   │   ├── cvApi.ts             # Centralized axios client (JWT interceptors)
│   │   └── types.ts             # Shared API TypeScript types
│   ├── components/
│   │   ├── CookieConsent.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── LanguageSelector.tsx
│   │   ├── Toggle.tsx
│   │   ├── UploadButton.tsx     # CV upload modal (file input + fetch)
│   │   └── index.ts             # Barrel re-export
│   ├── features/
│   │   └── cv-builder/          # CV builder feature module
│   ├── hooks/
│   │   └── useCVUpload.ts       # Upload state machine hook
│   ├── i18n/                    # i18next config + language definitions
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Upload.tsx
│   │   ├── Preview.tsx
│   │   ├── PublicCV.tsx
│   │   ├── Settings.tsx
│   │   ├── Pricing.tsx
│   │   ├── StripeCheckout.tsx
│   │   ├── Statistics.tsx
│   │   ├── ForgotPassword.tsx
│   │   ├── ResetPassword.tsx
│   │   ├── VerifyEmail.tsx
│   │   ├── Welcome.tsx
│   │   ├── ContactForm.tsx
│   │   ├── About.tsx
│   │   ├── Feature.tsx
│   │   ├── Marketing.tsx
│   │   ├── PrivacyPolicy.tsx
│   │   ├── TermsOfService.tsx
│   │   └── data.json            # Static page data (job categories, etc.)
│   ├── upload/                  # Upload-specific components/logic
│   └── utils/
│       ├── localizedPath.ts     # /:lang path helpers
│       └── apiErrorI18n.ts      # Backend error → i18n key mapper
├── public/                      # Static assets
├── __tests__/
│   ├── app.test.tsx             # Main test suite
│   └── setup.ts                 # Vitest setup (jest-dom)
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── prettier.config.js
```

## Backend (`backend/`)

```
backend/
├── manage.py
├── requirements.txt
├── db.sqlite3                   # Development database
├── media/                       # Uploaded CV files
├── mybackend/                   # Django project config
│   ├── settings.py              # All settings (decouple .env)
│   ├── urls.py                  # Root URL conf
│   ├── auth_views.py            # Custom auth views (email verification, etc.)
│   ├── registration_urls.py     # dj-rest-auth registration routes
│   ├── templates/               # Email templates
│   └── wsgi.py / asgi.py
├── api/                         # Main Django app
│   ├── models.py                # UserProfile, CVData, Entitlement, JobMatch, etc.
│   ├── views.py                 # 807-line DRF views (thin, delegates to services)
│   ├── serializers.py           # DRF serializers
│   ├── urls.py                  # API URL routes (/api/v1/...)
│   ├── admin.py                 # Admin registrations
│   ├── apps.py                  # App config
│   ├── tests.py                 # Backend test suite
│   ├── services/
│   │   ├── cv_service.py        # CV parsing + validation
│   │   ├── job_matching.py      # Resume ↔ job matching
│   │   ├── job_adapters.py      # External job search adapters
│   │   ├── stripe_service.py    # Stripe subscription logic
│   │   └── email_service.py     # Transactional email
│   ├── Resume-Matcher/          # Embedded resume parsing library
│   ├── migrations/              # Django DB migrations
│   ├── data/                    # Static data files (JSON)
│   ├── legacy_urls.py           # Old URL paths (backward compat)
│   └── auth_serializers.py      # Auth-specific serializers
└── demo_resume_parser.py        # Standalone CV parsing demo script
```

## Key File Locations

| Purpose | Path |
|---|---|
| Frontend env vars | `frontend/.env` (VITE_API_BASE_URL, etc.) |
| Backend secrets | `backend/.env` (SECRET_KEY, DB URL, Stripe keys) |
| API base URL config | `frontend/src/api/cvApi.ts` (line 14–18) |
| JWT settings | `backend/mybackend/settings.py` (SIMPLE_JWT block) |
| CORS config | `backend/mybackend/settings.py` (CORS_ALLOWED_ORIGINS) |
| Route definitions | `frontend/src/App.tsx` |
| Backend URL root | `backend/mybackend/urls.py` |
| Tailwind theme | `frontend/tailwind.config.js` |
| i18n locale files | `frontend/src/i18n/` |
