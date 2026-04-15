"""
Servizi per il parsing e analisi dei CV.
La logica è estratta da views.py per seguire il principio di separazione delle responsabilità.
"""
import os
import tempfile
import logging
from typing import Any, Optional

from django.conf import settings as django_settings

logger = logging.getLogger(__name__)

# Flag di disponibilità dei parser
PARSING_FUNCTIONS_LOADED = False

try:
    import sys

    # Aggiungi la directory radice del backend al path
    backend_root = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    if backend_root not in sys.path:
        sys.path.insert(0, backend_root)

    from demo_resume_parser import (
        extract_with_resume_parser_en,
        extract_with_spacy_italian_improved,
        map_extracted_data_to_template,
        originalJsonStructure,
    )

    PARSING_FUNCTIONS_LOADED = True
    logger.info("Parser CV caricati con successo.")
except ImportError as e:
    logger.warning(f"Parser CV non disponibili: {e}")
except Exception as e:
    logger.error(f"Errore imprevisto nel caricamento dei parser: {e}")


# TIPI FILE CONSENTITI — whitelist di sicurezza
ALLOWED_EXTENSIONS = {'.pdf', '.docx', '.doc', '.txt'}
MAX_FILE_SIZE_MB = 10


def _merge_extracted_en(base: dict[str, Any], overlay: dict[str, Any]) -> dict[str, Any]:
    """Unisce campi EN da vision sopra il risultato rule-based (solo valori non vuoti)."""
    out = dict(base)
    for k, v in overlay.items():
        if k == "error":
            continue
        if v not in (None, "", [], {}):
            out[k] = v
    return out


def validate_cv_file(file) -> Optional[str]:
    """
    Valida il file caricato prima del parsing.
    Ritorna None se valido, stringa di errore altrimenti.
    """
    ext = os.path.splitext(file.name)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return f"Tipo file non supportato: {ext}. Usa PDF, DOCX, DOC o TXT."

    size_mb = file.size / (1024 * 1024)
    if size_mb > MAX_FILE_SIZE_MB:
        return f"File troppo grande ({size_mb:.1f}MB). Limite: {MAX_FILE_SIZE_MB}MB."

    return None


def parse_cv_from_file(file) -> dict:
    """
    Servizio principale per il parsing di un file CV.
    Gestisce la pipeline completa: validazione → temp file → parsing EN+IT → mapping JSON.
    """
    if not PARSING_FUNCTIONS_LOADED:
        return {"error": "Backend parser non disponibile. Controllare i log del server."}

    # Validazione
    validation_error = validate_cv_file(file)
    if validation_error:
        return {"error": validation_error}

    temp_path = None
    try:
        ext = os.path.splitext(file.name)[1].lower()
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp_file:
            for chunk in file.chunks():
                tmp_file.write(chunk)
            temp_path = tmp_file.name

        logger.debug("File temporaneo creato: %s", temp_path)

        from api.services.cv_text_extract import extract_plain_text_pipeline, resolve_vision_pdf_path

        cv_text, extraction_meta = extract_plain_text_pipeline(temp_path)
        min_chars = int(getattr(django_settings, "CV_EXTRACT_MIN_CHARS", 80) or 80)

        # Parsing EN: opzionale OpenAI (settings), altrimenti resume-parser + spaCy
        extracted_en: dict[str, Any] = {"error": "Parser EN non disponibile."}
        used_openai_text = False
        try:
            oai_en = None
            try:
                from api.services.cv_openai_parse import try_openai_extracted_en

                oai_en = try_openai_extracted_en(cv_text)
            except Exception as e:
                logger.warning("OpenAI CV (estrazione EN): %s", e)
            if oai_en:
                extracted_en = oai_en
                used_openai_text = True
            else:
                extracted_en = extract_with_resume_parser_en(temp_path)
        except Exception as e:
            logger.warning("Parser EN fallito: %s", e)

        vision_pdf = resolve_vision_pdf_path(temp_path, cv_text, min_chars)
        vision_en = None
        if vision_pdf and extraction_meta.get("char_count", 0) < min_chars:
            try:
                from api.services.cv_pdf_vision_parse import try_pdf_vision_extracted_en

                vision_en = try_pdf_vision_extracted_en(vision_pdf)
                if vision_en:
                    extracted_en = _merge_extracted_en(extracted_en, vision_en)
                    extraction_meta["used_vision"] = True
                    logger.info("CV: applicato fallback estrazione EN da PDF vision.")
            except Exception as e:
                logger.warning("CV PDF vision: %s", e)

        if not extraction_meta.get("used_vision") and vision_pdf and extraction_meta.get("char_count", 0) < min_chars:
            try:
                from api.services.cv_pdf_gemini_parse import try_pdf_gemini_extracted_en

                gemini_en = try_pdf_gemini_extracted_en(vision_pdf)
                if gemini_en:
                    extracted_en = _merge_extracted_en(extracted_en, gemini_en)
                    extraction_meta["used_gemini_pdf"] = True
                    logger.info("CV: applicato fallback estrazione EN da Gemini PDF.")
            except Exception as e:
                logger.warning("CV PDF Gemini: %s", e)

        if extraction_meta.get("used_vision"):
            extraction_meta["structured_en_source"] = "vision_pdf"
        elif extraction_meta.get("used_gemini_pdf"):
            extraction_meta["structured_en_source"] = "gemini_pdf"
        elif used_openai_text:
            extraction_meta["structured_en_source"] = "openai_text"
        else:
            extraction_meta["structured_en_source"] = "resume_parser_en"

        # Parsing IT
        extracted_it: dict[str, Any] = {"error": "Parser IT non disponibile."}
        try:
            extracted_it = extract_with_spacy_italian_improved(cv_text)
        except Exception as e:
            logger.warning("Parser IT fallito: %s", e)

        # Mapping finale
        mapped_data = map_extracted_data_to_template(extracted_en, extracted_it, originalJsonStructure)
        mapped_data["nordevit_extraction"] = extraction_meta
        logger.info("Parsing CV completato (char_count=%s, source=%s).", extraction_meta.get("char_count"), extraction_meta.get("source"))
        return mapped_data

    except Exception as e:
        logger.error("Errore durante il parsing del CV: %s", e)
        return {"error": f"Errore interno durante il parsing: {str(e)}"}
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
            logger.debug("File temporaneo rimosso: %s", temp_path)
