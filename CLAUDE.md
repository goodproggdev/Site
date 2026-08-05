# SiteCV — contesto di progetto per Claude

Questo file esiste per far ripartire una sessione Claude "a memoria vuota" senza perdere il contesto
delle sessioni precedenti. Leggilo per intero prima di iniziare a lavorare. Tienilo aggiornato: quando
chiudi un lavoro importante o prendi una decisione che vincola il futuro, aggiungi qui una riga.

**C'è anche `BACKLOG.md`** nella root del repo: è la coda di miglioramenti/fix trovati con un audit
globale (05/08/2026) di backend, frontend, testing/CI/CD, prodotto — pensata per essere eseguita voce
per voce in autonomia in sessioni future. Se non hai un compito specifico da questa sessione, quella è
la fonte primaria di "cosa fare dopo". Contiene anche 2 voci CRITICHE che richiedono conferma esplicita
dell'utente prima di agire (credenziali reali esposte nella history git) — leggile per prime.

`BACKLOG.md` contiene anche una sezione **ROADMAP** (aggiunta 05/08/2026, dal confronto con una lista di suggerimenti generici "Git+Vercel+Supabase" che l'utente ha condiviso in `CV_Update.md`): elenca cosa NON è stato fatto in autonomia e perché (migrazione Next.js/Astro, Supabase Auth/RLS/Realtime nativi, PWA, Sentry, OAuth social login, DB branching Supabase — tutte cose che richiedono una riscrittura architetturale, un account esterno con credenziali, o una decisione di prodotto che l'utente non ha ancora preso). Leggila prima di riproporre queste idee da zero.

## Cos'è il progetto

SiteCV (repo GitHub `goodproggdev/SiteCV`) è una piattaforma che genera pagine CV pubbliche a partire
da un CV caricato dall'utente. Stack: Django 5.1 + DRF (backend), React + Vite + TypeScript (frontend),
Postgres su Supabase, deploy su Vercel (backend come funzione serverless Python, frontend come static
build). Repo locale in questa sandbox: root del progetto (contiene `backend/`, `frontend/`, `vercel.json`).

Sito live: **https://site-eight-swart-34.vercel.app**
Push su `main` → deploy automatico Vercel, ci mette circa **90–160 secondi** a essere live. Aspetta
prima di verificare, non dare per scontato che sia già deployato subito dopo il push.

Vercel e GitHub sono già loggati nel browser Chrome collegato a questa sessione (account
`goodproggdev/SiteCV`, progetto Vercel legato a quel repo).

## L'idea centrale del prodotto (importante, non stravolgerla)

Dato un CV caricato + area/categoria professionale scelta + posizioni lavorative target, la piattaforma
deve generare una **pagina CV pubblica reale**, in stile "sito personale", non una scheda/card compatta
dentro il prodotto. I due riferimenti di design/contenuto voluti dall'utente (Enrico li ha fatti lui
stesso, ha autorizzato esplicitamente lo scraping/analisi del loro HTML/CSS per migliorare fedeltà
visiva) sono:

- https://enrico2399.github.io/Enrico/ (freelance IT/developer)
- https://enrico2399.github.io/Leo/ (fashion production manager — ha "My Services" ma NON ha
  "Packs Pricing": è l'evidenza usata per decidere quali categorie mostrano il pricing)

**Decisione esplicita dell'utente presa in sessione precedente**: è stata scartata un'implementazione
intermedia a "card compatte" (componente `CvPublicExtraSections`, ora rimosso) in favore del vero
template a pagina intera. Istruzione testuale dell'utente: *"Leva e Sostituisci"*.

