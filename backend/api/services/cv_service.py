"""
Servizi per il parsing e analisi dei CV.
La logica è estratta da views.py per seguire il principio di separazione delle responsabilità.
"""
import os
import tempfile
import logging
from typing import Optional

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
        extract_text_from_file,
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


def validate_cv_file(file) -> Optional[str]:
    """
    Valida il file caricato prima del parsing.
    Ritorna None se valido, stringa di errore altrimenti.
    """
    ext = os.path.splitext(file.name)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return f"Tipo file non supportato: {ext}. Usa PDF, DOCX o TXT."

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

        logger.debug(f"File temporaneo creato: {temp_path}")

        # Estrai testo
        cv_text = extract_text_from_file(temp_path)

        if cv_text is None:
            error_payload = {"error": "Estrazione testo fallita (formato non supportato o illeggibile)."}
            return map_extracted_data_to_template(error_payload, error_payload, originalJsonStructure)

        # Parsing EN
        extracted_en = {"error": "Parser EN non disponibile."}
        try:
            extracted_en = extract_with_resume_parser_en(temp_path)
        except Exception as e:
            logger.warning(f"Parser EN fallito: {e}")

        # Parsing IT
        extracted_it = {"error": "Parser IT non disponibile."}
        try:
            extracted_it = extract_with_spacy_italian_improved(cv_text)
        except Exception as e:
            logger.warning(f"Parser IT fallito: {e}")

        # Mapping finale
        mapped_data = map_extracted_data_to_template(extracted_en, extracted_it, originalJsonStructure)
        logger.info("Parsing CV completato con successo.")
        return mapped_data

    except Exception as e:
        logger.error(f"Errore durante il parsing del CV: {e}")
        return {"error": f"Errore interno durante il parsing: {str(e)}"}
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
            logger.debug(f"File temporaneo rimosso: {temp_path}")
