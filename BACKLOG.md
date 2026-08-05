# SiteCV — Backlog di miglioramenti e fix

Questo file è una coda di lavoro pensata per essere eseguita in autonomia da sessioni Claude future,
una voce alla volta. Per il contesto generale del progetto leggi prima `CLAUDE.md` nella root del repo.

## Come usare questo file

1. Scegli la voce con priorità più alta tra quelle non ancora spuntate (`[ ]`), a meno che tu non abbia
   un'indicazione diversa dall'utente per questa sessione.
2. Leggi per intero i file citati nella voce prima di modificare — le descrizioni sono un punto di
   partenza verificato al momento della scrittura, non un sostituto della lettura del codice reale
   (il codice può essere cambiato da allora).
3. Fai un fix mirato per voce. Non accorpare più voci non correlate in un solo commit.
4. Verifica prima di committare:
   - Backend: `cd backend && python manage.py test` (aggiungi test mirati se la voce lo richiede).
   - Frontend: dentro `frontend/`, in ordine: `npx tsc --noEmit -p .`, `npx eslint <file toccati>`,
     `npm run build`, `npx vitest run`.
5. Commit in italiano, riferendo l'ID della voce nel messaggio (es. `fix(SEC-004): ...`).
6. Spunta la voce qui (`[x]`) e aggiungi in fondo alla voce una riga `Fatto: <hash commit>, <data>`.
7. Se il fix cambia un'assunzione architetturale o una decisione documentata in `CLAUDE.md`, aggiorna
   anche quel file.
8. Push su `main` solo dopo che tutte le verifiche del punto 4 sono verdi. Aspetta ~90–160s prima di
   verificare in produzione (tempo di deploy Vercel).

**Eccezione — voci marcate "RICHIEDE CONFERMA UTENTE"**: non eseguirle in autonomia. Sono azioni
distruttive/irreversibili (riscrittura history git, rotazione credenziali) che vanno solo segnalate e
proposte in chat, mai eseguite senza un sì esplicito dell'utente in quella sessione.

Questa lista è stata prodotta da un audit del 05/08/2026 (analisi in parallelo di backend, frontend,
testing/CI/CD). Non è esaustiva per sempre: quando la esaurisci, rifai un audit dello stesso tipo
prima di dichiarare il progetto "pulito".

---

## Indice per priorità

### Azione immediata, non rimandabile (vedi dettaglio in fondo alla sezione SEC)
- [ ] **SEC-001** — Credenziale email Gmail reale esposta nella history git — RICHIEDE CONFERMA UTENTE
- [ ] **SEC-002** — History git con PII (CV utenti reali) e virtualenv committati — RICHIEDE CONFERMA UTENTE

### Alta priorità
- [ ] SEC-003 — Stripe: price/feature/plan controllati dal client, entitlement falsificabili
- [ ] SEC-004 — Endpoint upload file anonimo, CSRF-exempt, nessun limite
- [x] SEC-005 / TEST-001 — CI frontend non fallisce mai davvero (fallback `|| echo` su typecheck/lint/test)
- [ ] DATA-001 — `Entitlement.unique_together` con booleano → leak entitlement su resubscribe
- [ ] DATA-002 — Backend non permette di aggiornare `category`/`target_positions`/`show_pricing`/`template_slug` su un CV esistente
- [ ] BE-008 — Parsing CV silenziosamente vuoto in produzione se manca `CV_PARSE_USE_OPENAI`
- [ ] FE-001 — `pages/Upload.tsx` (2615 righe, `@ts-nocheck`) dead code ancora referenziato
- [ ] FE-004 — Nessuna UI nel wizard live per scegliere categoria/posizioni target
- [ ] FE-005 — "URL personalizzato" nel publish step non viene mai persistito
- [ ] FE-006 — `PublicCvTemplateDefault.tsx` testo hardcoded misto IT/EN, non usa i18n
- [ ] FE-007 — Dashboard: errore di fetch silenziato, nessun feedback utente
- [ ] FE-008 — Modal portfolio senza focus trap/ESC/ARIA
- [x] TEST-002 — Test E2E Playwright esistono ma non girano mai in CI (in continue-on-error finché non c'è una prima run reale)
- [ ] TEST-003 — Copertura test quasi nulla su upload/wizard/pubblicazione CV
- [ ] PROD-001 — Un solo template nel registry nonostante la promessa di più stili
- [ ] PROD-002 — Contenuti auto-generati per categoria non segnalati come "da personalizzare"

### Media priorità
- [ ] SEC-006 — `match_resume`/`resume_matcher_service` rotto + path traversal potenziale nel codice morto
- [ ] SEC-007 — Password hardcoded in `create_local_dev_user.py`
- [ ] SEC-008 — `frontend/src/.env` tracciato in git
- [ ] SEC-009 — `CVUpdateView.post` nessuna validazione su `raw_json`
- [ ] SEC-010 — Nessun rate limit dedicato su endpoint costosi (parsing CV, checkout Stripe)
- [ ] SEC-011 — Errori interni esposti al client via `str(e)`
- [ ] DATA-003 — N+1 query in `CVDashboardView.get`
- [ ] DATA-004 — `CVDataListSerializer` mai usato, `my_cv_list` ritorna `raw_json` per ogni riga
- [ ] BE-001 — ~150 righe di codice morto/rotto: flusso verifica email/reset password custom mai collegato
- [ ] BE-006 — `MEDIA_ROOT` filesystem locale incompatibile con Vercel se `USE_S3_STORAGE` non impostato
- [ ] BE-007 — Cache `LocMemCache` no-op su ambiente serverless multi-istanza
- [ ] FE-002 — `upload/ModalUpload.tsx` dead code
- [ ] FE-003 — `pages/Hero.tsx` + `useCVUpload.ts` dead code e comunque rotto
- [ ] FE-009 — Timer autosave/copy-hint non ripuliti allo smontaggio
- [ ] FE-010 — Chiamate API dirette non tipizzate bypassano il layer `cvApi.ts`
- [ ] FE-011 — Toggle "Visibilità" senza nome accessibile
- [ ] FE-012 — `vendor-ui` (flowbite-react) 216KB, tree-shaking limitato
- [ ] FE-013 — `PublicCvTemplateDefault.tsx` monolitico (556 righe)
- [ ] FE-014 — Test coverage frontend bassissima e in parte placeholder
- [ ] TEST-004 — Copertura backend con buchi su webhook Stripe, email, job matching
- [ ] TEST-005 — Soglia di coverage backend bassa (50%), assente per il frontend in CI
- [ ] TEST-006 — `docker-compose.yml` non allineato al deploy reale Vercel
- [ ] PROD-003 — Anteprima pre-pubblicazione poco esplicita
- [ ] PROD-004 — Multi-lingua CV dichiarata ma non rispettata sulla pagina pubblica (prodotto)
- [ ] PROD-005 — Copy/UX poco chiari per link scaduto o CV non pubblicato

### Bassa priorità
- [ ] SEC-005b — Confronto token non a tempo costante (`secrets.compare_digest`)
- [ ] SEC-013 — JWT in `localStorage`, `isAuthenticated()` non controlla `exp`
- [ ] DATA-005 — `CVData.user` nullable ma slug generato solo se `user` presente
- [ ] DATA-006 — Email case-sensitive a livello DB, mitigata solo in application layer
- [ ] DATA-007 — Modello `Item` legacy morto
- [ ] BE-003 — `except Exception` generici e `print()` invece di logging
- [ ] BE-004 — Codice duplicato irraggiungibile in `extract_text`
- [ ] BE-005 — `backend/package.json` fuori posto
- [ ] FE-015 — `vite.config.ts` `manualChunks` punta a file morto
- [ ] FE-016 — Dipendenza `flowbite` (non -react) probabilmente inutilizzata
- [ ] FE-017 — `updateCVData` non memoizzato, re-render extra
- [ ] FE-018 — Interfaccia `CV` duplicata tra `Dashboard.tsx` e `api/types.ts`
- [ ] FE-019 — Listener globali Navbar con closure potenzialmente stale
- [ ] FE-020 — Duplicazione handler copy-link/copy-linkedin identici
- [x] TEST-007 — `vercel.json` schema legacy, nessun header di cache esplicito (headers per asset statici aggiunti; migrazione a `rewrites` non fatta, resta a schema legacy)
- [ ] TEST-008 — Dipendenze backend non pinnate su librerie critiche
- [ ] PROD-006 — Gestione multi-CV per utente poco chiara / limiti piano Free non verificati

---

## SEC — Sicurezza

### SEC-001 [CRITICA] — Credenziale email Gmail reale esposta nella history git — RICHIEDE CONFERMA UTENTE
`git log --all -p -- 'main/.env'` (e percorso analogo `main/server_email/.env`) mostra in chiaro
`EMAIL_USER=sitiegestionali@gmail.com` e `EMAIL_PASS=grsm skbn jpyv djml` (formato Gmail App Password),
committati e poi solo cancellati in un commit successivo — il blob resta recuperabile da chiunque
cloni il repo (`git log -p`/`git show <sha>`), ed è raggiungibile dal branch `main` attuale, non da un
branch orfano già ripulito.
**Azione**: 1) rotea/revoca SUBITO quella app password su Google, indipendentemente da quando verrà
riscritta la history — è l'unica azione davvero urgente qui, il resto è pulizia. 2) Dopo la rotazione,
proponi all'utente di riscrivere la history (`git filter-repo` per rimuovere tutti i blob `*.env`
storici) e fare un force-push. Questo è distruttivo e cambia gli hash di tutti i commit: va fatto solo
con un sì esplicito dell'utente in quella sessione, e solo dopo aver spiegato che tutti i collaboratori
dovranno ri-clonare.

