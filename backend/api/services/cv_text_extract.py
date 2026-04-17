"""
Pipeline estrazione testo da CV (PDF, DOCX, DOC, TXT) con diagnostica e
fallback opzionale LibreOffice (Office → PDF).
"""
from __future__ import annotations

import logging
import os
import shutil
import subprocess
import sys
import tempfile
from typing import Any

logger = logging.getLogger(__name__)

# Anteprima testo in `nordevit_extraction` (evita di serializzare CV interi in raw_json).
PLAIN_TEXT_META_MAX_LEN = 2048

_backend_root = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
if _backend_root not in sys.path:
    sys.path.insert(0, _backend_root)


def _get_settings():
    from django.conf import settings

    return settings


def _native_plain_text_source(ext: str) -> str:
    """Ramo estrazione testo senza LibreOffice (allineato al piano: pdf_pypdf, docx_python, txt, …)."""
    if ext == ".pdf":
        return "pdf_pypdf"
    if ext == ".docx":
        return "docx_python"
    if ext == ".txt":
        return "txt"
    if ext == ".odt":
        return "odt_no_native_text"
    if ext == ".rtf":
        return "rtf_no_native_text"
    if ext == ".doc":
        return "doc_no_native_text"
    return "unknown"


def _libreoffice_binary(settings) -> str | None:
    soffice = (getattr(settings, "CV_LIBREOFFICE_BIN", None) or "").strip()
    if soffice and os.path.isfile(soffice):
        return soffice
    w = shutil.which("soffice") or shutil.which("soffice.exe")
    return w


def try_office_to_pdf(input_path: str) -> str | None:
    """
    Converte .doc / .docx in PDF via LibreOffice headless.
    Ritorna il path del PDF creato in una directory temporanea, o None.
    """
    settings = _get_settings()
    soffice = _libreoffice_binary(settings)
    if not soffice:
        return None

    timeout = int(getattr(settings, "CV_LIBREOFFICE_TIMEOUT", 90) or 90)
    ext = os.path.splitext(input_path)[1].lower()
    if ext not in (".doc", ".docx", ".odt", ".rtf"):
        return None

    out_dir = tempfile.mkdtemp(prefix="cv_lo_")
    try:
        cmd = [
            soffice,
            "--headless",
            "--norestore",
            "--nolockcheck",
            "--nodefault",
            "--nofirststartwizard",
            "--convert-to",
            "pdf",
            "--outdir",
            out_dir,
            input_path,
        ]
        subprocess.run(cmd, check=True, timeout=timeout, capture_output=True)
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired, FileNotFoundError, OSError) as e:
        logger.warning("LibreOffice conversion failed: %s", e)
        shutil.rmtree(out_dir, ignore_errors=True)
        return None

    base = os.path.splitext(os.path.basename(input_path))[0]
    expected = os.path.join(out_dir, base + ".pdf")
    if os.path.isfile(expected):
        return expected
    for name in os.listdir(out_dir):
        if name.lower().endswith(".pdf"):
            return os.path.join(out_dir, name)
    shutil.rmtree(out_dir, ignore_errors=True)
    return None


def _libreoffice_improve_text(file_path: str, current: str) -> tuple[str, bool]:
    """
    Converte con LibreOffice, legge il PDF, elimina la directory temporanea.
    Ritorna (testo_migliorato_o_uguale, True se il testo è migliorato).
    """
    from demo_resume_parser import extract_text_from_file

    pdf_path = try_office_to_pdf(file_path)
    if not pdf_path:
        return current, False
    out_dir = os.path.dirname(pdf_path)
    try:
        text2 = extract_text_from_file(pdf_path) or ""
        if len(text2.strip()) > len((current or "").strip()):
            return text2, True
        return current, False
    finally:
        shutil.rmtree(out_dir, ignore_errors=True)


def _extract_pdf_text_pymupdf(file_path: str) -> str:
    """Estrazione testo PDF via PyMuPDF (spesso migliore di PyPDF su layout multi-colonna o font strani)."""
    try:
        import fitz  # pymupdf
    except ImportError:
        return ""

    try:
        doc = fitz.open(file_path)
        try:
            parts: list[str] = []
            for page in doc:
                block = page.get_text("text")
                if block:
                    parts.append(block)
            return "\n".join(parts)
        finally:
            doc.close()
    except Exception as e:
        logger.debug("PyMuPDF text extract skip: %s", e)
        return ""


