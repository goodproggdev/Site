"""
Servizi per il parsing e analisi dei CV.
La logica è estratta da views.py per seguire il principio di separazione delle responsabilità.
"""
import os
import tempfile
import logging
import time
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
ALLOWED_EXTENSIONS = {'.pdf', '.docx', '.doc', '.txt', '.odt', '.rtf'}
MAX_FILE_SIZE_MB = 10


def _non_empty(value: Any) -> bool:
    if value is None:
        return False
    if isinstance(value, str):
        return bool(value.strip())
    if isinstance(value, (list, tuple, set, dict)):
        return len(value) > 0
    return True


def _list_quality(items: Any) -> int:
    if not isinstance(items, list):
        return 0
    score = 0
    for item in items:
        if isinstance(item, dict):
            if any(_non_empty(v) for v in item.values()):
                score += 1
        elif _non_empty(item):
            score += 1
    return score


def _mapped_quality(mapped: dict[str, Any]) -> dict[str, Any]:
    pi = mapped.get("personal_info") if isinstance(mapped.get("personal_info"), dict) else {}
    social = mapped.get("social_links") if isinstance(mapped.get("social_links"), dict) else {}
    work_count = _list_quality(mapped.get("work_experience_list"))
    edu_count = _list_quality(mapped.get("education_list"))
    skills_count = _list_quality(mapped.get("skills"))

    checks = {
        "name": _non_empty(pi.get("name") or mapped.get("name")),
        "email": _non_empty(pi.get("work_email") or pi.get("personal_email") or mapped.get("email")),
        "phone": _non_empty(pi.get("work_number") or mapped.get("phone")),
        "experience_or_education": (work_count + edu_count) > 0,
        "skills": skills_count > 0,
        "linkedin_or_github": _non_empty(social.get("linkedin") or social.get("github")),
    }
    weights = {
        "name": 0.24,
        "email": 0.2,
        "phone": 0.16,
        "experience_or_education": 0.24,
        "skills": 0.14,
        "linkedin_or_github": 0.02,
    }
    score = sum(weights[k] for k, ok in checks.items() if ok)
    return {
        "score": round(score, 3),
        "checks": checks,
        "counts": {
            "work_items": work_count,
            "education_items": edu_count,
            "skills_items": skills_count,
        },
    }


def _merge_extracted_en(base: dict[str, Any], overlay: dict[str, Any]) -> dict[str, Any]:
    """Merge conservativo EN: fill-empty-first; per liste usa il payload più ricco."""
    out = dict(base)
    for k, v in overlay.items():
        if k == "error":
            continue
        if v in (None, "", [], {}):
            continue
        cur = out.get(k)
        if cur in (None, "", [], {}):
            out[k] = v
            continue
        if isinstance(cur, list) and isinstance(v, list):
            if _list_quality(v) > _list_quality(cur):
                out[k] = v
            continue
        if not _non_empty(cur):
            out[k] = v
    return out