### SEC-002 [ALTA] — History git con PII e virtualenv committati — RICHIEDE CONFERMA UTENTE
`.git` pesa 486MB in-pack. Blob ancora raggiungibili da `main`: CV/curriculum reali caricati da utenti
(dato personale, es. `backend/media/uploads/original/IBM10.pdf`, `main/assets/cv/CV.pdf` — rilevante
GDPR) e un intero virtualenv Python (`backend/env/lib/python3.12/site-packages/...`, centinaia di MB).
La pulizia già fatta in sessioni precedenti (task storici "rimuovere _pip_check", "untrack db.sqlite3")
ha tolto questi path dal tracking attuale ma non dalla history — restano scaricabili.
**Azione**: stesso intervento di SEC-001, un'unica riscrittura history con `git filter-repo` per tutti
i path sensibili insieme (`*.env`, `backend/env/`, `backend/media/uploads/`, `main/`), poi
`git gc --prune=now --aggressive`. RICHIEDE CONFERMA UTENTE per lo stesso motivo di SEC-001.

### SEC-003 [ALTA] — Stripe: price/feature/plan controllati dal client
`backend/api/views.py::create_stripe_checkout_view`: `price_id` passato a Stripe senza whitelist;
`metadata["feature"]`/`metadata["plan_type"]` presi letteralmente da `request.data`. Nel webhook
(`stripe_webhook_view`, stesso file) questi metadata vengono fidati per creare `Entitlement` e settare
`user.plan` — un utente può comprare il prezzo più economico e dichiarare nel body
`feature=premium_template`/`plan_type=enterprise`, ottenendo l'entitlement enterprise a prescindere da
cosa ha pagato.
**Fix**: mappa server-side `{price_id: (feature, plan_type)}` in settings, derivare feature/plan da lì
ignorando i valori inviati dal client; validare `price_id` contro whitelist prima di creare la sessione.

### SEC-004 [ALTA] — Endpoint upload file anonimo, CSRF-exempt, nessun limite
`backend/mybackend/views.py::upload_file`, montata su `/api/v1/upload/` e `/upload/`
(`backend/mybackend/urls.py`). View Django "nuda" con `@csrf_exempt` esplicito: non eredita permessi
DRF, nessuna auth richiesta, nessun limite di dimensione/whitelist estensione (a differenza di
`validate_cv_file` usato altrove). Chiunque può caricare file arbitrari salvati permanentemente.
**Fix**: se è legacy/morto, rimuoverlo; altrimenti `@api_view` + `IsAuthenticated`, riusare
`validate_cv_file`, limitare dimensione.

### SEC-005 [ALTA] (= TEST-001) — CI frontend non fallisce mai davvero
**Fatto (05/08/2026)**: rimossi i fallback `|| echo` da typecheck/lint/build/vitest nel job `frontend`
di `.github/workflows/ci.yml` — verificato che tutti e 4 passano puliti sullo stato attuale del repo
prima di renderli bloccanti (nessuna regressione nascosta dietro i fallback rimossi).

`.github/workflows/ci.yml`, job `frontend`: `npm run typecheck || echo "..."`,
`npm run lint || echo "..."`, `npm run test -- --run || echo "Tests failed but continuing..."` —
ogni comando ha un fallback che rende il job sempre verde a prescindere dall'esito.
**Fix**: rimuovere i fallback `|| echo`, far fallire il job sugli errori reali.

### SEC-006 [MEDIA-ALTA] — `match_resume`/`resume_matcher_service` rotto + path traversal potenziale
`backend/api/resume_matcher_service.py::read_json` apre `filepath` preso direttamente da
`request.data.get("resume_file", ...)` in `views.py::match_resume` (`IsAuthenticated`, nessun
`os.path.basename`/whitelist directory). Oggi l'endpoint va sempre in 500 prima di arrivare al file
read perché `from scripts.similarity.get_score import get_score` fallisce (`scripts/similarity/` non
esiste nel repo) — ma è codice morto pericoloso: se qualcuno "aggiusta" l'import senza notare il
problema, il file-read arbitrario torna vivo.
**Fix**: rimuovere endpoint + service (feature abbandonata), o riscrivere con path fissi lato server.

### SEC-007 [MEDIA] — Password hardcoded in script di dev
`backend/scripts/create_local_dev_user.py:27` — `DEV_PASSWORD = "NordevitDev2024!"` in chiaro.
**Fix**: leggere da env var con default `None`, fallire se non impostata fuori da ambienti locali.

### SEC-008 [MEDIA] — `frontend/src/.env` tracciato in git
Contiene oggi solo un placeholder (`VITE_STRIPE_PUBLIC_KEY=your_stripe_pk_key`), ma il file è tracciato
nonostante il pattern `.env` in `.gitignore` (aggiunto prima che il pattern lo coprisse — gitignore non
è retroattivo). Rischio: chi ci scrive un valore reale per test locali lo committa senza rendersene conto.
**Fix**: `git rm --cached frontend/src/.env`, usare solo `.env.example`/`.env.local`.

### SEC-009 [MEDIA] — `CVUpdateView.post` nessuna validazione su `raw_json`
`backend/api/views.py::CVUpdateView.post`: `cv.raw_json = request.data.get('cv_data'); cv.save()` senza
controllo di schema/tipo/dimensione — un JSONField non limitato che poi finisce pari pari nella
risposta pubblica `CVPublicView`.
**Fix**: validare con un serializer/schema minimo prima del save (tipi attesi, dimensione massima).

### SEC-010 [MEDIA] — Nessun rate limit dedicato su endpoint costosi
`REST_FRAMEWORK.DEFAULT_THROTTLE_RATES` è globale (`user: 100/min`). `parse_cv_upload_view` (chiama
potenzialmente OpenAI a pagamento) e `create_stripe_checkout_view` non hanno `throttle_scope` dedicato.
**Fix**: `ScopedRateThrottle` con scope tipo `cv_upload: 5/min`.

### SEC-011 [MEDIA] — Errori interni esposti al client via `str(e)`
`backend/mybackend/views.py::upload_file` e `contact_view` restituiscono `str(e)` grezzo al client,
potenzialmente con path filesystem interni (rilevante su Vercel dove il filesystem è read-only tranne
`/tmp` — errori di storage rivelerebbero dettagli interni).
**Fix**: loggare l'eccezione completa server-side, messaggi generici al client.

### SEC-005b [BASSA] — Confronto token non a tempo costante
`backend/api/services/cv_public_access.py::resolve_public_cv`: `token != policy.access_token` invece
di `secrets.compare_digest(token, policy.access_token)`. Rischio basso (token 80 bit) ma fix banale.

### SEC-013 [BASSA] — JWT in `localStorage`, nessun controllo `exp`
`frontend/src/api/cvApi.ts` salva access/refresh token in `localStorage` (non `httpOnly` cookie).
`useAuth.ts::isAuthenticated()` verifica solo la presenza del token, non `exp` — la UI può mostrare
"loggato" per un token già scaduto finché una richiesta reale non fallisce con 401.
**Fix**: quantomeno controllare `exp` lato client in `isAuthenticated()`; valutare in futuro un refresh
token in cookie `httpOnly`+`SameSite=Strict`.

---

## DATA — Modello dati

