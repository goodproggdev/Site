"""
Estrazione strutturata da PDF (anche scanner) via Google Gemini con PDF inline.

Usa `google.generativeai`: il file viene passato come blocco multimodale
(application/pdf + prompt). L'output è JSON (response_mime_type) normalizzato
con `flat_llm_dict_to_extracted_en` come per OpenAI.

Richiede: CV_PARSE_USE_GEMINI_PDF=True, GEMINI_API_KEY, pacchetto google-generativeai.
"""
from __future__ import annotations

import json
import logging
import re
from pathlib import Path
from typing import Any, Optional

logger = logging.getLogger(__name__)

# Limite prudenziale per inline PDF (API / payload).
_MAX_PDF_BYTES = 6 * 1024 * 1024


def try_pdf_gemini_extracted_en(pdf_path: str) -> Optional[dict[str, Any]]:
    """
    Se abilitato e configurato, invia il PDF a Gemini e restituisce un dict
    compatibile con map_extracted_data_to_template (lato EN).
    """
    from django.conf import settings

    if not getattr(settings, "CV_PARSE_USE_GEMINI_PDF", False):
        return None
    api_key = (getattr(settings, "GEMINI_API_KEY", None) or "").strip()
    if not api_key:
        logger.warning("CV_PARSE_USE_GEMINI_PDF senza GEMINI_API_KEY: skip")
        return None

    try:
        import google.generativeai as genai
    except ImportError:
        logger.warning("google-generativeai non installato: impossibile usare CV_PARSE_USE_GEMINI_PDF")
        return None

    from api.services.cv_openai_parse import flat_llm_dict_to_extracted_en

    model_name = getattr(settings, "GEMINI_CV_PDF_MODEL", "gemini-1.5-flash")

    try:
        data = Path(pdf_path).read_bytes()
    except OSError as e:
        logger.warning("Lettura PDF per Gemini fallita: %s", e)
        return None

    if len(data) > _MAX_PDF_BYTES:
        logger.warning("PDF troppo grande per Gemini inline (>%s byte): skip", _MAX_PDF_BYTES)
        return None

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(model_name)

    prompt = (
        "Sei un estrattore di dati da curriculum. Il PDF è un CV. "
        "Restituisci SOLO JSON valido UTF-8 con queste chiavi "
        '(stringhe o array; usa stringa vuota o array vuoti se assente): '
        '{"name","email","phone","linkedin","github","summary",'
        '"skills":["..."],'
        '"languages":[{"name":"","level":""}],'
        '"work_experience":[{"title":"","company":"","period":"","description":""}],'
        '"education":[{"degree":"","school":"","period":""}]}'
    )

    try:
        resp = model.generate_content(
            [
                {"mime_type": "application/pdf", "data": data},
                prompt,
            ],
            generation_config={
                "temperature": 0.2,
                "response_mime_type": "application/json",
            },
        )
        raw = (resp.text or "").strip()
        raw = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw, flags=re.IGNORECASE)
        flat = json.loads(raw)
        if not isinstance(flat, dict):
            return None
        return flat_llm_dict_to_extracted_en(flat)
    except Exception as e:
        logger.warning("Gemini CV PDF parsing fallito: %s", e)
        return None
