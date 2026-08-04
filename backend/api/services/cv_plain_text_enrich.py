"""
Riempie campi del template ancora vuoti usando pattern sul testo grezzo del CV.
Non richiede LLM né Gemini: utile quando pyresparser/spaCy non popolano contatti o URL.
"""
from __future__ import annotations

import re
from typing import Any


def _first_email(text: str) -> str | None:
    m = re.search(
        r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b",
        text,
        flags=re.IGNORECASE,
    )
    return m.group(0).strip() if m else None


def _first_phone(text: str) -> str | None:
    # Priorità: E.164-like o blocchi numerici tipici CV (IT +39, spazi, trattini)
    patterns = [
        r"\+\d{1,3}[\s.-]?(?:\d[\s.-]?){8,14}\d",
        r"(?:\+39|0039)[\s.-]?(?:3\d{2}[\s.-]?\d{6,7}|0\d{1,3}[\s.-]?\d{6,8})",
        r"\b\d{3}[\s./-]?\d{3}[\s./-]?\d{4}\b",
        r"\b\d{2,4}[\s./-]?\d{2,4}[\s./-]?\d{2,4}[\s./-]?\d{2,6}\b",
    ]
    for pat in patterns:
        m = re.search(pat, text)
        if m:
            raw = re.sub(r"\s+", " ", m.group(0).strip())
            digits = re.sub(r"\D", "", raw)
            if len(digits) >= 8:
                return raw
    return None


def _linkedin_url(text: str) -> str | None:
    m = re.search(r"https?://(?:www\.)?linkedin\.com/in/[\w\-_%]+/?", text, flags=re.IGNORECASE)
    if not m:
        return None
    return m.group(0).strip().rstrip(").,;]").split("?")[0].rstrip("/")


_GITHUB_RESERVED = frozenset(
    {"topics", "features", "explore", "settings", "login", "signup", "security", "about", "pricing", "team", "orgs"},
)


_NAME_BLOCKLIST_WORDS = frozenset(
    {
        "curriculum", "vitae", "resume", "cv", "profilo", "profile", "contatti",
        "contact", "esperienza", "esperienze", "istruzione", "education", "skills",
        "competenze", "about", "chi", "sono", "linkedin", "github", "email", "telefono",
        "phone", "indirizzo", "address",
    },
)


def _guess_name_from_first_lines(text: str) -> str | None:
    """
    Euristica conservativa, usata SOLO come ultima risorsa quando nessun parser
    strutturato (IT/EN) ha trovato un nome: la maggior parte dei CV/resume ha il
    nome della persona come prima riga non vuota, in 2-4 parole capitalizzate.
    Scartiamo righe con email, numeri, URL o parole tipiche di intestazioni
    (es. "Curriculum Vitae") per ridurre i falsi positivi.
    """
    for raw_line in text.splitlines()[:6]:
        line = raw_line.strip()
        if not line or len(line) > 40:
            continue
        if "@" in line or re.search(r"\d", line) or "http" in line.lower():
            continue
        words = line.split()
        if not (2 <= len(words) <= 4):
            continue
        if not all(re.fullmatch(r"[A-Za-zÀ-ÖØ-öø-ÿ'’-]+", w) for w in words):
            continue
        if any(w.lower() in _NAME_BLOCKLIST_WORDS for w in words):
            continue
        # Ogni parola deve iniziare con maiuscola: tipico di un nome proprio.
        if not all(w[0].isupper() for w in words):
            continue
        return line
    return None


def _github_url(text: str) -> str | None:
    m = re.search(
        r"https?://(?:www\.)?github\.com/([A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38})/?",
        text,
        flags=re.IGNORECASE,
    )
    if not m:
        return None
    if m.group(1).lower() in _GITHUB_RESERVED:
        return None
    return m.group(0).strip().rstrip(").,;]").split("?")[0].rstrip("/")


def enrich_mapped_cv_from_plain_text(data: dict[str, Any], plain: str) -> dict[str, Any]:
    """
    Aggiorna `data` in place solo per campi ancora vuoti; ritorna `data`.
    """
    if not plain or not isinstance(data, dict):
        return data

    pi = data.get("personal_info")
    if not isinstance(pi, dict):
        return data

    social = data.get("social_links")
    if not isinstance(social, dict):
        social = {}

    touched = False

    email = (pi.get("work_email") or pi.get("personal_email") or "").strip()
    if not email:
        fe = _first_email(plain)
        if fe:
            pi["work_email"] = fe
            pi["personal_email"] = fe
            touched = True

    phone = (pi.get("work_number") or "").strip()
    if not phone:
        fp = _first_phone(plain)
        if fp:
            pi["work_number"] = fp
            touched = True

    if not (social.get("linkedin") or "").strip():
        lu = _linkedin_url(plain)
        if lu:
            social["linkedin"] = lu
            data["social_links"] = social
            touched = True

    if not (social.get("github") or "").strip():
        gu = _github_url(plain)
        if gu:
            social["github"] = gu
            data["social_links"] = social
            touched = True

    # Nome: se nessun parser strutturato (IT/EN) l'ha trovato, proviamo l'euristica
    # conservativa "prima riga plausibile" — meglio di un placeholder "Il Tuo Nome"
    # sulla pagina pubblica, dato il rischio contenuto (righe brevi, no cifre/email,
    # parole capitalizzate, niente header tipici tipo "Curriculum Vitae").
    if not (data.get("name") or "").strip():
        guessed = _guess_name_from_first_lines(plain)
        if guessed:
            data["name"] = guessed
            touched = True

    # Allinea `personal_info.name` al nome top-level se il template non l'ha già messo in `personal_info`.
    top_name = (data.get("name") or "").strip()
    if top_name and not (pi.get("name") or "").strip():
        pi["name"] = top_name
        touched = True

    if touched:
        meta = data.get("nordevit_extraction")
        if isinstance(meta, dict):
            hints = list(meta.get("plain_text_enrich_hints") or [])
            hints.append("regex_contacts_from_plain_text")
            meta["plain_text_enrich_hints"] = hints

    return data
