# Changelog & Documentazione Progetto — Site

> Ultimo aggiornamento: 2026-03-09

---

## Stato Attuale del Progetto

Il progetto **Site** è un generatore di portfolio/CV online con:

- **Backend**: Django REST Framework (Python)
- **Frontend**: React + TypeScript (Vite) + TailwindCSS
- **Database**: SQLite (dev) + MongoDB (dati JSON)
- **Tool AI**: Resume Matcher, spaCy (EN + IT), NLTK per parsing CV
- **Pagine React**: Welcome, Upload, Dashboard, Pricing, StripeCheckout, Feature, Marketing, Preview, Statistics, Testimonials, ContactForm, About
- **TheCompany**: Sito landing HTML/CSS statico separato

---

## Commit Storici

| Hash | Messaggio |
|------|-----------|
| `8a6a747` | `imgicoload from site` (HEAD → main) |
| `a6d64f7` | `Enrico upload` |

---

## Funzionalità Implementate

### Backend (`/backend`)
- `api/views.py` — View REST per:
  - `ItemListCreate`: CRUD su modello `Item`
  - `get_json_data`: serve `data.json` come API
  - `match_resume`: confronto CV vs job description con similarità NLP
  - `parse_cv_upload_view`: upload file CV → estrazione testo → parsing EN/IT → mapping JSON strutturato
- `api/models.py` — Modelli `Item` e `User` (base)
- `api/serializers.py` — Serializzatori DRF
- `api/urls.py` — Routing API
- `resume_matcher_service.py` — Integrazione Resume-Matcher
- `demo_resume_parser.py` — Parser multi-lingua (spaCy EN + IT)

### Frontend (`/frontend/src`)
- `pages/Welcome.tsx` — Hero page con upload CV
- `pages/Upload.tsx` — Componente upload file
- `upload/ModalUpload.tsx` — Modal per caricamento
- `pages/Dashboard.tsx` — Dashboard utente
- `pages/Pricing.tsx` — Pagina prezzi
- `pages/StripeCheckout.tsx` — Integrazione pagamento Stripe (iniziata)
- `pages/Feature.tsx`, `Marketing.tsx`, `Testimonials.tsx` — Sezioni landing
- `layout/Navbar.tsx`, `layout/Footer.tsx` — Layout globale
- `pages/Preview.tsx` — Anteprima CV generato
- `pages/ContactForm.tsx` — Form contatti

### TheCompany (`/TheCompany`)
- Landing page HTML/CSS statica aziendale
- Logo, immagini, `index.html` + `style.css`

### MongoDB (`/MongoDB`)
- `data.json`, `mongoDBpy.py`, `printDB.py` — Integrazione MongoDB (sperimentale)

### Email (`/main/server_email`)
- `template.html` + `data.json` → `generate_html.py` → `email_from_html.py`
- Invio email automatico da HTML

---

## TODO In Sospeso (da `TODOEnrico.txt`)

| Priorità | Feature |
|----------|---------|
| Alta | Completare integrazione **Stripe** (pagamento) |
| Alta | Implementare **sessione utente** con scadenza |
| Alta | **Verifica email** a registrazione |
| Media | **i18n** (React-i18next + file JSON traduzioni) |
| Media | Pagamento alternativo **Revolut** + dashboard prezzi |
| Media | Parser CV → form % dati mancanti |
| Bassa | Copy testi reali (non standard) |
| Bassa | Pagina login separata per profilazione |
| Bassa | Route React per sottodominio (`domain/nome.cognome`) |
| Bassa | Footer, WhatsApp button, posizionamento SEO |

---

## Dipendenze Chiave

### Backend (Python)
- `django`, `djangorestframework`, `django-cors-headers`
- `spacy` (modelli `en_core_web_sm`, IT)
- `nltk`, `resume-matcher`
- `python-docx`, `PyPDF2` (o simili per estrazione testo)

### Frontend (Node.js)
- `react`, `react-router-dom`
- `typescript`, `vite`
- `tailwindcss`
- `stripe` / `@stripe/stripe-js`