### DATA-001 [ALTA] — `Entitlement.unique_together` con booleano → leak entitlement
`backend/api/models.py::Entitlement.Meta.unique_together = ['user', 'feature', 'is_active']`. In
`stripe_subscription_sync.py::sync_entitlement_from_subscription`, alla cancellazione si fa
`ent.is_active = False; ent.save()` sulla riga attiva. Scenario riproducibile: abbonamento → cancella
(riga A: `is_active=False`) → riabbonamento (nuova riga B, `is_active=True`, creata perché nessuna riga
attiva esiste più) → cancella di nuovo → il tentativo di impostare B a `is_active=False` viola il
vincolo unique (esiste già `(user, feature, False)` = riga A) → `IntegrityError`, catturato da un
`except Exception` generico nel webhook, loggato ma l'entitlement NON viene mai disattivato: l'utente
mantiene l'accesso pagante nonostante l'abbonamento cancellato.
**Fix**: rimuovere `is_active` dal vincolo unique (usare `['user', 'feature']` con una sola riga per
feature, storicizzando altrove) oppure `UniqueConstraint(condition=Q(is_active=True))` su Postgres per
garantire "al più una riga attiva".

### DATA-002 [ALTA] — Backend non permette di aggiornare categoria/posizioni/pricing/template su CV esistente
`create_cv_draft_view` (usato dal wizard) crea `CVData` senza `category`/`target_positions`/
`show_pricing`. `CVUpdateView.post` aggiorna SOLO `raw_json`, non tocca questi campi. L'unico punto che
valorizza `category` è `parse_cv_upload_view` (upload con parsing). Quindi non è solo "il frontend non
li invia" (vedi FE-004): manca proprio l'endpoint per settarli su un CV già creato via wizard.
**Fix**: aggiungere `category`/`target_positions`/`show_pricing`/`template_slug` come campi opzionali
aggiornabili in `CVUpdateView.post`, con la stessa validazione contro `CVData.CATEGORY_CHOICES` già
presente in `parse_cv_upload_view`. Vedi FE-004 per la controparte UI — vanno risolti insieme per avere
un flusso funzionante end-to-end.

### DATA-003 [MEDIA] — N+1 query in `CVDashboardView.get`
`backend/api/views.py`: `cvs = CVData.objects.filter(user=profile)` poi nel loop
`policy = getattr(cv, 'link_policy', None)` — una query per ogni CV (relazione OneToOne non
pre-caricata).
**Fix**: `.select_related('link_policy')`.

### DATA-004 [MEDIA] — `CVDataListSerializer` mai usato
Definito in `backend/api/serializers.py` apposta per escludere `raw_json` dalle liste, ma
`my_cv_list` usa `CVDataSerializer` completo — payload superfluo con `raw_json` per ogni CV in lista.
**Fix**: usare `CVDataListSerializer` in `my_cv_list`.

### DATA-005 [BASSA] — `CVData.user` nullable ma slug generato solo se `user` presente
`CVData.save()`: `if not self.slug and self.user: ...` — se `user` è `None`, slug resta `''`, e il
campo ha `unique=True, blank=True`: una seconda riga con `user=None` violerebbe l'unicità a livello DB.
Nei path attuali `user` non è mai `None` in pratica (l'endpoint risponde 401 prima), ma il campo
nullable è vestigiale e fuorviante.
**Fix**: rendere `user` non-nullable, oppure generare comunque uno slug univoco (uuid) se assente.

### DATA-006 [BASSA] — Email case-sensitive a livello DB
`UserProfile.email` ha `unique=True` case-sensitive in Postgres, mentre login/lookup usano `__iexact`
con mitigazioni difensive nel codice (usa il record più vecchio, logga warning) per doppioni tipo
"Test@x.com" vs "test@x.com" creati fuori dal flusso di registrazione. La causa radice resta aperta.
**Fix**: `UniqueConstraint(Lower('email'), name='unique_lower_email')`.

### DATA-007 [BASSA] — Modello `Item` legacy morto
`backend/api/models.py::Item` + view collegate, montate solo su `/api/legacy/items/` in
`api/legacy_urls.py`, marcate "legacy" nei commenti, nessun uso applicativo reale visibile.
**Fix**: verificare che nessun client lo usi ancora, poi rimuovere modello + migration + route.

---

## BE — Backend, qualità e config

### BE-001 [MEDIA] — Flusso verifica email/reset password custom morto e rotto
`backend/api/views.py` (`send_verification_email_view`, `verify_email_view`,
`email_verification_status_view`, `request_password_reset_view`, `confirm_password_reset_view`) non
sono importate in nessun `urls.py`. Sono inoltre rotte: `request_password_reset_view`/
`confirm_password_reset_view` leggono/scrivono `user.password_reset_token`/`password_reset_sent_at`,
campi che non esistono su `UserProfile` — se mai richiamate, `save(update_fields=[...])` solleva
eccezione. Il flusso vero in produzione passa da `dj-rest-auth`/`allauth`
(`mybackend/registration_urls.py`, `api/auth_serializers.py::SpaPasswordResetSerializer`).
**Fix**: eliminare le view morte, i metodi collegati su `UserProfile` (`hash_verification_token`,
`generate_email_verification_token`, `verify_email`, `resend_verification_email`) e
`api/services/email_service.py` se non si vuole rimpiazzare il flusso allauth con questo.

### BE-006 [MEDIA] — `MEDIA_ROOT` filesystem locale incompatibile con Vercel
`settings.py::MEDIA_ROOT` punta al filesystem locale, usato da `default_storage.save(...)` in
`upload_file` quando `USE_S3_STORAGE=False` (default). Su Vercel il filesystem è read-only tranne
`/tmp`: se `USE_S3_STORAGE` non è impostato esplicitamente su Vercel, l'upload fallisce con un errore
filesystem il cui messaggio grezzo torna al client (vedi SEC-011).
**Fix**: rendere `USE_S3_STORAGE` obbligatorio/validato quando `DEBUG=False`, fallire l'avvio con un
errore esplicito se manca la config storage in produzione.

### BE-007 [BASSA] — Cache `LocMemCache` no-op su serverless
Nessun `CACHES` esplicito in `settings.py`; `api/services/job_adapters.py` usa
`django.core.cache.cache` (TTL 1h) per risultati job-search. Su Vercel ogni invocazione può girare in
un container diverso: la cache in memoria non persiste tra richieste, rendendo il meccanismo di fatto
inefficace in produzione.
**Fix**: backend condiviso (Redis/Upstash) via env var, o documentare che è no-op su Vercel.

### BE-008 [ALTA] — Parsing CV silenziosamente vuoto se manca `CV_PARSE_USE_OPENAI`
`CV_PARSE_USE_OPENAI` in `settings.py` ha default `False`. Su Vercel spaCy/pyresparser/nltk sono esclusi
di proposito (fallback graceful corretto lato codice). Ma se l'operatore dimentica di impostare
`CV_PARSE_USE_OPENAI=True` + `OPENAI_API_KEY` nelle env var Vercel, ogni upload CV in produzione
produce dati strutturati quasi vuoti, con risposta HTTP 200 "di successo" — nessun errore visibile,
degrado silenzioso della feature core del prodotto.
**Fix**: loggare un warning ad alta visibilità in avvio se `DEBUG=False`, `CV_PARSE_USE_OPENAI=False` e
nessun parser locale disponibile; considerare un healthcheck che lo verifichi ad ogni deploy.

### BE-003 [BASSA] — `except Exception` generici e `print()` invece di logging
27 occorrenze di `except Exception` generico e 44 di `print()`, concentrate in
`mybackend/views.py`, `demo_resume_parser.py`, `api/services/job_adapters.py`.
**Fix**: eccezioni specifiche dove possibile, `logging` invece di `print`, mai `str(e)` grezzo al client.

### BE-004 [BASSA] — Codice duplicato irraggiungibile in `extract_text`
`backend/mybackend/views.py::extract_text`: dopo il primo blocco try/except (che ritorna sempre),
segue un secondo blocco quasi identico, sempre irraggiungibile.
**Fix**: eliminare il secondo blocco.

### BE-005 [BASSA] — `backend/package.json` fuori posto
Contiene `@stripe/stripe-js` e `axios` (dipendenze frontend) dentro la cartella backend Django, non
referenziato da nulla lato Python.
**Fix**: rimuovere o spostare nel frontend se serve davvero.

---

## FE — Frontend

### FE-001 [ALTA] — `pages/Upload.tsx` dead code (2615 righe, `@ts-nocheck`)
Nessun file importa `pages/Upload.tsx` (verificato con grep esaustivo, statico e dinamico), non è in
nessuna route di `App.tsx`. Resta esportato dal barrel `pages/index.ts` ma mai consumato. Ha
`// @ts-nocheck` in testa — unico punto di tutto il repo col type-checking disattivato in blocco.
Contiene l'intera logica di categoria (6 JSON: `logistica.json`, `amministra.json`, `commerciale.json`,
`sanita.json`, `Tecnico.json`, `IT.json`), localStorage, generazione ZIP (`jszip`+`file-saver`, usate
SOLO da questo file). `vite.config.ts` lo referenzia ancora in `manualChunks` (vedi FE-015).
**Fix**: eliminare il file, i 6 JSON associati, l'export dal barrel, le dipendenze `jszip`/`file-saver`
da `package.json`. ATTENZIONE: prima di eliminare, verificare se la logica di categoria (`categoryDataMap`)
va recuperata per FE-004 — potrebbe contenere codice riutilizzabile per la UI di scelta categoria da
aggiungere al wizard vero, non buttarla senza controllare.

