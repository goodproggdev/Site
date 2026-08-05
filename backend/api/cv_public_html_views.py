"""
HTML shell per /u/<slug>/ con meta title/OG/JSON-LD nel primo byte (crawler senza JS).
La SPA continua a caricarsi via script per gli utenti con browser.
"""
from __future__ import annotations

import json
import logging
import re
from pathlib import Path
from typing import Any

from django.conf import settings
from django.http import HttpResponse, HttpResponseForbidden, HttpResponseNotFound
from django.shortcuts import render
from django.utils.safestring import mark_safe

from api.services.cv_og_image import generate_og_image_png
from api.services.cv_public_access import resolve_public_cv

logger = logging.getLogger(__name__)


def _pick_meta_from_raw(raw: dict[str, Any], slug: str) -> tuple[str, str, str]:
    """(page_title, meta_description, tagline) per OG / JSON-LD."""
    name = ""
    if isinstance(raw.get("name"), str) and raw["name"].strip():
        name = raw["name"].strip()
    if not name:
        name = slug.replace("-", " ").replace("_", " ")

    description = ""
    if isinstance(raw.get("presentation"), str) and raw["presentation"].strip():
        description = raw["presentation"].strip()
    elif isinstance(raw.get("about"), dict):
        who = raw["about"].get("who") or ""
        details = raw["about"].get("details") or ""
        description = f"{who} {details}".strip()
    if not description:
        description = name

    tagline = ""
    if isinstance(raw.get("header_mono_subtitle"), str):
        tagline = raw["header_mono_subtitle"].strip()
    if not tagline and isinstance(raw.get("who_am_i"), str):
        tagline = raw["who_am_i"].strip()

    title = f"{name} — CV digitale | {getattr(settings, 'SITE_NAME', 'Nordevit')}"
    desc = description[:320]
    return title, desc, tagline[:200]


def _parse_vite_index(html: str) -> tuple[list[str], list[str]]:
    """Estrae href CSS e src JS (type=module) da index.html post-build Vite."""
    css_hrefs = re.findall(
        r'<link[^>]+rel=["\']stylesheet["\'][^>]*href=["\']([^"\']+)["\']',
        html,
        flags=re.IGNORECASE,
    )
    if not css_hrefs:
        css_hrefs = re.findall(
            r'<link[^>]+href=["\']([^"\']+)["\'][^>]*rel=["\']stylesheet["\']',
            html,
            flags=re.IGNORECASE,
        )
    js_srcs = re.findall(
        r'<script[^>]+type=["\']module["\'][^>]*src=["\']([^"\']+)["\']',
        html,
        flags=re.IGNORECASE,
    )
    if not js_srcs:
        js_srcs = re.findall(
            r'<script[^>]+src=["\']([^"\']+)["\'][^>]*type=["\']module["\']',
            html,
            flags=re.IGNORECASE,
        )
    return css_hrefs, js_srcs


def _load_spa_assets() -> tuple[list[str], list[str], Path | None]:
    """Restituisce (css_hrefs, js_srcs, path_index_usato)."""
    configured = (getattr(settings, "FRONTEND_DIST_INDEX_HTML", "") or "").strip()
    candidates: list[Path] = []
    if configured:
        candidates.append(Path(configured).expanduser())
    default_path = Path(settings.BASE_DIR).parent / "frontend" / "dist" / "index.html"
    if default_path not in candidates:
        candidates.append(default_path)

    for path in candidates:
        if path.is_file():
            try:
                text = path.read_text(encoding="utf-8")
            except OSError as e:
                logger.warning("Impossibile leggere %s: %s", path, e)
                continue
            css_hrefs, js_srcs = _parse_vite_index(text)
            if js_srcs:
                return css_hrefs, js_srcs, path
            logger.warning("Nessuno script module in %s", path)
    return [], [], None


def _absolute_asset_url(request, href: str) -> str:
    origin = (getattr(settings, "FRONTEND_ASSET_ORIGIN", "") or "").rstrip("/")
    if origin:
        return f"{origin}{href}" if href.startswith("/") else f"{origin}/{href}"
    return request.build_absolute_uri(href)


