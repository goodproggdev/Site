# Plan di Miglioramento — Site

> Basato sull'analisi del codebase e sulle skill disponibili su [skills.sh](https://skills.sh)
> Data: 2026-03-09

---

## Skill da Scaricare da skills.sh

Le seguenti skill sono rilevanti per questo progetto e andrebbero scaricate e applicate:

| Skill | URL | Area |
|-------|-----|------|
| `security-best-practices` | https://skills.sh/supercent-io/skills-template/security-best-practices | Sicurezza |
| `backend-testing` | https://skills.sh/supercent-io/skills-template/backend-testing | Testing |
| `testing-strategies` | https://skills.sh/supercent-io/skills-template/testing-strategies | Testing |
| `code-refactoring` | https://skills.sh/supercent-io/skills-template/code-refactoring | Python/TS |
| `api-design` | https://skills.sh/supercent-io/skills-template/api-design | Backend |
| `api-documentation` | https://skills.sh/supercent-io/skills-template/api-documentation | Docs |
| `database-schema-design` | https://skills.sh/supercent-io/skills-template/database-schema-design | DB |
| `performance-optimization` | https://skills.sh/supercent-io/skills-template/performance-optimization | Frontend |
| `git-workflow` | https://skills.sh/supercent-io/skills-template/git-workflow | Dev workflow |

---

## 1. 🔐 Cybersecurity (`security-best-practices`)

### Problemi Attuali
- `@csrf_exempt` usato su endpoint critici (`parse_cv_upload_view`) senza autenticazione token
- Nessuna autenticazione JWT/token sulle API REST
- Credenziali email e token Stripe **nel codice o in `settings.py`** con rischio di push su git
- CORS configurato manualmente senza whitelist sicura
- `db.sqlite3` committato nel repo (contiene dati sensibili)

### Miglioramenti Proposti
```
backend/
├── mybackend/
│   ├── settings.py       ← Spostare segreti su .env (python-decouple)
│   └── urls.py           ← Rimuovere csrf_exempt, aggiungere autenticazione
├── api/
│   ├── views.py          ← Aggiungere @permission_classes([IsAuthenticated])
│   └── authentication.py ← Implementare JWT (djangorestframework-simplejwt)
```

**Azioni concrete:**
1. Installare `python-decouple` → spostare `SECRET_KEY`, token Stripe, email in `.env`
2. Aggiungere `.env` e `db.sqlite3` a `.gitignore`
3. Sostituire `@csrf_exempt` con autenticazione JWT su tutti gli endpoint
4. Implementare rate limiting con `django-ratelimit`
5. Aggiungere validazione del tipo file prima del parsing CV (whitelist: PDF, DOCX)
6. Sanitizzare tutti gli input utente lato backend

---

## 2. 🧪 Testing (`backend-testing`, `testing-strategies`)

### Problemi Attuali
- `api/tests.py` vuoto
- Nessun test automatico sul parsing CV
- Nessun test di integrazione frontend-backend
- Nessun CI/CD configurato

### Miglioramenti Proposti

#### Backend (Python/Django)
```python
# backend/api/tests.py
class CVParseTest(TestCase):
    def test_pdf_upload_returns_json(self): ...
    def test_invalid_file_returns_400(self): ...
    def test_resume_match_similarity_score(self): ...
    def test_get_json_data_returns_200(self): ...

class AuthTest(TestCase):
    def test_unauthenticated_request_returns_401(self): ...
    def test_jwt_token_flow(self): ...
```

**Tools da usare:**
- `pytest-django` per test semplici e veloci
- `factory_boy` per generare dati di test
- `coverage.py` per misurare copertura (target: >70%)

#### Frontend (TypeScript/React)
```
frontend/
├── src/
│   ├── __tests__/
│   │   ├── Welcome.test.tsx     ← Render test
│   │   ├── ModalUpload.test.tsx ← Upload flow test
│   │   └── Dashboard.test.tsx   ← Data loading test
```

**Tools da usare:**
- `vitest` + `@testing-library/react`
- `msw` (Mock Service Worker) per mockare le API Django

#### CI/CD
```yaml
# .github/workflows/ci.yml
- Lint Python (flake8/ruff)
- Test Django (pytest)
- Build Frontend (npm run build)
- Lint TypeScript (eslint)
```

---

## 3. 🏗️ Refactoring Linguaggi (`code-refactoring`, `api-design`)

### Backend Python