### FE-002 [MEDIA] — `upload/ModalUpload.tsx` dead code
`frontend/src/upload/ModalUpload.tsx` (108 righe) + `frontend/src/upload/index.ts`, nessun import da
nessuna parte del progetto.
**Fix**: rimuovere file e barrel.

### FE-003 [MEDIA] — `pages/Hero.tsx` + `useCVUpload.ts` dead code e comunque rotto
`Hero.tsx` non importato da nessun componente (`Home.tsx` non lo usa). Unico consumatore di
`useCVUpload` è questo componente morto. Anche ipotizzando che venga rimontato, il flusso è rotto: dopo
`upload(file)` con `state === 'success'`, nessun ramo gestisce quello stato (solo `'uploading'` ha un
ramo dedicato) — nessun redirect, nessun messaggio, l'utente resta davanti alla dropzone.
**Fix**: rimuovere entrambi, o completare l'integrazione se era pensato come landing widget alternativo.

### FE-004 [ALTA] — Nessuna UI nel wizard live per scegliere categoria/posizioni target
**Aggiornamento post-audit (commit `0db0fb36f`, già in `main`)**: `uploadAndParseCV()` in `cvApi.ts` ora
accetta `category`/`targetPositions` opzionali e li invia in FormData se presenti — quindi il "tubo"
verso il backend esiste. **Ma il chiamante reale non è stato aggiornato**: `CVUploadStep.tsx` chiama
ancora `uploadAndParseCV(file)` senza secondo/terzo argomento (verificato — nessuna UI di scelta
categoria in nessun punto del flusso raggiungibile). Il gap funzionale descritto sotto è quindi ancora
integralmente presente, cambia solo dove va fatto il prossimo passo (non serve più toccare `cvApi.ts`,
solo `CVUploadStep.tsx`/`CVFormStep.tsx` + UI).

`uploadAndParseCV(file)` come oggi chiamato invia in FormData solo `cv_file` — nessun `category`/
`target_positions`. Il vecchio `Upload.tsx` (morto, FE-001) li inviava. Verificato con grep su tutto
`features/cv-builder/`, `CvSiteEditor.tsx`, `BuilderPage.tsx`: in nessun punto del flusso raggiungibile
dall'utente esiste una UI per la categoria. Risultato concreto: `categoryTheme.ts` implementa 6 temi
visivi selezionati in base a `readCvCategory(raw)`, ma ogni CV creato dal wizard live ricade sempre sul
tema "default" — il sistema di theming per categoria non è mai raggiungibile in pratica.
**Fix**: aggiungere uno step (o un campo in `CVFormStep`) per scegliere categoria/posizioni target, e
passarli alla chiamata già pronta `uploadAndParseCV(file, category, targetPositions)`. Va risolto
insieme a DATA-002 (serve anche l'endpoint di update per i CV che non passano più dall'upload iniziale,
o per permettere di cambiare categoria dopo la creazione).

### FE-005 [ALTA] — "URL personalizzato" nel publish step non viene mai persistito
`CVPublishStep.tsx`: il campo `customSlug` (placeholder "mario-rossi") non viene mai inviato al
backend — `handlePublish` chiama solo `updateCVLinkPolicy(cvId, visibility, expiryMonths)`, nessun
parametro slug. `customSlug` è usato solo per COSTRUIRE il testo mostrato in UI
(`cvData.slug || customSlug`), non per registrare realmente lo slug: se il CV ha già uno slug diverso,
l'URL mostrato/copiato dall'utente punta a uno slug non pubblicato → link rotto/404 per l'utente finale.
**Fix**: implementare l'endpoint di update-slug lato backend e chiamarlo da qui, oppure rimuovere il
campo dalla UI se non è supportato (per non promettere una feature che non esiste).

