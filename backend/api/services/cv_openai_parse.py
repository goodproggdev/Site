"""
Estrazione strutturata da testo CV tramite OpenAI (JSON).
Attivazione: CV_PARSE_USE_OPENAI=True e OPENAI_API_KEY nel settings / .env.

Il pacchetto PyPI `resume-parser` non espone modelli LLM: questa integrazione
fornisce il percorso AI opzionale in parallelo alla pipeline rule-based/spaCy.
"""
from __future__ import annotations

import json
import logging
import re
from typing import Any, Optional

logger = logging.getLogger(__name__)

_MAX_CHARS = 14_000


def _flat_to_extracted_en(flat: dict[str, Any]) -> dict[str, Any]:
    """Adatta l'output JSON dell'LLM al formato atteso da map_extracted_data_to_template (lato EN)."""
    skills = flat.get("skills") or []
    if isinstance(skills, str):
        skills = [skills]
    skills = [str(s).strip() for s in skills if str(s).strip()]

    exps = flat.get("work_experience") or flat.get("experience") or []
    experience: list[dict[str, str]] = []
    for item in exps if isinstance(exps, list) else []:
        if not isinstance(item, dict):
            continue
        experience.append(
            {
                "title": str(item.get("title", "") or "").strip(),
                "company": str(item.get("company", "") or "").strip(),
                "years": str(item.get("period", "") or item.get("years", "") or "").strip(),
                "description": str(item.get("description", "") or "").strip(),
            }
        )

    edu = flat.get("education") or []
    education_en: list[dict[str, str]] = []
    for item in edu if isinstance(edu, list) else []:
        if not isinstance(item, dict):
            continue
        education_en.append(
            {
                "period": str(item.get("period", "") or "").strip(),
                "title": str(item.get("degree", "") or item.get("title", "") or "").strip(),
                "subtitle": str(item.get("school", "") or item.get("university", "") or "").strip(),
            }
        )

    langs = flat.get("languages") or []
    languages_llm: list[dict[str, str]] = []
    for item in langs if isinstance(langs, list) else []:
        if isinstance(item, dict):
            languages_llm.append(
                {
                    "name": str(item.get("name", "") or "").strip(),
                    "level": str(item.get("level", "N/A") or "N/A").strip(),
                }
            )
        elif isinstance(item, str) and item.strip():
            languages_llm.append({"name": item.strip(), "level": "N/A"})

    summary = (flat.get("summary") or flat.get("profile") or "").strip() or None

    out: dict[str, Any] = {
        "name": (flat.get("name") or "").strip() or None,
        "email": (flat.get("email") or "").strip() or None,
        "phone": (flat.get("phone") or "").strip() or None,
        "linkedin": (flat.get("linkedin") or "").strip() or None,
        "github": (flat.get("github") or "").strip() or None,
        "skills": skills,
        "experience": experience,
        "education_en": education_en,
        "languages_llm": languages_llm,
        "summary": summary,
    }
    return {k: v for k, v in out.items() if v not in (None, "", [], {})}


def flat_llm_dict_to_extracted_en(flat: dict[str, Any]) -> dict[str, Any]:
    """Wrapper pubblico per riuso (es. parsing PDF via vision) con lo stesso schema EN."""
    return _flat_to_extracted_en(flat)


def try_openai_extracted_en(cv_text: str) -> Optional[dict[str, Any]]:
    """
    Se abilitato e configurato, chiama OpenAI e restituisce un dict compatibile con map_extracted_data_to_template.
    In caso di errore o feature disattivata restituisce None.
    """
    from django.conf import settings

    if not getattr(settings, "CV_PARSE_USE_OPENAI", False):
        return None
    api_key = (getattr(settings, "OPENAI_API_KEY", None) or "").strip()
    if not api_key:
        return None

    text = (cv_text or "").strip()
    if not text:
        return None

    model = getattr(settings, "OPENAI_CV_MODEL", "gpt-4o-mini")
    try:
        from openai import OpenAI
    except ImportError:
        logger.warning("pacchetto 'openai' non installato: impossibile usare CV_PARSE_USE_OPENAI")
        return None

    snippet = text[:_MAX_CHARS]
    system = (
        "Sei un estrattore di dati da curriculum. Rispondi SOLO con un oggetto JSON UTF-8 valido, "
        "senza markdown né testo fuori dal JSON."
    )
    user = (
        "Analizza il seguente testo di curriculum ed estrai i campi.\n\n"
        f"---\n{snippet}\n---\n\n"
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
                {"role": "user", "content": user},
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
        return _flat_to_extracted_en(flat)
    except Exception as e:
        logger.warning("OpenAI CV parsing fallito: %s", e)
        return None