**Problemi:**
- Import duplicati in `views.py` (doppio `import os`, doppio `from django.http import JsonResponse`)
- Logica di business nei view (parsing CV dovrebbe essere in un service separato)
- Modelli `Item` e `User` troppo semplici, `User` non usa `AbstractBaseUser`

**Refactoring proposto:**
```
backend/
├── api/
│   ├── views/
│   │   ├── __init__.py
│   │   ├── cv_views.py        ← parse_cv_upload_view, match_resume
│   │   └── item_views.py      ← ItemListCreate, get_json_data
│   ├── services/
│   │   ├── cv_parser.py       ← Logica parsing estratta da views
│   │   └── resume_matcher.py  ← Wrapper resume-matcher
│   └── models.py              ← Aggiungere UserProfile con AbstractBaseUser
```

### Frontend TypeScript/React

**Problemi:**
- Nessuna gestione centralizzata delle chiamate API (fetch sparsi nei componenti)
- Mancanza di tipi TypeScript espliciti per i dati del CV
- Nessun gestione degli errori UI (loading states, error boundaries)

**Refactoring proposto:**
```
frontend/src/
├── api/
│   ├── cvApi.ts               ← Tutte le chiamate al backend
│   └── types.ts               ← Interfacce TypeScript per CV, User, ecc.
├── hooks/
│   ├── useCVUpload.ts         ← Custom hook per upload
│   └── useDashboard.ts        ← Custom hook per dati dashboard
├── components/
│   └── ErrorBoundary.tsx      ← Gestione errori globale
```

---

## 4. ⚡ Performance (`performance-optimization`)

### Frontend
- **Lazy loading** delle pagine React con `React.lazy` + `Suspense`
- **Code splitting** per `StripeCheckout` (carica solo quando necessario)
- **Ottimizzare immagini** CV (`testCV.jpg` nel bundle → usare CDN o `vite-imagetools`)
- **React Query** o `SWR` per cache delle chiamate API

### Backend
- **Aggiungere indici** al database per query frequenti
- **Cache** dei risultati del CV parsing con Redis (parsing è CPU-intensive)
- **Upload async** con Celery + Redis per file grandi

---

## 5. 🗄️ Database (`database-schema-design`)

### Schema Attuale (troppo semplice)
```python
class Item(models.Model):
    name = CharField(max_length=100)
    created_at = DateTimeField(auto_now_add=True)
```

### Schema Proposto
```python
class UserProfile(AbstractBaseUser):
    email = EmailField(unique=True)
    is_verified = BooleanField(default=False)
    plan = CharField(choices=['free','pro','enterprise'])
    stripe_customer_id = CharField(...)
    created_at = DateTimeField(auto_now_add=True)

class CVData(models.Model):
    user = ForeignKey(UserProfile, on_delete=CASCADE)
    raw_json = JSONField()          # Dati estratti dal parser
    template_slug = CharField(...)  # Template scelto
    language = CharField(...)       # 'it', 'en', ecc.
    is_published = BooleanField(default=False)
    slug = SlugField(unique=True)   # Per URL tipo /enrico.baldasso
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)

class Payment(models.Model):
    user = ForeignKey(UserProfile, on_delete=CASCADE)
    stripe_payment_id = CharField(...)
    amount = DecimalField(...)
    status = CharField(choices=['pending','paid','failed'])
    created_at = DateTimeField(auto_now_add=True)
```

---

## 6. 🚀 Roadmap Prioritizzata

| Priorità | Task | Skill Coinvolta | Stima |
|----------|------|-----------------|-------|
| 🔴 Alta | Spostare segreti su `.env` | `security-best-practices` | 1h |
| 🔴 Alta | Aggiungere JWT auth alle API | `security-best-practices` | 3h |
| 🔴 Alta | Implementare verifica email | `security-best-practices` | 4h |
| 🟠 Media | Scrivere test backend | `backend-testing` | 4h |
| 🟠 Media | Refactoring views.py → services | `code-refactoring` | 3h |
| 🟠 Media | Redesign schema DB | `database-schema-design` | 3h |
| 🟠 Media | Completare integrazione Stripe | `api-design` | 5h |
| 🟡 Bassa | Aggiungere i18n React | `code-refactoring` | 3h |
| 🟡 Bassa | Test frontend con Vitest | `testing-strategies` | 4h |
| 🟡 Bassa | Cache parsing CV con Redis | `performance-optimization` | 4h |
| 🟡 Bassa | CI/CD GitHub Actions | `git-workflow` | 2h |
| 🟡 Bassa | Route sottodominio `/name.surname` | `api-design` | 3h |