### FE-006 [ALTA] — `PublicCvTemplateDefault.tsx` testo hardcoded misto IT/EN
Il componente non usa `useTranslation()`. Etichette fisse nel JSX, alcune in inglese ("My Expertise",
"Resume", "Skills", "Languages", "Services", "Pricing", "News") e altre in italiano ("Esperienze
Lavorative", "Formazione", "Info Personali", "Contattami", "Parliamone"), più la nav sidebar hardcoded
in italiano ("Chi Sono", "Contatti"). Ogni pagina CV pubblica mostra questo mix fisso a prescindere
dalla lingua del CV o del visitatore — rilevante perché è la pagina "vetrina" mostrata a terzi
(recruiter, clienti) via link condiviso su LinkedIn.
**Fix**: aggiungere `useTranslation()`, spostare le stringhe in `it.json`/`en.json` (namespace
`publicCvTemplate.*`), e far rispettare la lingua del CV (`raw.language`) non quella del browser del
visitatore — collegato a PROD-004.

### FE-007 [ALTA] — Dashboard: errore di fetch silenziato
`Dashboard.tsx::fetchDashboardData`: se la chiamata fallisce (rete, 500, token scaduto), il `catch` fa
solo `console.error`, nessuno stato di errore mostrato. `loading` passa a `false` e la dashboard appare
come se l'utente non avesse CV/statistiche — ingannevole, sembra "non hai ancora creato nulla" invece
di "errore di caricamento".
**Fix**: stato `error` dedicato + banner con retry.

### FE-008 [ALTA] — Modal portfolio senza focus trap/ESC/ARIA
`PublicCvTemplateDefault.tsx`: il modal portfolio è un `<div>` con `onClick` per chiudere — manca
`role="dialog"`/`aria-modal`, manca `aria-labelledby`, nessun focus trap (tab esce dal modal), nessuna
gestione `Escape`, focus non spostato all'apertura né restituito alla chiusura. Il bottone di chiusura
usa solo `<CloseIcon />` senza `aria-label`. Contrasto: `Navbar.tsx` usa `Modal` di flowbite-react per
login/signup, che gestisce tutto questo internamente — qui è stato scritto un modal custom da zero
senza replicare quelle garanzie.
**Fix**: usare `Modal` di flowbite-react anche qui, o aggiungere manualmente `role="dialog"`,
`aria-modal`, gestione `keydown Escape`, focus trap, `aria-label` sul bottone di chiusura.

### FE-009 [MEDIA] — Timer autosave/copy-hint non ripuliti allo smontaggio
`CVWizard.tsx`: `saveTimerRef` (debounce 900ms in `updateCVData`) e il `setTimeout` di 2s in
`persistDraft` non hanno cleanup in un `useEffect` allo smontaggio. Stesso pattern in
`CVPublishStep.tsx` (tre `setTimeout` per `copyHint`, mai salvati in ref né ripuliti). Nello stesso
codebase il pattern corretto esiste già altrove (`CvSiteEditor.tsx` righe 168-171,
`Dashboard.tsx` righe 84-90) — usa quelli come riferimento.
**Fix**: salvare i timer in ref, `useEffect(() => () => clearTimeout(...), [])`.

### FE-010 [MEDIA] — Chiamate API dirette non tipizzate bypassano `cvApi.ts`
`cvApi.ts` dichiara esplicitamente che tutte le fetch devono passare da lì con funzioni tipizzate.
`Dashboard.tsx` (righe con `cvApi.get('/api/v1/dashboard/')`, `/api/v1/jobs/matches/`,
`/api/v1/cv/extraction-kpi/`) e `PublicCV.tsx` chiamano invece l'istanza axios raw: `response.data` è
implicitamente `any`. Più insidioso di un `any` esplicito perché non compare come tale in nessun grep.
**Fix**: aggiungere funzioni tipizzate in `cvApi.ts` (es. `getDashboard(): Promise<DashboardResponse>`)
e usarle ovunque al posto delle chiamate dirette.

### FE-011 [MEDIA] — Toggle "Visibilità" senza nome accessibile
`CVPublishStep.tsx`: `<Label value={...} />` e `<Toggle checked={isPublic} onChange={setIsPublic} />`
sono elementi fratelli separati, senza `htmlFor`/`id` che li colleghi, senza passare `label` al
`Toggle` (che la supporta, vedi `components/Toggle.tsx`). Uno screen reader sente solo "checkbox, non
selezionato" senza contesto.
**Fix**: passare `label={t('builder.publish.visibility.label')}` a `Toggle`, o collegare
`htmlFor`/`id`.

### FE-012 [MEDIA] — `vendor-ui` (flowbite-react) 216KB, tree-shaking limitato
Solo 12 componenti flowbite-react usati (`Alert, Button, Card, DarkThemeToggle, FileInput, Label,
Modal, Progress, Select, Spinner, TextInput, Textarea`) su 30+ disponibili, ma il chunk pesa 216KB
gzip 60KB perché `flowbite-react` non ha `sideEffects` nel suo `package.json` — Rollup non può
garantire tree-shaking sicuro del resto (Table, Sidebar, Tabs, Accordion, ecc. potenzialmente inclusi).
**Fix**: valutare import diretti dai sotto-path se supportati dalla versione installata, o sostituire i
componenti più semplici (Alert, Spinner, Progress) con markup Tailwind nativo (pattern già presente nel
codebase, es. spinner custom in `App.tsx`).

### FE-013 [MEDIA] — `PublicCvTemplateDefault.tsx` monolitico (556 righe)
Un solo componente gestisce hero, about, statistiche, expertise, portfolio+modal, resume, skills/
lingue, servizi, pricing, blog, footer — 13 sezioni condizionali in un solo `return`.
**Fix**: estrarre ogni sezione in componenti separati sotto `components/cv-template/sections/`
(`AboutSection`, `PortfolioSection`, `ResumeSection`, ecc.), migliora testabilità e leggibilità. Farlo
PRIMA o INSIEME a FE-006/FE-008 per non dover toccare lo stesso file monolitico più volte in sequenza.

### FE-014 [MEDIA] — Test coverage frontend bassissima e in parte placeholder
Solo 5 file di test (`account-panel`, `app`, `cv-site-editor`, `navbar-auth-nav`, `pricing-route`) per
51 componenti/pagine. Nessun test per `CVWizard`, `CVUploadStep`, `CVFormStep`, `CVPreviewStep`,
`CVPublishStep`, `PublicCvTemplateDefault`, `Dashboard`, `cvApi.ts`, `cvRawJsonMap.ts`. Alcuni test
esistenti sono poco significativi (es. `app.test.tsx`: `expect(typeof useCVUpload).toBe("function")`
verifica solo che l'export esista; `expect(document.body).toBeTruthy()` dopo un render è sempre vero;
un test su `isAuthenticated` chiama una funzione mockata che ritorna sempre `false` per definizione,
non testa la logica reale).
**Fix**: rimuovere/rafforzare i test placeholder, aggiungere copertura reale sul wizard (vedi TEST-003,
sono lo stesso problema visto da angolazioni diverse — coordinare il lavoro).

### FE-015 [BASSA] — `vite.config.ts` `manualChunks` punta a file morto
`manualChunks: { 'cv-builder': ['./src/pages/Upload.tsx'], ... }` — il chunk generato pesa 0.12kB
(sostanzialmente vuoto) perché punta al file morto di FE-001. Il vero flusso builder finisce in chunk
separati non raggruppati.
**Fix**: risolvere insieme a FE-001 — aggiornare la entry a
`./src/features/cv-builder/CVWizard.tsx` (+ step) o rimuoverla.

### FE-016 [BASSA] — Dipendenza `flowbite` (non -react) probabilmente inutilizzata
Elencata in `package.json` come dependency di produzione, mai importata in nessun `.ts`/`.tsx`.
**Fix**: verificare e rimuovere se non serve.

### FE-017 [BASSA] — `updateCVData` non memoizzato, re-render extra
`CVWizard.tsx`: `updateCVData` ricreata a ogni render, usata come dep in vari `useCallback` di
`CVFormStep.tsx` — vanifica la memoizzazione lì (overhead, non bug).
**Fix**: wrappare `updateCVData` in `useCallback` con deps stabili.

### FE-018 [BASSA] — Interfaccia `CV` duplicata tra `Dashboard.tsx` e `api/types.ts`
`Dashboard.tsx` definisce una propria interfaccia locale `CV` invece di riusare/estendere `CVData` da
`api/types.ts` — stesso concetto di dominio con campi diversi.
**Fix**: unificare in un unico tipo condiviso (es. `CVSummary` esteso da un tipo base).

### FE-019 [BASSA] — Listener globali Navbar con closure potenzialmente stale
`Navbar.tsx`: listener `open-signup`/`open-login` registrati con `eslint-disable
react-hooks/exhaustive-deps` e deps `[]`. Oggi non causa bug visibili (le funzioni usano solo
setter/ref sempre aggiornati), ma è lo stesso pattern di rischio già visto in `CVWizard.tsx` prima del
fix `cvIdRef` — un futuro refactor che aggiunga una lettura di stato dentro quelle funzioni
introdurrebbe silenziosamente lo stesso tipo di bug.
**Fix**: wrappare in `useCallback` con deps corrette per eliminare il rischio strutturale.

### FE-020 [BASSA] — Duplicazione handler copy-link/copy-linkedin identici
`CVPublishStep.tsx` (`handleCopyLink`/`handleCopyLinkedInUrl`) e `Dashboard.tsx`
(`handleCopyPublicUrl`/`handleCopyLinkedInUrl`): corpo identico, nessuna logica specifica per
LinkedIn nonostante il nome lo suggerisca.
**Fix**: consolidare in un helper condiviso; valutare se serve davvero un formato diverso per LinkedIn
o se il bottone va rinominato per non promettere una feature che non fa nulla di diverso.

---

## TEST — Testing, CI/CD, DevOps

### TEST-001 — vedi SEC-005 (stesso identico problema, riferimento incrociato)

### TEST-002 [ALTA] — Test E2E Playwright esistono ma non girano mai in CI
**Fatto (05/08/2026)**: job `e2e-setup` placeholder sostituito con un job reale `e2e` in
`.github/workflows/ci.yml` che installa Playwright/Chromium e gira `npx playwright test` col webServer
di `vite preview` (nessun backend Django live in CI: `auth-login.spec.ts` si auto-skippa via
`E2E_SKIP_AUTH_LOGIN=1`, `site-audit.spec.ts` gira per davvero). **Non verificabile end-to-end in questa
sessione**: il sandbox di lavoro non ha accesso di rete per scaricare i binari di Chromium
(`playwright install` bloccato da allowlist di rete), quindi la wiring è stata validata solo leggendo il
codice dei test/config, non con una run reale — per questo il job è `continue-on-error: true` finché non
c'è una prima esecuzione vera in CI (dove GitHub Actions ha accesso di rete pieno) da cui giudicare
l'affidabilità. Controllare l'esito della prima PR/push dopo questo commit e togliere
`continue-on-error` quando si è verificato che è stabile.

`.github/workflows/ci.yml`, job `e2e-setup` era solo un placeholder (`echo "E2E tests would run
here..."`). Nel repo esistono realmente `frontend/e2e/auth-login.spec.ts` e `site-audit.spec.ts` con
`playwright.config.ts` funzionante e webServer configurato — non venivano mai eseguiti automaticamente.

### TEST-003 [ALTA] — Copertura test quasi nulla su upload/wizard/pubblicazione CV
Il flusso "carica CV → parsing → wizard → pubblica" (il cuore del prodotto) non ha una sola riga di
test frontend reale (vedi anche FE-014). Nessun test tocca `CVWizard`, `CVUploadStep`, `CVPublishStep`.
**Fix**: test di integrazione (RTL + mock axios/MSW) per: upload file valido → stato di parsing → step
form popolato → submit pubblicazione → redirect a slug pubblico; includere casi di errore (file non
valido, parser non disponibile, upload troppo grande).

### TEST-004 [MEDIA] — Copertura backend con buchi su webhook Stripe, email, job matching
`backend/api/tests.py` (741 righe, 37 test) copre bene auth JWT, CRUD CV, upload/parsing, entitlement,
KPI extraction. Mancano test su: firma/validazione webhook Stripe contro payload malformati o non
firmati (deve rispondere 400, non 500 — collegato a DATA-001, un test qui avrebbe reso visibile quel
bug), invio email, e l'intera area job matching (`get_job_matches`, `refresh_job_matches`,
`update_job_match_status`).
**Fix**: aggiungere test per webhook Stripe con signature invalida/mancante, test email con backend
console/mock, test happy-path + autorizzazione per i 3 endpoint di job matching.