def cv_public_shell_view(request, slug: str):
    """
    GET /u/<slug>/ — HTML con meta completi; body carica la SPA se gli asset sono configurati.
    """
    token = request.GET.get("token")
    cv, err_status, err_code = resolve_public_cv(slug, token)
    if err_status == 404:
        if err_code == "not_published":
            body = "Questo CV non è ancora pubblicato o non è accessibile senza un piano attivo."
            title = "CV non pubblicato"
        else:
            body = "CV non trovato."
            title = "CV non trovato"
        return HttpResponseNotFound(
            f"<!DOCTYPE html><html lang='it'><head><meta charset='utf-8'><title>{title}</title>"
            "<meta name='robots' content='noindex,nofollow'></head>"
            f"<body><p>{body}</p></body></html>",
            content_type="text/html; charset=utf-8",
        )
    if err_status == 403:
        return HttpResponseForbidden(
            "<!DOCTYPE html><html><head><meta charset='utf-8'><title>Accesso negato</title>"
            "<meta name='robots' content='noindex,nofollow'></head>"
            "<body><p>CV non accessibile o token non valido.</p></body></html>",
            content_type="text/html; charset=utf-8",
        )

    raw = cv.raw_json if isinstance(cv.raw_json, dict) else {}
    page_title, meta_description, tagline = _pick_meta_from_raw(raw, slug)
    canonical_url = request.build_absolute_uri(request.get_full_path())

    # Immagine OG: di default generata al volo per CV (nome + tagline + colore
    # categoria, vedi cv_og_image_view/generate_og_image_png), cosi' chi
    # condivide il link su LinkedIn/WhatsApp/X vede un'anteprima personalizzata
    # invece del logo generico. PUBLIC_CV_OG_IMAGE resta una via di fuga per
    # forzare un'immagine fissa per tutti i CV, se un operatore lo desidera.
    og_image = (getattr(settings, "PUBLIC_CV_OG_IMAGE", "") or "").strip()
    if not og_image:
        og_image = request.build_absolute_uri(f"/api/v1/cv/{slug}/og-image.png")
        if token:
            og_image = f"{og_image}?token={token}"
    if not (og_image.startswith("http://") or og_image.startswith("https://")):
        if og_image.startswith("/"):
            og_image = request.build_absolute_uri(og_image)
        else:
            og_image = request.build_absolute_uri(f"/{og_image}")

    json_ld_obj = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": raw.get("name") or page_title.split("—")[0].strip(),
        "url": canonical_url,
    }
    if tagline:
        json_ld_obj["jobTitle"] = tagline
    json_ld = mark_safe(json.dumps(json_ld_obj, ensure_ascii=False).replace("</", "<\\/"))

    css_hrefs, js_srcs, index_path = _load_spa_assets()
    spa_stylesheets = [_absolute_asset_url(request, h) for h in css_hrefs]
    spa_scripts = [_absolute_asset_url(request, s) for s in js_srcs]

    spa_fallback_href = f"{settings.FRONTEND_URL.rstrip('/')}/u/{slug}"
    if request.GET:
        spa_fallback_href = f"{spa_fallback_href}?{request.GET.urlencode()}"

    html_lang = getattr(cv, "language", None) or "it"
    if html_lang not in ("it", "en", "de", "fr", "es"):
        html_lang = "it"

    context = {
        "html_lang": html_lang,
        "page_title": page_title,
        "meta_description": meta_description,
        "canonical_url": canonical_url,
        "og_title": page_title,
        "og_description": meta_description,
        "og_url": canonical_url,
        "og_image": og_image,
        "json_ld": json_ld,
        "spa_stylesheets": spa_stylesheets,
        "spa_scripts": spa_scripts,
        "spa_assets_from": str(index_path) if index_path else "",
        "spa_fallback_href": spa_fallback_href,
        "site_name": getattr(settings, "SITE_NAME", "Nordevit"),
    }
    return render(request, "cv_public_shell.html", context, content_type="text/html; charset=utf-8")



def cv_og_image_view(request, slug: str):
    """
    GET /api/v1/cv/<slug>/og-image.png — immagine Open Graph generata al volo
    (nome + tagline + colore legato alla categoria) per la pagina CV pubblica,
    usata come og:image/twitter:image al posto del logo generico della
    piattaforma. Stessa policy di accesso della shell HTML (`resolve_public_cv`):
    un CV privato con token richiede lo stesso token anche per l'immagine.
    """
    token = request.GET.get("token")
    cv, err_status, _err_code = resolve_public_cv(slug, token)
    if err_status:
        return HttpResponseNotFound(content_type="image/png")

    raw = cv.raw_json if isinstance(cv.raw_json, dict) else {}
    page_title, _meta_description, tagline = _pick_meta_from_raw(raw, slug)
    name = page_title.split("—")[0].strip()
    png_bytes = generate_og_image_png(
        name=name,
        tagline=tagline,
        category=getattr(cv, "category", "") or "default",
        site_name=getattr(settings, "SITE_NAME", "Nordevit"),
    )
    response = HttpResponse(png_bytes, content_type="image/png")
    # I dati del CV cambiano raramente rispetto alla frequenza con cui i
    # crawler dei social ri-fetchano l'immagine: cache moderata + revalidate
    # in background per non rigenerarla ad ogni richiesta.
    response["Cache-Control"] = "public, max-age=3600, stale-while-revalidate=86400"
    return response