**Non fare** (richiesta esplicitamente annullata dall'utente, non reintrodurla): pulizia mobile del
componente "Dashboard Preview" (mostrare solo l'immagine, togliere il contenitore dinamico) e aggiunta
di demo grafiche alle pillole in "La nostra offerta completa". L'utente ha bloccato questa richiesta e
ha chiesto di fare il vero sistema a template al suo posto.

**Non riprendere senza nuova indicazione esplicita**: indagine sul progetto Vercel "nordev-website"
(team `sitie-gestionali`, https://vercel.com/sitie-gestionali/nordev-website) — build fallita trovata
per caso, relazione con questo repo non chiara, l'utente ha fermato esplicitamente l'indagine
("STOP what you are doing and wait for the user to tell you how to proceed").

## Architettura del sistema a template (stato: implementato e verificato in produzione)

**Backend — categoria e contenuti**
- `backend/api/models.py` → modello `CVData`: campi `category` (CharField, 6 scelte:
  `digitale-it`, `ingegneri-tecnici`, `sanitari-assistenziali`, `commerciale-vendita`,
  `amministrative-finanziarie`, `logistica`), `target_positions` (CharField libero), `show_pricing`
  (BooleanField, default True — governa SOLO la sezione Tariffe, non Servizi), `template_slug`
  (CharField, default `'default'`, pensato per multi-template futuro), `slug` (SlugField, generato
  automaticamente in `save()` come `{email_local_part}-{uuid6}` se assente).
- `backend/api/services/cv_category_content.py` → `generate_category_sections()` riempie
  expertise/servizi/pricing/statistiche quando l'estrazione reale dal CV lascia questi campi vuoti,
  pescando da `backend/api/data/category_templates.json` (banca contenuti per categoria, portata dai
  file JSON di esempio del frontend). `_PRICING_DEFAULT_CATEGORIES = {"digitale-it",
  "commerciale-vendita"}` — solo queste due mostrano Tariffe di default.
- Pipeline parsing: `parse_cv_from_file()` in `cv_service.py` → parser locali EN/IT (pyresparser/spaCy,
  esclusi dal deploy Vercel slim, quindi falliscono quasi sempre in produzione) → fallback
  `apply_deterministic_quality_repair()` (regex, in `cv_quality_repair.py`) +
  `enrich_mapped_cv_from_plain_text()` (in `cv_plain_text_enrich.py`) → `map_extracted_data_to_template()`
  in `demo_resume_parser.py` → eventualmente `generate_category_sections()`.
- `backend/api/views.py` → `parse_cv_upload_view` legge `category`/`target_positions`/`show_pricing`
  da `request.data`; `CVPublicView.get()` ritorna `raw_json` arricchito con `_category`,
  `_show_pricing`, `_template_slug`.

**Routing pagina pubblica**
- `vercel.json`: `/u/(.*)` → `backend/mybackend/wsgi.py` (routes array, verificato in questa sessione).
- `backend/mybackend/urls.py`: `re_path(r'^u/(?P<slug>[^/]+)/?$', cv_public_shell_view,
  name='cv-public-shell')`.
- `backend/api/cv_public_html_views.py` → `cv_public_shell_view()`: vista SSR-shell custom, genera
  meta tag (OG, JSON-LD) lato server per i crawler, poi monta la SPA React estraendo gli script/link
  da `frontend/dist/index.html`. Ha risposte 404 custom (non generiche Django) per i casi
  "not_published"/"not_found".
- Frontend: `frontend/src/App.tsx` — route `/u/:slug` (legacy, top-level) e `/:lang/cv/:slug` (alias,
  nested). `isPublicCvRoute(pathname)` + componente `AppShell` nascondono Navbar/Footer della
  piattaforma su queste route (bug preesistente, diventato visibile solo ora che la pagina pubblica è
  un sito standalone vero — fixato in questa sessione, commit `bb77910b0`).

**Template React pubblico**
- `frontend/src/components/cv-template/templateRegistry.tsx` → mappa `template_slug` → componente,
  oggi solo `default: PublicCvTemplateDefault`. Pensato per estendere con altri template/stili in
  futuro (richiesta esplicita dell'utente: *"la cosa migliore sarebbe avere più template con stili
  diversi"* — ancora da fare, oggi c'è un solo template).
- `frontend/src/components/cv-template/PublicCvTemplateDefault.tsx` → layout sidebar fissa a sinistra
  (avatar iniziali, nome, bottone "Stampa CV" via `window.print()`, nav ancore, social icon), contenuto
  a destra: Chi Sono + Info Personali, Statistiche animate (`StatCounter.tsx`, animazione su mount, non
  su scroll — IntersectionObserver rimosso perché nell'ambiente di test Chrome lo scroll non si
  propaga), My Expertise, Portfolio (con modal), Resume (esperienza+formazione, timeline 2 colonne),
  Skills+Languages, Servizi + CTA, Pricing (gated su categoria+flag), Blog opzionale, Footer/Contatti.
- `frontend/src/components/cv-template/categoryTheme.ts` → 7 temi colore Tailwind statici (classi
  letterali, necessario per JIT — niente interpolazione dinamica dei nomi colore) per categoria +
  `default`.
- Font: "Dosis" (headings) + "Source Sans 3" (body), caricati via Google Fonts in `frontend/index.html`
  — deliberatamente diversi dal font di brand della piattaforma ("Plus Jakarta Sans"), per far sembrare
  la pagina pubblica un sito a sé.
- `frontend/src/utils/cvPublicTemplateData.ts` e `frontend/src/utils/cvExtraSections.ts` → adapter che
  leggono i campi dal `raw_json`/payload pubblico (expertise, servizi, pricing, statistiche, social,
  blog, `_category`, `_show_pricing`).

## Bug fixati in questa sessione (verificati live, non ripetere la diagnosi)

1. **Nome mancante in hero** ("Il Tuo Nome" placeholder) → parser IT/EN non disponibili su Vercel →
   aggiunta euristica conservativa `_guess_name_from_first_lines()` in `cv_plain_text_enrich.py`.
2. **Residuo parentesi tipo "(e)"** dopo "Presente/presente" → regex `_parse_period()` in
   `cv_quality_repair.py` non aveva `\b` dopo gli alternativi → fixato.
3. **Righe di continuazione diventavano voci separate** in esperienza/formazione → aggiunta
   `_merge_continuation_lines()` in `cv_quality_repair.py`.
4. **Navbar/Footer piattaforma sopra il template pubblico** → fixato con `AppShell`/`isPublicCvRoute`
   in `App.tsx` (commit `bb77910b0`).
5. **Link pubblico "Not Found" dopo pubblicazione dal builder wizard** (il bug segnalato dall'utente
   che ha aperto questa sessione) → **due cause distinte**, entrambe fixate:
   - a) `CVPublishStep.tsx` leggeva lo slug da `cvData.parsedData?.slug`, sempre `undefined` perché
     `CVUploadStep.tsx` fa `delete rawPayload.slug` prima di salvarlo come `parsedData`. Fix: aggiunto
     un campo `slug` dedicato nello state del wizard, popolato da `CVUploadStep.tsx` e da
     `apiCvRecordToWizard()` in `cvRawJsonMap.ts` (commit `f03d70599`).
   - b) **Bug più grave, stale closure in `CVWizard.tsx`**: `handleNext()` controllava
     `!cvData.cvId` per decidere se creare una bozza vuota (`createCvDraft()`). Ma
     `CVUploadStep.tsx.onDrop()` chiama `updateCVData({cvId, parsedData, slug, ...})` e poi
     sincronamente `onNext()` (= `handleNext`) nello stesso tick: React non ha ancora applicato lo
     state, quindi `handleNext` leggeva ancora `cvId === null` e creava SEMPRE una bozza vuota
     separata al primo upload, scartando il CV reale appena caricato (100% riproducibile, non un
     edge case). Fix: aggiunto `cvIdRef` (`useRef`) aggiornato in modo sincrono dentro
     `updateCVData()` ogni volta che cambia `cvId`; `handleNext` ora controlla `!cvIdRef.current`
     invece della closure state (commit `fe2d1a403`).
   - **Verificato end-to-end dal vivo** via browser: upload reale di un CV di test attraverso
     `/it/builder`, dati correttamente popolati in ogni step del wizard, pubblicazione riuscita,
     pagina `/u/<slug>` che mostra il template completo con i dati reali (non più 404).

## Cose note ma NON ancora sistemate

- **`category`/`target_positions` vuoti per i CV creati via `/it/builder`**: il flusso wizard
  (`CVUploadStep.tsx`) non invia questi campi all'upload, a differenza della UI separata
  `frontend/src/pages/Upload.tsx` (usata altrove) che invece li invia. Risultato: il sistema di
  contenuti per categoria (`generate_category_sections`) funziona solo per i CV caricati via
  `Upload.tsx`, non per quelli caricati via `/it/builder`. Da riconciliare — o si aggiunge la UI di
  scelta categoria/posizioni anche in `CVUploadStep.tsx`, o si sposta la scelta in un altro step del
  wizard (es. `CVFormStep`).
- **CV di test accumulati nel dashboard dell'account usato per i test** (circa 10 record, quasi tutti
  "Bozza" vuoti creati durante il debug di questa sessione): slug tipo `enricobaldasso01-14afd4`,
  `-a3d67f`, `-291047`, `-334228`, `-f7fa92`, `-81f769`, più un paio di "Pubblicato" di verifica.
  L'eliminazione dal dashboard è permanente e irreversibile ("L'azione non si può annullare") — non
  è stata fatta perché è un'azione distruttiva che va confermata dall'utente stesso dal dashboard
  (icona cestino su ogni card, in "I tuoi CV").
- **Un solo template esistente** (`default`) nel `templateRegistry` — l'utente ha chiesto più stili in
  futuro, non ancora fatto.
- **"nordev-website" su Vercel**: build fallita trovata per caso, relazione con questo repo non
  chiarita, indagine fermata esplicitamente dall'utente. Non riprendere senza che lo chieda di nuovo.

## File chiave (mappa rapida)

Backend:
- `backend/api/models.py` — modello `CVData`
- `backend/api/views.py` — `parse_cv_upload_view`, `CVPublicView`
- `backend/api/serializers.py` — `CVDataSerializer`, `CVDataListSerializer`
- `backend/api/services/cv_service.py` — `parse_cv_from_file()`
- `backend/api/services/cv_category_content.py` — contenuti per categoria
- `backend/api/services/cv_quality_repair.py` — repair regex del parsing
- `backend/api/services/cv_plain_text_enrich.py` — enrichment nome/contatti
- `backend/api/data/category_templates.json` — banca contenuti per categoria
- `backend/demo_resume_parser.py` — `map_extracted_data_to_template()`
- `backend/api/cv_public_html_views.py` — SSR shell pagina pubblica + `cv_og_image_view`
  (immagine Open Graph dinamica per CV, vedi sotto)
- `backend/api/services/cv_og_image.py` — genera il PNG 1200x630 dell'immagine OG per CV
  (Pillow, gradiente per categoria, nessun font esterno — vedi commenti nel file)
- `backend/mybackend/urls.py` — routing incl. `/u/<slug>`

Frontend:
- `frontend/src/App.tsx` — routing, `AppShell`, `isPublicCvRoute`
- `frontend/src/pages/PublicCV.tsx` — monta il template dal registry
- `frontend/src/components/cv-template/` — `templateRegistry.tsx`, `PublicCvTemplateDefault.tsx`,
  `categoryTheme.ts`, `icons.tsx`, `StatCounter.tsx`
- `frontend/src/utils/cvPublicTemplateData.ts`, `frontend/src/utils/cvExtraSections.ts` — adapter dati
- `frontend/src/features/cv-builder/` — wizard: `CVWizard.tsx` (state+orchestrazione, `cvIdRef`),
  `CVUploadStep.tsx`, `CVFormStep.tsx`, `CVPreviewStep.tsx`, `CVPublishStep.tsx`
- `frontend/src/utils/cvRawJsonMap.ts` — `apiCvRecordToWizard()`
- `frontend/src/pages/Upload.tsx` — UI di upload alternativa (invia già category/target_positions)
- `frontend/index.html` — font Google (Dosis, Source Sans 3)

## Convenzioni operative per questo progetto

- Commit e commenti nel codice in italiano (segui lo stile già presente).
- Prima di ogni push: `npx tsc --noEmit -p .`, `npx eslint <file toccati>`, `npm run build`,
  `npx vitest run` dentro `frontend/`. Tutti verdi prima di committare.
- Dopo il push, aspetta ~90–160s prima di verificare in produzione (deploy Vercel non istantaneo).
- Per verifiche end-to-end reali, usa il browser Chrome collegato (già loggato) invece di fidarti delle
  sole chiamate API dirette: più di un bug in questa sessione (es. lo stale closure) era invisibile
  guardando solo le risposte API e si è visto solo simulando l'upload dal vivo nella UI.
- Autorizzazione generale dell'utente: puoi modificare/fixare liberamente il codice del progetto. Le
  azioni distruttive/irreversibili sul dato reale (es. cancellare CV pubblicati, cancellare record dal
  dashboard) vanno comunque confermate dall'utente stesso, non fatte in autonomia.