### TEST-005 [MEDIA] — Soglia coverage backend bassa, assente per il frontend in CI
`.github/workflows/ci.yml`: `coverage report --fail-under=50` — permissivo per un prodotto con
pagamenti e dati personali. Frontend ha `@vitest/coverage-v8` configurato (`npm run coverage` esiste)
ma non è mai invocato in CI, nessuna soglia enforced.
**Fix**: alzare gradualmente la soglia backend (65-70%), aggiungere un check coverage frontend in CI
con soglia minima iniziale bassa per evitare regressioni.

### TEST-006 [MEDIA] — `docker-compose.yml` non allineato al deploy reale Vercel
`docker-compose.yml` + `backend/Dockerfile` installano lo stack NLP pesante completo (spaCy, nltk,
pyresparser, pymupdf via `requirements.txt`) e MinIO. Il deploy reale Vercel usa
`requirements-vercel.txt` (slim, solo OpenAI, senza spaCy/nltk/pymupdf per stare sotto il limite
serverless) e nessun MinIO. Un test locale via docker-compose non garantisce che il comportamento in
produzione (parsing "OpenAI-only") sia lo stesso. Il job CI `docker-build` verifica solo che le
immagini si costruiscano, mai un `docker-compose up` end-to-end.
**Fix**: documentare esplicitamente nel README che docker-compose è solo per sviluppo "full-featured" e
non rispecchia il runtime Vercel; opzionale: un secondo profilo docker-compose allineato a
`requirements-vercel.txt` per test di parità produzione.

### TEST-007 [BASSA] — `vercel.json` schema legacy, nessun header di cache esplicito
**Fatto parzialmente (05/08/2026)**: aggiunta una sezione `headers` top-level in `vercel.json` con
`Cache-Control: public, max-age=31536000, immutable` per `/assets/(.*)` e per i file con estensione
immagine/font — confermato dai docs Vercel che `headers` è combinabile con `routes` nello stesso file.
**Non fatto**: nessuna regola `no-cache` per `index.html`/le pagine HTML — la SPA serve tutte le route
non-asset tramite lo stesso `dest: frontend/index.html`, e la corrispondenza di `headers.source` guarda
il path RICHIESTO dal browser (`/`, `/it/dashboard`, ecc.), non il file di destinazione risolto da
`routes`: una regola tipo `"source": "/index.html"` non scatterebbe mai in pratica. Per farlo bene
servirebbe un pattern catch-all (`"source": "/(.*)"`) il cui comportamento di precedenza rispetto alle
regole più specifiche su `/assets/*` non è stato verificato su Vercel reale in questa sessione (nessun
accesso a un ambiente Vercel di test) — lasciato non fatto per non rischiare di rompere il caching degli
asset o la sostituzione dei bundle vecchi con un cambiamento non testato su un progetto di produzione.
Rimane comunque uno schema legacy (`builds`+`routes`) invece di `rewrites`/`cleanUrls`.
**Fix residuo**: se si vuole risolvere anche il caso HTML, testare prima su un progetto Vercel di
staging una regola catch-all con `no-cache, must-revalidate` verificando che non sovrascriva/con
prevalga in modo imprevisto sulle regole più specifiche di `/assets/*`.

### TEST-008 [BASSA] — Dipendenze backend non pinnate su librerie critiche
`dj-database-url`, `psycopg[binary]`, `django-storages[s3]` senza versione; `pypdf>=5.0.0`,
`pymupdf>=1.24.0`, `openai>=1.40.0`, `google-generativeai>=0.8.0`, `spacy>=3.7.2,<3.9` con range aperti.
Un aggiornamento minore può rompere silenziosamente il build di produzione (`requirements-vercel.txt`
reinstalla da zero a ogni build, vedi `backend/build_files.sh`).
**Fix**: pinnare con `==`/`~=`, generare un lockfile riproducibile (`pip-compile`/`pip freeze`).

---

## PROD — Prodotto / UX

Nota: questa sezione è basata sulla conoscenza diretta del prodotto accumulata nelle sessioni
precedenti (vedi `CLAUDE.md`) più gli incroci con l'audit frontend. A differenza delle altre sezioni,
non è stata verificata da un audit dedicato dell'ultima sessione (interrotto per un limite di sessione
esterno) — trattare le voci qui come ipotesi ad alta confidenza da confermare con una rilettura rapida
del codice/UI live prima di agire, non come fatti già ri-verificati riga per riga.

### PROD-001 [ALTA] — Un solo template nel registry nonostante la promessa di più stili
`templateRegistry.tsx` mappa `template_slug` → componente, oggi solo `default: PublicCvTemplateDefault`.
L'utente ha esplicitamente chiesto in passato "la cosa migliore sarebbe avere più template con stili
diversi" (vedi `CLAUDE.md`) — non ancora fatto. Il campo `template_slug` sul modello esiste già proprio
per questo, l'infrastruttura è pronta ma vuota.
**Fix**: progettare e implementare almeno un secondo template (stile visivamente distinto, es. ispirato
a un layout diverso dai due riferimenti), registrarlo in `templateRegistry.tsx`, ed esporre la scelta
nel wizard (probabilmente nello stesso step che risolve FE-004, dato che categoria e template sono
scelte concettualmente vicine per l'utente).

### PROD-002 [ALTA] — Contenuti auto-generati per categoria non segnalati come "da personalizzare"
`cv_category_content.py::generate_category_sections()` riempie expertise/servizi/pricing/statistiche
con contenuto generico dalla banca `category_templates.json` quando l'estrazione reale dal CV lascia
questi campi vuoti — comportamento voluto per non mostrare sezioni vuote. Rischio: se il wizard non
segnala chiaramente all'utente QUALI contenuti sono stati auto-generati (vs. estratti dal suo CV
reale), l'utente rischia di pubblicare una pagina pubblica con servizi/prezzi/statistiche inventati che
non corrispondono alla realtà, senza accorgersene, e quel link viene condiviso con recruiter/clienti.
**Fix**: verificare nello step di anteprima (`CVPreviewStep.tsx`) se c'è già un'indicazione visiva per i
contenuti auto-generati; se non c'è, aggiungere un badge/nota tipo "contenuto suggerito, personalizzalo"
sulle sezioni riempite da `generate_category_sections` invece che dal parsing reale (serve un flag che
distingua le due origini, oggi probabilmente non esiste — verificarlo prima di implementare la UI).

### PROD-003 [MEDIA] — Anteprima pre-pubblicazione poco esplicita
Da verificare in `CVPreviewStep.tsx`: è chiaro all'utente che quella è un'anteprima fedele di come
apparirà la pagina pubblica reale (stesso template, stessi dati), o è una vista semplificata che può
disallinearsi da cosa vedrà davvero un visitatore? Se è semplificata, valutare se mostrare il vero
componente `PublicCvTemplateDefault` anche in preview (con eventuale banner "anteprima").

### PROD-004 [MEDIA] — Multi-lingua CV dichiarata ma non rispettata sulla pagina pubblica
Il modello `CVData.language` supporta IT/EN/DE/FR/ES, ma `PublicCvTemplateDefault.tsx` ha testo
hardcoded misto IT/EN indipendente da questo campo (vedi FE-006). Lato prodotto: se l'obiettivo è
rivolgersi anche a mercati esteri (la scelta lingua nel modello lo suggerisce), una pagina pubblica
mistilingua danneggia la credibilità professionale dell'utente che la condivide con un recruiter
straniero.
**Fix**: stessa soluzione tecnica di FE-006, ma valutare priorità/roadmap dei mercati target insieme
all'utente prima di investire tempo su 5 lingue complete vs. solo IT+EN.