def extract_plain_text_pipeline(file_path: str) -> tuple[str, dict[str, Any]]:
    """
    Estrae testo con diagnostica. Non solleva: in caso di fallimento ritorna stringa vuota
    e metadati con warnings (per permettere fallback vision a valle).

    Ritorna (plain_text, nordevit_extraction_dict).
    """
    from demo_resume_parser import extract_text_from_file
    from api.services.cv_quality_repair import classify_document_profile, normalize_plain_text

    settings = _get_settings()
    min_chars = int(getattr(settings, "CV_EXTRACT_MIN_CHARS", 80) or 80)
    ext = os.path.splitext(file_path)[1].lower()
    warnings: list[str] = []
    source = _native_plain_text_source(ext)
    used_libreoffice = False

    text = extract_text_from_file(file_path) or ""
    if ext == ".pdf" and not text.strip():
        warnings.append("pdf_no_text_layer")

    if ext == ".pdf":
        alt = _extract_pdf_text_pymupdf(file_path) or ""
        t0 = (text or "").strip()
        t1 = alt.strip()
        if len(t1) > len(t0):
            text = alt
            source = "pdf_pymupdf"
            if "pdf_no_text_layer" in warnings:
                warnings.remove("pdf_no_text_layer")
        elif len(t1) > 0 and len(t1) == len(t0) and t1 != t0:
            # Stessa lunghezza ma contenuto diverso: preferisci PyMuPDF se ha più newline (layout)
            if t1.count("\n") > t0.count("\n"):
                text = alt
                source = "pdf_pymupdf"

    char_count = len(text.strip())

    if ext in (".doc", ".odt", ".rtf"):
        if char_count < min_chars:
            warnings.append(f"{ext[1:]}_requires_conversion")
            text, improved = _libreoffice_improve_text(file_path, text)
            if improved:
                char_count = len(text.strip())
                source = "libreoffice_pdf"
                used_libreoffice = True
            if char_count < min_chars and not _libreoffice_binary(settings):
                warnings.append("libreoffice_not_configured")

    elif ext == ".docx" and char_count < min_chars:
        text, improved = _libreoffice_improve_text(file_path, text)
        if improved:
            char_count = len(text.strip())
            source = "libreoffice_pdf"
            used_libreoffice = True

    text = normalize_plain_text(text)
    char_count = len(text.strip())
    doc_profile = classify_document_profile(text, ext)

    plain_truncated = bool(text) and len(text) > PLAIN_TEXT_META_MAX_LEN
    plain_for_meta: str | None = None
    if text.strip():
        plain_for_meta = text[:PLAIN_TEXT_META_MAX_LEN] if plain_truncated else text

    meta: dict[str, Any] = {
        "plain_text": plain_for_meta,
        "plain_text_truncated": plain_truncated,
        "char_count": char_count,
        "source": source,
        "warnings": warnings,
        "used_vision": False,
        "used_gemini_pdf": False,
        "used_libreoffice": used_libreoffice,
        "document_profile": doc_profile,
    }

    if "pdf_no_text_layer" in warnings:
        logger.warning(
            "CV extraction weak text: file=%s warnings=%s char_count=%s",
            os.path.basename(file_path),
            warnings,
            char_count,
        )
    else:
        logger.info(
            "CV text extraction: file=%s ext=%s char_count=%s source=%s warnings=%s",
            os.path.basename(file_path),
            ext,
            char_count,
            meta.get("source"),
            warnings,
        )
    return text, meta


def resolve_vision_pdf_path(original_path: str, plain_text: str, min_chars: int) -> str | None:
    """Path PDF da passare al parser vision (solo se testo debole e file è PDF)."""
    ext = os.path.splitext(original_path)[1].lower()
    if ext != ".pdf":
        return None
    if len((plain_text or "").strip()) >= min_chars:
        return None
    if not os.path.isfile(original_path):
        return None
    return original_path
