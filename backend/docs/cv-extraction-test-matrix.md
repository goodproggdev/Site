# CV Extraction Test Matrix (Fast-First)

Questa matrice copre i casi realistici per la pipeline `local -> OpenAI text -> OpenAI vision` (senza Gemini) con obiettivo velocita`.

## KPI da tracciare per ogni caso

- `nordevit_extraction.stage_ms.total`
- `nordevit_extraction.path_taken`
- `nordevit_extraction.quality.initial.score`
- `nordevit_extraction.quality.final.score`
- presenza campi chiave: `name`, `email`, `phone`, almeno un item tra esperienza/formazione, `skills`

## Fixture consigliate

| Fixture ID | Tipo file | Caratteristiche | Path atteso | Aspettativa minima |
| --- | --- | --- | --- | --- |
| `pdf_text_layer_clean` | PDF | testo selezionabile, 1 colonna | `local` | score finale >= threshold senza LLM |
| `pdf_text_layer_multicol` | PDF | layout 2 colonne, icone contatti | `local` oppure `openai_text` | contatti estratti, skills non vuote |
| `pdf_scanned_image_only` | PDF | scannerizzato senza text layer | `local -> vision_pdf` | almeno name/email/phone + 1 esperienza |
| `docx_table_heavy` | DOCX | dati in tabelle e poche paragraphs | `local` | contatti + esperienza visibili |
| `doc_legacy_old_format` | DOC | CV vecchio formato | `local` (con eventuale libreoffice) | nessun crash, campi base valorizzati |
| `cv_bilingual_it_en` | PDF/DOCX | sezioni miste italiano/inglese | `local` o `openai_text` | name, summary, experience coerenti |

## Criteri pass/fail

- **Pass funzionale**: campi chiave presenti e JSON valido.
- **Pass performance**: p50 dei casi non scannerizzati deve evitare `vision_pdf`.
- **Fail critico**: score finale < score iniziale oppure perdita di campi gia` popolati.

## Automazione suggerita

1. Unit test con mock per i branch di gating (`api/tests.py`).
2. Test di integrazione su fixture reali (cartella `backend/tests/fixtures/cv/`).
3. Job periodico che calcola trend KPI su `nordevit_extraction`.
