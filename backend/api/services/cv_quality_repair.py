"""
Repair deterministico della qualità estrazione (no costo extra).

- normalizza testo rumoroso
- classifica il documento in profili utili al gating
- prova a ricostruire skills/esperienza/formazione da sezioni testuali
- applica solo patch conservative ("fill empty first")
"""
from __future__ import annotations

import re
from typing import Any

_HEADING_ALIASES = {
    "experience": (
        "esperienza lavorativa",
        "esperienza professionale",
        "esperienze",
        "experience",
        "work experience",
        "professional experience",
    ),
    "education": (
        "formazione",
        "istruzione",
        "education",
        "academic",
        "studies",
    ),
    "skills": (
        "competenze",
        "skills",
        "technical skills",
        "tecnologie",
        "stack",
    ),
}


def normalize_plain_text(text: str) -> str:
    if not text:
        return ""
    t = text.replace("\r\n", "\n").replace("\r", "\n")
    # Rimuove sillabazione a fine riga (es. svilup-\npo)
    t = re.sub(r"(?<=\w)-\n(?=\w)", "", t)
    # Collassa spazi multipli interni
    t = re.sub(r"[ \t]+", " ", t)
    # Riduce blocchi di molte linee vuote
    t = re.sub(r"\n{3,}", "\n\n", t)
    return t.strip()


def classify_document_profile(text: str, ext: str) -> str:
    t = (text or "").lower()
    chars = len(t.strip())
    if ext == ".pdf" and chars < 120:
        return "scanned_like"
    if "curriculum vitae" in t or "resume" in t:
        if "skills" in t or "competenze" in t:
            return "cv_text_rich"
    if "\t" in t or "|" in t:
        return "table_heavy"
    if chars < 200:
        return "text_weak"
    return "generic_text"


def _is_heading(line: str) -> str | None:
    ll = line.strip().lower().rstrip(":")
    if not ll:
        return None
    for key, aliases in _HEADING_ALIASES.items():
        if ll in aliases:
            return key
    return None


def _slice_sections(text: str) -> dict[str, list[str]]:
    sections: dict[str, list[str]] = {"experience": [], "education": [], "skills": []}
    current: str | None = None
    for raw in text.split("\n"):
        line = raw.strip()
        h = _is_heading(line)
        if h:
            current = h
            continue
        if current and line:
            sections[current].append(line)
    return sections


def _parse_period(line: str) -> str:
    m = re.search(r"\b(19|20)\d{2}\b\s*(?:[-–]\s*(?:present|presente|in corso|\b(19|20)\d{2}\b))?", line, re.I)
    return m.group(0).strip() if m else ""


def _to_item(line: str) -> dict[str, str]:
    clean = re.sub(r"^[\-\*\•\s]+", "", line).strip()
    period = _parse_period(clean)
    no_period = clean.replace(period, "").strip(" -–|") if period else clean
    parts = [p.strip() for p in re.split(r"\s+[—\-|]\s+", no_period) if p.strip()]
    title = parts[0] if parts else no_period
    subtitle = " - ".join(parts[1:]) if len(parts) > 1 else ""
    return {"period": period, "title": title[:140], "subtitle": subtitle[:240]}


def _parse_skills(lines: list[str]) -> list[dict[str, str]]:
    blob = ", ".join(lines)
    chunks = re.split(r"[,\n;•|/]+", blob)
    out: list[dict[str, str]] = []
    seen: set[str] = set()
    for raw in chunks:
        s = re.sub(r"\(.*?\)", "", raw).strip()
        if len(s) < 2:
            continue
        key = s.lower()
        if key in seen:
            continue
        seen.add(key)
        out.append({"name": s[:60], "level": "N/A"})
    return out[:40]


def _non_empty(value: Any) -> bool:
    if value is None:
        return False
    if isinstance(value, str):
        return bool(value.strip())
    if isinstance(value, (list, dict, tuple, set)):
        return len(value) > 0
    return True


def apply_deterministic_quality_repair(mapped_data: dict[str, Any], plain_text: str) -> dict[str, Any]:
    """
    Applica patch conservative a `mapped_data` e ritorna metadata repair.
    """
    text = normalize_plain_text(plain_text)
    meta = {
        "applied": False,
        "sections_found": [],
        "skills_added": 0,
        "experience_added": 0,
        "education_added": 0,
    }
    if not text or not isinstance(mapped_data, dict):
        return meta

    sections = _slice_sections(text)
    found = [k for k, v in sections.items() if v]
    meta["sections_found"] = found

    # Skills: solo se vuote
    current_skills = mapped_data.get("skills")
    if not _non_empty(current_skills) and sections["skills"]:
        parsed = _parse_skills(sections["skills"])
        if parsed:
            mapped_data["skills"] = parsed
            meta["skills_added"] = len(parsed)
            meta["applied"] = True

    # Esperienza: solo se vuota
    current_exp = mapped_data.get("work_experience_list")
    if not _non_empty(current_exp) and sections["experience"]:
        parsed = [_to_item(x) for x in sections["experience"][:16]]
        parsed = [x for x in parsed if _non_empty(x.get("title")) or _non_empty(x.get("subtitle")) or _non_empty(x.get("period"))]
        if parsed:
            mapped_data["work_experience_list"] = parsed
            meta["experience_added"] = len(parsed)
            meta["applied"] = True

    # Formazione: solo se vuota
    current_edu = mapped_data.get("education_list")
    if not _non_empty(current_edu) and sections["education"]:
        parsed = [_to_item(x) for x in sections["education"][:16]]
        parsed = [x for x in parsed if _non_empty(x.get("title")) or _non_empty(x.get("subtitle")) or _non_empty(x.get("period"))]
        if parsed:
            mapped_data["education_list"] = parsed
            meta["education_added"] = len(parsed)
            meta["applied"] = True

    return meta
