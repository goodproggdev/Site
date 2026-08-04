"""
Generazione di contenuti "a template" per la pagina CV pubblica, in base alla
categoria professionale scelta dall'utente (e, quando possibile, alle posizioni
lavorative target indicate).

Approccio scelto: NIENTE modelli AI/ML pesanti (TensorFlow, LLM locali, ecc.) --
Vercel esegue il backend come funzione serverless con filesystem read-only,
limiti stretti di dimensione del pacchetto e niente GPU: esattamente i vincoli
che in questo progetto hanno gia' escluso spaCy/NLTK/pyresparser dal deploy di
produzione. Un vero framework ML sarebbe o troppo pesante per starci, o
richiederebbe una API esterna a pagamento (chiave che l'utente non ha).

Si usa quindi la stessa logica gia' presente nel prodotto per il form manuale
(vedi frontend Upload.tsx / IT.json, Tecnico.json, ecc.): un banco di contenuti
"di partenza" per categoria, arricchito con numeri e selezioni derivate dai
dati REALI estratti dal CV (competenze, esperienze, anni di carriera). Nessun
dato personale viene inventato: about/skills/languages/education/esperienza/
portfolio restano sempre e solo quelli realmente estratti dal CV.
"""
from __future__ import annotations

import json
import os
import re
from typing import Any, Optional

_DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "category_templates.json")

_CATEGORY_BANK: dict[str, Any] = {}
try:
    with open(_DATA_PATH, "r", encoding="utf-8") as _f:
        _CATEGORY_BANK = json.load(_f)
except Exception:
    _CATEGORY_BANK = {}

VALID_CATEGORIES = list(_CATEGORY_BANK.keys()) or [
    "digitale-it",
    "ingegneri-tecnici",
    "sanitari-assistenziali",
    "commerciale-vendita",
    "amministrative-finanziarie",
    "logistica",
]

# La sezione Servizi viene sempre mostrata quando ci sono dati (anche un
# dipendente puo' descrivere i servizi/competenze che offre). La sezione
# Tariffe/Pricing (pacchetti a prezzo fisso), invece, ha senso solo per
# categorie tipicamente da libero professionista/consulente con progetti a
# preventivo — non per profili "responsabile/dipendente" (es. un responsabile
# di produzione nel fashion elenca i suoi servizi ma non vende "pacchetti").
_PRICING_DEFAULT_CATEGORIES = {
    "digitale-it",
    "commerciale-vendita",
}


def default_show_pricing(category: Optional[str]) -> bool:
    if not category:
        return True
    return category in _PRICING_DEFAULT_CATEGORIES


def _keyword_score(text: str, keywords: list[str]) -> int:
    text_low = (text or "").lower()
    return sum(1 for kw in keywords if kw and kw.lower() in text_low)


def _extract_positions_keywords(target_positions: Optional[str]) -> list[str]:
    if not target_positions:
        return []
    parts = re.split(r"[,;/\n]+", target_positions)
    return [p.strip() for p in parts if p.strip()]


def _rank_bank_items(items: list[dict], keywords: list[str], text_fields: list[str]) -> list[dict]:
    if not keywords:
        return items
    def score(item):
        text = " ".join(str(item.get(f, "")) for f in text_fields)
        return -_keyword_score(text, keywords)
    return sorted(items, key=score)


def _parse_years_from_period(period: str) -> Optional[int]:
    """Stima gli anni coperti da una stringa periodo tipo '2018 - 2022' o '2020 - Presente'."""
    if not period:
        return None
    years = [int(y) for y in re.findall(r"(?:19|20)\d{2}", period)]
    if not years:
        return None
    start = min(years)
    is_current = bool(re.search(r"presente|current|oggi|ad oggi|in corso", period, re.IGNORECASE))
    import datetime
    end = datetime.date.today().year if is_current else max(years)
    return max(end - start, 0)


def compute_experience_stats(work_experience_list: list[dict], skills: list[dict]) -> dict:
    """Calcola numeri REALI (non inventati) dal profilo estratto dal CV."""
    total_years = 0
    for exp in work_experience_list or []:
        yrs = _parse_years_from_period(exp.get("period", ""))
        if yrs:
            total_years += yrs
    return {
        "years_experience": total_years or None,
        "jobs_count": len(work_experience_list or []),
        "skills_count": len(skills or []),
    }


def build_statistics(bank_statistics: list[dict], stats: dict) -> list[dict]:
    """Sostituisce, dove possibile, i numeri del banco con quelli reali calcolati dal CV."""
    result = []
    real_years = stats.get("years_experience")
    for item in bank_statistics:
        label = str(item.get("label", "")).lower()
        new_item = dict(item)
        if real_years and ("anni" in label or "esperienz" in label or "year" in label):
            new_item["count"] = real_years
        result.append(new_item)
    return result


def generate_category_sections(
    populated_data: dict,
    category: Optional[str],
    target_positions: Optional[str] = None,
) -> dict:
    """
    Popola expertise_list / services / pricing_packs / statistics con contenuti
    "a template" per categoria, solo per i campi rimasti vuoti dopo il mapping
    dei dati reali del CV. Non tocca mai about/skills/languages/education/
    work_experience/portfolio, che restano sempre i dati reali estratti.
    """
    if not category or category not in _CATEGORY_BANK:
        return populated_data

    bank = _CATEGORY_BANK[category]
    keywords = _extract_positions_keywords(target_positions)

    skills = populated_data.get("skills") or []
    skill_keywords = keywords + [s.get("name", "") for s in skills if isinstance(s, dict)]

    if not populated_data.get("expertise_list"):
        ranked = _rank_bank_items(list(bank.get("expertise_list", [])), skill_keywords, ["name", "subtitle"])
        populated_data["expertise_list"] = ranked

    if not populated_data.get("services"):
        ranked = _rank_bank_items(list(bank.get("services", [])), keywords, ["title", "description"])
        populated_data["services"] = ranked

    # Le tariffe a pacchetto le riempiamo solo per le categorie dove ha senso
    # mostrarle di default (vedi default_show_pricing): altrimenti resterebbero
    # dati morti, mai visibili, generati per niente.
    if not populated_data.get("pricing_packs") and default_show_pricing(category):
        populated_data["pricing_packs"] = list(bank.get("pricing_packs", []))

    if not populated_data.get("statistics"):
        stats = compute_experience_stats(
            populated_data.get("work_experience_list") or [],
            skills,
        )
        populated_data["statistics"] = build_statistics(list(bank.get("statistics", [])), stats)

    return populated_data