def validate_cv_file(file) -> Optional[str]:
    """
    Valida il file caricato prima del parsing.
    Ritorna None se valido, stringa di errore altrimenti.
    """
    ext = os.path.splitext(file.name)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return f"Tipo file non supportato: {ext}. Usa PDF, DOCX, DOC, ODT, RTF o TXT."

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
    t0 = time.perf_counter()
    try:
        ext = os.path.splitext(file.name)[1].lower()
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp_file:
            for chunk in file.chunks():
                tmp_file.write(chunk)
            temp_path = tmp_file.name

        logger.debug("File temporaneo creato: %s", temp_path)

        from api.services.cv_plain_text_enrich import enrich_mapped_cv_from_plain_text
        from api.services.cv_quality_repair import apply_deterministic_quality_repair
        from api.services.cv_text_extract import extract_plain_text_pipeline, resolve_vision_pdf_path

        t_text0 = time.perf_counter()
        cv_text, extraction_meta = extract_plain_text_pipeline(temp_path)
        t_text_ms = int((time.perf_counter() - t_text0) * 1000)
        min_chars = int(getattr(django_settings, "CV_EXTRACT_MIN_CHARS", 80) or 80)
        fast_threshold = float(getattr(django_settings, "CV_FAST_SCORE_THRESHOLD", 0.62) or 0.62)
        min_chars_for_openai = int(getattr(django_settings, "CV_FAST_MIN_CHARS_FOR_OPENAI", min_chars) or min_chars)
        stage_ms: dict[str, int] = {"plain_text": t_text_ms, "local_parse": 0, "map_local": 0, "openai_text": 0, "vision_pdf": 0}
        quality: dict[str, Any] = {}
        path_taken = ["local"]
        used_openai_text = False

        # Parsing locale sempre attivo (fast-first, no rete).
        extracted_en: dict[str, Any] = {"error": "Parser EN non disponibile."}
        try:
            t_local0 = time.perf_counter()
            extracted_en = extract_with_resume_parser_en(temp_path)
            stage_ms["local_parse"] = int((time.perf_counter() - t_local0) * 1000)
        except Exception as e:
            logger.warning("Parser EN fallito: %s", e)

        # Parsing IT
        extracted_it: dict[str, Any] = {"error": "Parser IT non disponibile."}
        try:
            extracted_it = extract_with_spacy_italian_improved(cv_text)
        except Exception as e:
            logger.warning("Parser IT fallito: %s", e)

        # Mapping locale + arricchimento regex
        t_map0 = time.perf_counter()
        mapped_data = map_extracted_data_to_template(extracted_en, extracted_it, originalJsonStructure)
        stage_ms["map_local"] = int((time.perf_counter() - t_map0) * 1000)
        mapped_data["nordevit_extraction"] = extraction_meta
        enrich_mapped_cv_from_plain_text(mapped_data, cv_text)
        repair_meta = apply_deterministic_quality_repair(mapped_data, cv_text)

        q_initial = _mapped_quality(mapped_data)
        quality["initial"] = q_initial

        # Gate OpenAI testo solo se qualità insufficiente e plain text utile.
        should_try_openai = q_initial["score"] < fast_threshold and extraction_meta.get("char_count", 0) >= min_chars_for_openai
        if should_try_openai:
            try:
                from api.services.cv_openai_parse import try_openai_extracted_en

                t_oai0 = time.perf_counter()
                oai_en = try_openai_extracted_en(cv_text)
                stage_ms["openai_text"] = int((time.perf_counter() - t_oai0) * 1000)
                if oai_en:
                    extracted_en = _merge_extracted_en(extracted_en, oai_en)
                    used_openai_text = True
                    path_taken.append("openai_text")
                    mapped_data = map_extracted_data_to_template(extracted_en, extracted_it, originalJsonStructure)
                    mapped_data["nordevit_extraction"] = extraction_meta
                    enrich_mapped_cv_from_plain_text(mapped_data, cv_text)
                    repair_meta = apply_deterministic_quality_repair(mapped_data, cv_text)
            except Exception as e:
                logger.warning("OpenAI CV (estrazione EN): %s", e)

        q_after_openai = _mapped_quality(mapped_data)
        quality["after_openai"] = q_after_openai

        # Vision PDF come ultima risorsa (no Gemini).
        vision_pdf = resolve_vision_pdf_path(temp_path, cv_text, min_chars)
        should_try_vision = (
            q_after_openai["score"] < fast_threshold
            and bool(vision_pdf)
            and extraction_meta.get("char_count", 0) < min_chars
        )
        if should_try_vision:
            try:
                from api.services.cv_pdf_vision_parse import try_pdf_vision_extracted_en

                t_v0 = time.perf_counter()
                vision_en = try_pdf_vision_extracted_en(vision_pdf)
                stage_ms["vision_pdf"] = int((time.perf_counter() - t_v0) * 1000)
                if vision_en:
                    extracted_en = _merge_extracted_en(extracted_en, vision_en)
                    extraction_meta["used_vision"] = True
                    path_taken.append("vision_pdf")
                    mapped_data = map_extracted_data_to_template(extracted_en, extracted_it, originalJsonStructure)
                    mapped_data["nordevit_extraction"] = extraction_meta
                    enrich_mapped_cv_from_plain_text(mapped_data, cv_text)
                    repair_meta = apply_deterministic_quality_repair(mapped_data, cv_text)
                    logger.info("CV: applicato fallback estrazione EN da PDF vision.")
            except Exception as e:
                logger.warning("CV PDF vision: %s", e)

        q_final = _mapped_quality(mapped_data)
        quality["final"] = q_final

        if extraction_meta.get("used_vision"):
            extraction_meta["structured_en_source"] = "vision_pdf"
        elif used_openai_text:
            extraction_meta["structured_en_source"] = "openai_text"
        else:
            extraction_meta["structured_en_source"] = "pyresparser_en"

        stage_ms["total"] = int((time.perf_counter() - t0) * 1000)
        extraction_meta.update(
            {
                "pipeline_profile": "fast_first_v1",
                "path_taken": path_taken,
                "stage_ms": stage_ms,
                "quality": quality,
                "gating": {
                    "fast_threshold": fast_threshold,
                    "min_chars": min_chars,
                    "min_chars_for_openai": min_chars_for_openai,
                    "should_try_openai": should_try_openai,
                    "should_try_vision": should_try_vision,
                },
                "llm_calls": {
                    "openai_text": 1 if used_openai_text else 0,
                    "openai_vision": 1 if extraction_meta.get("used_vision") else 0,
                    "gemini_pdf": 0,
                },
                "quality_repair": repair_meta,
            }
        )
        mapped_data["nordevit_extraction"] = extraction_meta

        logger.info(
            "Parsing CV completato (char_count=%s, source=%s, score=%.3f, path=%s).",
            extraction_meta.get("char_count"),
            extraction_meta.get("source"),
            q_final["score"],
            "->".join(path_taken),
        )
        return mapped_data

    except Exception as e:
        logger.error("Errore durante il parsing del CV: %s", e)
        return {"error": f"Errore interno durante il parsing: {str(e)}"}
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
            logger.debug("File temporaneo rimosso: %s", temp_path)
