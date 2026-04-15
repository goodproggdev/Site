"""
Estrazione strutturata da PDF scannerizzati tramite OpenAI vision.

Approccio (stabile con lo stack attuale): PyMuPDF (`fitz`) rasterizza le prime
`CV_PDF_VISION_MAX_PAGES` pagine in PNG; le immagini sono inviate a
`OPENAI_CV_VISION_MODEL` via Chat Completions (content multimodale: testo + image_url
base64). L'output JSON è normalizzato con `flat_llm_dict_to_extracted_en` come per
`try_openai_extracted_en` su testo.

Deploy: richiede `pymupdf` installato, chiave OpenAI e `CV_PARSE_USE_PDF_VISION=True`.

Richiede: CV_PARSE_USE_PDF_VISION=True, OPENAI_API_KEY, pacchetto pymupdf (fitz).
"""
from __future__ import annotations

import base64
import json
import logging
import re
from typing import Any, Optional

logger = logging.getLogger(__name__)


def try_pdf_vision_extracted_en(pdf_path: str) -> Optional[dict[str, Any]]:
    """
    Se abilitato e configurato, invia le prime pagine del PDF come immagini a un modello vision
    e restituisce un dict compatibile con map_extracted_data_to_template (lato EN).
    """
    from django.conf import settings

    if not getattr(settings, "CV_PARSE_USE_PDF_VISION", False):
        return None
    api_key = (getattr(settings, "OPENAI_API_KEY", None) or "").strip()
    if not api_key:
        logger.warning("CV_PARSE_USE_PDF_VISION senza OPENAI_API_KEY: skip")
        return None

    try:
        import fitz  # pymupdf
    except ImportError:
        logger.warning("pymupdf non installato: impossibile usare CV_PARSE_USE_PDF_VISION")
        return None

    try:
        from openai import OpenAI
    except ImportError:
        logger.warning("pacchetto 'openai' non installato: impossibile usare CV_PARSE_USE_PDF_VISION")
        return None

    from api.services.cv_openai_parse import flat_llm_dict_to_extracted_en

    max_pages = int(getattr(settings, "CV_PDF_VISION_MAX_PAGES", 3) or 3)
    model = getattr(settings, "OPENAI_CV_VISION_MODEL", "gpt-4o-mini")

    image_parts: list[dict[str, Any]] = []
    try:
        doc = fitz.open(pdf_path)
        try:
            n = min(max_pages, len(doc))
            for i in range(n):
                page = doc[i]
                mat = fitz.Matrix(1.5, 1.5)
                pix = page.get_pixmap(matrix=mat, alpha=False)
                png_bytes = pix.tobytes("png")
                b64 = base64.b64encode(png_bytes).decode("ascii")
                image_parts.append(
                    {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{b64}"}}
                )
        finally:
            doc.close()
    except Exception as e:
        logger.warning("Raster PDF per vision fallito: %s", e)
        return None

    if not image_parts:
        return None

    system = (
        "Sei un estrattore di dati da curriculum. Le immagini sono pagine di un CV. "
        "Rispondi SOLO con un oggetto JSON UTF-8 valido, senza markdown né testo fuori dal JSON."
    )
    user_text = (
        "Analizza le immagini del curriculum ed estrai i campi visibili.\n\n"
        "Restituisci JSON con queste chiavi (stringhe o array; usa stringa vuota o array vuoti se assente):\n"
        '{"name","email","phone","linkedin","github","summary",'
        '"skills":["..."],'
        '"languages":[{"name":"","level":""}],'
        '"work_experience":[{"title":"","company":"","period":"","description":""}],'
        '"education":[{"degree":"","school":"","period":""}]}'
    )

    client = OpenAI(api_key=api_key)
    try:
        completion = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": [{"type": "text", "text": user_text}, *image_parts]},
            ],
            response_format={"type": "json_object"},
            temperature=0.2,
            max_tokens=4096,
        )
        raw = completion.choices[0].message.content or "{}"
        raw = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw.strip(), flags=re.IGNORECASE)
        flat = json.loads(raw)
        if not isinstance(flat, dict):
            return None
        return flat_llm_dict_to_extracted_en(flat)
    except Exception as e:
        logger.warning("OpenAI CV vision fallito: %s", e)
        return None