### PROD-005 [MEDIA] — Copy/UX poco chiari per link scaduto o CV non pubblicato
`cv_public_html_views.py` ha risposte 404 custom per i casi "not_published"/"not_found" (verificato in
sessioni precedenti), e il wizard ha un campo "Scadenza link" (es. 12 mesi). Da verificare: cosa vede
esattamente un visitatore quando il link è scaduto per tempo (vs. mai pubblicato) — sono due situazioni
diverse per l'utente-proprietario del CV (uno significa "rinnova", l'altro "non hai ancora pubblicato")
e potrebbero avere lo stesso messaggio generico oggi.
**Fix**: verificare il copy attuale nelle due risposte custom, differenziarlo se è uguale.

### PROD-006 [BASSA] — Gestione multi-CV per utente poco chiara / limiti piano Free non verificati
Da verificare: quanti CV può creare un utente sul piano Free, dove è enforced questo limite (se esiste),
ed è comunicato chiaramente nella Dashboard/durante la creazione di un nuovo CV? Il dashboard visto in
sessioni precedenti mostrava un contatore "CV Creati" senza un tetto visibile.
**Fix**: verificare in `backend/api/models.py`/`views.py` se esiste un limite legato al piano; se sì,
mostrarlo in UI prima che l'utente lo scopra da un errore; se no, valutare se è una lacuna del modello
di business o una scelta consapevole (piano Free illimitato in numero di CV, limitato solo in feature).

---

## Nota su un audit di prodotto/UX più approfondito

L'audit dedicato a gap di prodotto/UX (onboarding, pricing/entitlement lato utente, SEO/meta tag di
default, gestione errori utente-facing) è stato interrotto a metà da un limite di sessione esterno,
prima di produrre un report verificato riga per riga come gli altri tre. La sezione PROD qui sopra
copre gli stessi temi ma con un livello di verifica più basso. **Se hai tempo/contesto per rifarlo**,
rilancia un'analisi dedicata su: confronto tra promesse del design system e flusso realmente
raggiungibile, coerenza tra piani a pagamento e feature visibili, qualità dei meta tag OG/JSON-LD di
default sulla pagina pubblica, e gestione di tutti gli stati di errore lato utente (parsing fallito,
file non supportato, feature non nel piano, link scaduto).

---

## Fatto (05/08/2026) — dal confronto con `CV_Update.md`

L'utente ha condiviso una lista generica di migliorie "Git + Vercel + Supabase" (performance/caching,
Supabase RLS/Auth/Realtime/Storage, i18n/PWA/optimistic UI, DX/CI, analytics/SEO). Molti di quei
suggerimenti assumono un'architettura diversa da quella reale del progetto (Next.js/Astro con SSR/SSG,
Supabase usato come backend diretto dal client) — vedi la sezione ROADMAP sotto per il dettaglio punto
per punto. Le parti compatibili con lo stack reale (Django+DRF, React+Vite SPA, Postgres via ORM
Django, Vercel) sono state implementate direttamente:

- **OG-001 — Immagine Open Graph dinamica per il CV pubblico**: nuovo endpoint
  `GET /api/v1/cv/<slug>/og-image` (`backend/api/services/cv_og_image.py` +
  `cv_og_image_view` in `cv_public_html_views.py`, generazione PNG 1200x630 via Pillow con nome del CV,
  tagline e gradiente colore legato alla categoria professionale — stessa palette di
  `categoryTheme.ts`). `cv_public_shell_view` ora punta qui di default invece del logo generico
  (`PUBLIC_CV_OG_IMAGE` resta una via di fuga per forzare un'immagine fissa). Stessa policy di accesso
  della shell HTML (CV privati con token restano protetti anche per l'immagine). Verificato end-to-end
  con Django test client: CV pubblicato → immagine 200 col colore/nome corretti, CV inesistente → 404,
  meta `og:image` nella shell aggiornato di conseguenza. Aggiunto `Pillow==11.1.0` a
  `requirements.txt`/`requirements-vercel.txt` (libreria leggera, wheel precompilato, non c'entra con
  l'esclusione di spacy/nltk/pyresparser).
- **OG-002 — Cache headers per asset statici Vercel**: `vercel.json`, sezione `headers` top-level,
  `Cache-Control: public, max-age=31536000, immutable` per `/assets/(.*)` e per file
  jpg/jpeg/png/svg/ico/webp/gif/woff/woff2/ttf. Non toccata la parte HTML/no-cache (vedi TEST-007 per il
  motivo). Verificato che Vercel supporta `headers` insieme a `routes` legacy leggendo la documentazione
  ufficiale corrente (non c'era modo di testarlo su un deploy reale in questa sessione).
- **OG-003 — Vercel Web Analytics + Speed Insights**: aggiunti `@vercel/analytics` e
  `@vercel/speed-insights`, componenti `<Analytics />`/`<SpeedInsights />` montati in `App.tsx`. Sono
  no-op finché non si attiva il toggle "Web Analytics"/"Speed Insights" nelle impostazioni del progetto
  su vercel.com (azione da fare a mano nel dashboard, non automatizzabile da codice — non fatta in
  questa sessione, va abilitata quando si vuole iniziare a raccogliere i dati).
- **Vedi anche SEC-005/TEST-001, TEST-002, TEST-007** più sopra: la parte "DX/CI" del file (test E2E
  automatizzati, controlli che falliscono davvero) è stata affrontata nello stesso passaggio.

Tutto quanto sopra è stato verificato con: `npx tsc --noEmit`, `npx eslint`, `npm run build`,
`npx vitest run` (frontend, tutti verdi), `python manage.py test api` (37/37 verdi, nessuna
regressione) + un test manuale end-to-end del nuovo endpoint OG image via Django test client. La
wiring E2E in CI (TEST-002) NON è stata verificata con una run reale per mancanza di accesso di rete
nel sandbox di lavoro — vedi nota nella sezione TEST-002.

---

## ROADMAP — voci di `CV_Update.md` non implementate in autonomia

Queste voci richiedono o un cambio architetturale profondo, o account/credenziali esterne che
l'utente deve creare/fornire, o una decisione di prodotto che non è stata presa. Non sono state
implementate senza una conferma esplicita, coerentemente con le regole di questa sessione: azioni che
cambiano impostazioni di account o comportano riscritture rilevanti vanno proposte, non eseguite di
default.

### ROAD-001 — Passaggio a Next.js (App Router) o Astro per SSR/SSG
**Verdetto: non applicabile senza una riscrittura totale del frontend.** Il frontend è oggi una SPA
React+Vite con client-side rendering puro (routing via `react-router-dom`, nessun framework SSR). La
piattaforma ha già UNA pagina realmente server-renderizzata per i motivi giusti — la CV pubblica
(`cv_public_shell_view` + `cv_public_shell.html`, meta tag/OG/JSON-LD generati lato Django prima che la
SPA si monti) — proprio perché è l'unica pagina dove la SEO/social-sharing conta davvero (le altre sono
dietro login o pagine di marketing statiche). Migrare l'INTERO frontend a Next.js/Astro vorrebbe dire
riscrivere il routing, il data-fetching, l'auth (oggi JWT in localStorage con interceptor axios) e il
deploy (oggi un'unica funzione Vercel Python serve sia `/api` che `/u/*`, il frontend è un build statico
servito da un secondo step `@vercel/static-build`). È un progetto a sé, non una "miglioria" incrementale.
**Se interessa**: la domanda da farsi prima non è "quale framework" ma "quali pagine hanno davvero
bisogno di SEO/SSR" — probabilmente solo la home/marketing e la pagina CV pubblica (già risolta). Si
potrebbe valutare di *aggiungere* Next.js/Astro SOLO per le pagine di marketing pubbliche, lasciando il
resto (dashboard, builder, editor — tutto dietro login, nessun bisogno di SEO) come SPA Vite invariata.
Decisione di prodotto/architettura da prendere con l'utente, non da questa sessione.

### ROAD-002 — Row Level Security (RLS) granulare su Supabase
**Verdetto: non applicabile con l'architettura dati attuale.** Il progetto usa Supabase solo come
hosting del database Postgres — tutto l'accesso ai dati passa dall'ORM Django (`backend/api/models.py`,
viste DRF), con autenticazione/autorizzazione gestita interamente in Django (JWT, permessi DRF). Le
policy RLS di Postgres si applicano al ruolo con cui ci si connette al DB: Django si connette quasi
certamente con un ruolo con privilegi ampi (per poter fare join, migration, ecc.), che in Postgres
tipicamente bypassa RLS by design se ha `BYPASSRLS` o è il proprietario delle tabelle — verificare quale
ruolo/connection string usa `DATABASE_URL` in produzione prima di assumere che aggiungere RLS abbia
un qualunque effetto. Introdurre RLS "vera" richiederebbe che il FRONTEND si connetta direttamente a
Supabase (via `supabase-js` con anon key + JWT di Supabase Auth), bypassando l'attuale layer DRF — è
un cambio di architettura dati, non una configurazione aggiuntiva. **Non fatto.**

### ROAD-003 — Autenticazione multi-provider (Google/GitHub/Apple) + Magic Link/passkey
**Verdetto: parzialmente applicabile, ma richiede credenziali esterne che solo l'utente può creare.**
Il backend usa già `django-allauth` (vedi `requirements.txt`, `mybackend/registration_urls.py`), che
supporta nativamente login social (Google/GitHub/ecc.) — la libreria giusta è già nel progetto, non
serve Supabase Auth per questo. Aggiungere un provider richiede pero': creare un'app OAuth su Google
Cloud Console (o GitHub/Apple), ottenere `client_id`/`client_secret`, e configurarli come credenziali
`django-allauth` (env var o via Django admin, tabella `SocialApp`) — sono valori che solo l'utente puo'
generare (accesso al suo account Google/GitHub Developer). Passkey/WebAuthn e Magic Link via email
richiederebbero pacchetti aggiuntivi (`django-allauth` supporta i Magic Link/"Passwordless" solo in
versioni/piani recenti, da verificare) e un ripensamento del flusso login lato frontend. **Non fatto.**
**Prossimo passo se interessa**: l'utente crea le app OAuth (inizia con Google, è il piu' richiesto),
fornisce client_id/secret, poi è un cambio di codice contenuto (route + bottone "Accedi con Google").

### ROAD-004 — Supabase Realtime Subscriptions
**Verdetto: non applicabile senza cambiare come il frontend parla al database.** Stesso discorso di
ROAD-002: Realtime di Supabase funziona via websocket sulla connessione diretta client→Supabase, non
attraverso un backend Django in mezzo. Andrebbe deciso PRIMA se e quali funzionalità della piattaforma
beneficerebbero davvero di aggiornamenti realtime (notifiche? stato pubblicazione CV? oggi non ci sono
casi d'uso multi-utente/collaborativi nel prodotto che lo richiedano chiaramente — un CV è editato da
una sola persona alla volta). **Non fatto, e probabilmente basso valore per la forma attuale del
prodotto** finché non c'è un caso d'uso concreto che lo giustifichi.

### ROAD-005 — Supabase Storage + trasformazione immagini (webp/avif)
**Verdetto: parzialmente sovrapposto a scelte già fatte, non a Supabase Storage.** Il progetto gestisce
già lo storage file in modo configurabile (`USE_S3_STORAGE` in `backend/mybackend/settings.py`, vedi
anche BE-006 nel backlog sopra) — userebbe S3 (o compatibile), non Supabase Storage specificamente, e va
prima sistemato il fatto che oggi in produzione questo flag rischia di non essere impostato (vedi BE-006
e BE-008 per il rischio di degrado silenzioso). La generazione automatica di varianti webp/avif è
un'ottimizzazione reale ma indipendente dal provider di storage: si può fare con Pillow (già aggiunto in
questa sessione per l'OG image) lato backend, o lasciarla a un CDN/servizio di image optimization. **Non
fatto** — priorità più bassa di sistemare prima BE-006.

### ROAD-006 — PWA (Progressive Web App) e offline-first
**Verdetto: applicabile tecnicamente, ma il fit con QUESTO prodotto è dubbio — decisione di prodotto
prima che tecnica.** Una PWA con service worker/manifest ha senso per app usate ripetutamente offline
(es. note, task manager). SiteCV è, nella sua essenza, uno strumento usato occasionalmente (carica CV,
compila wizard, pubblica) più una pagina pubblica statica-nei-fatti condivisa con terzi — nessuna delle
due ha un bisogno ovvio di funzionare offline o di essere "installata" sulla home screen. Implementarla
comunque (es. con `vite-plugin-pwa`) è un lavoro contenuto, ma rischia di essere sforzo speso su una
feature che gli utenti non chiederanno. **Non fatto — prima capire se e perché serve**, non è stato
scartato per difficoltà tecnica ma per dubbio ritorno.

### ROAD-007 — Optimistic UI updates
**Verdetto: applicabile, buon candidato per un prossimo giro di lavoro autonomo — non fatto per
concentrare questa sessione sulle voci con evidenza più diretta.** Il caso d'uso più ovvio nel prodotto
è l'eliminazione di un CV dalla Dashboard (oggi presumibilmente aspetta la risposta del server prima di
aggiornare la lista) e forse "Copia link"/toggle visibilità. Aggiunto come TASK-ROAD-007 a bassa
priorità: da fare quando si toccano di nuovo `Dashboard.tsx`/`CVPublishStep.tsx` per altri motivi (vedi
FE-007, FE-009, FE-011 nel backlog sopra, stessi file).

### ROAD-008 — Type-safety end-to-end (analogo a `supabase gen types typescript`)
**Verdetto: il principio si applica, lo strumento concreto no** (non c'è uno schema Supabase generato
dal client, il DB è dietro Django). L'equivalente reale per questo stack è generare uno schema OpenAPI
dal backend DRF (`drf-spectacular`, non ancora installato) e poi generare i tipi TypeScript da quello
(es. `openapi-typescript`), invece di mantenere a mano interfacce come `CVData` in
`frontend/src/api/types.ts` (vedi FE-010, FE-018 nel backlog sopra per i problemi concreti che questo
causa già oggi). **Non fatto in questa sessione**: è uno scope ampio (tocca praticamente ogni funzione
in `cvApi.ts` e i tipi in tutto il frontend), da trattare come un progetto a sé, non un fix puntuale.
Buon prossimo passo se si vuole affrontare seriamente FE-010/FE-018.

### ROAD-009 — Database branching Supabase + Preview Deployments Vercel
**Verdetto: richiede configurazione a livello di dashboard/piano Supabase, non solo codice.** Il
database branching di Supabase è una feature del prodotto Supabase stesso (spesso legata a piani a
pagamento), da abilitare dal dashboard Supabase, non dal repo. Una volta abilitato lato Supabase, il
collegamento con le Preview Deployments di Vercel è comunque configurazione (env var diverse per
branch), non codice applicativo. **Non fatto** — richiede che l'utente verifichi/attivi la feature sul
proprio account Supabase prima che abbia senso lavorarci da qui.

### ROAD-010 — Sentry (o analogo) per error tracking in produzione
**Verdetto: applicabile, richiede solo un account/DSN esterno che l'utente deve creare.** L'integrazione
codice è quasi meccanica (`sentry-sdk` lato Django, `@sentry/react` lato frontend, poche righe di init
con la variabile `SENTRY_DSN`). **Non fatta in questa sessione** perché richiede che l'utente crei un
account Sentry (o servizio equivalente) e fornisca il DSN — nessuna azione di sola-lettura può
sostituire quel passo. Buon prossimo passo autonomo NON APPENA si ha un DSN da usare.

### ROAD-011 — hreflang / metatag dinamici sulle pagine di marketing (non la CV pubblica)
**Verdetto: la CV pubblica è già a posto, le pagine di marketing no — ma è un fix a basso ritorno dato
il CSR.** Verificato leggendo `cv_public_html_views.py`/`cv_public_shell.html`: la shell della pagina CV
pubblica genera già correttamente `<html lang="{{ html_lang }}">` dalla lingua reale del CV, canonical
URL, OG/Twitter/JSON-LD dinamici — questa parte NON aveva bisogno di intervento (la voce originaria
"correggere lang/hreflang sulla shell SSR" nella todo-list di questa sessione è stata chiusa senza
modifiche di codice per questo motivo). Le pagine di marketing (Home, Pricing, ecc.) invece hanno solo i
meta tag statici e generici di `frontend/index.html`, identici per ogni route e ogni lingua, perché sono
una SPA client-rendered senza libreria head-management (`react-helmet-async` non installata). hreflang
ha senso solo quando esistono più URL per la stessa pagina in lingue diverse: qui servirebbe prima
introdurre `react-helmet-async` (o simile) e gestire i meta per route — è un lavoro concreto ma il
ritorno SEO è incerto per pagine dietro autenticazione o comunque non pensate per traffico organico
multi-lingua. **Non fatto** — priorità bassa, valutare insieme a un eventuale ROAD-001 (SSR delle
pagine di marketing risolverebbe questo e altro insieme).

