import os
import sys
import json
import spacy
import re
import copy
from pypdf import PdfReader
# from docx import Document # Se vuoi supportare .docx, assicurati di avere python-docx e decommenta
from flask import Flask, request, jsonify
from flask_cors import CORS # Importa CORS
import tempfile # Per gestire file temporanei

# Importa la libreria resume-parser
try:
    from resume_parser import ResumeParser
    RESUME_PARSER_AVAILABLE = True
    print("Libreria 'resume-parser' caricata con successo.")
except ImportError:
    print("AVVISO: Libreria 'resume-parser' non trovata. L'estrazione con modello inglese potrebbe non funzionare.")
    RESUME_PARSER_AVAILABLE = False
except Exception as e:
    print(f"AVVISO: Errore durante l'importazione di 'resume-parser': {e}. L'estrazione con modello inglese potrebbe non funzionare.")
    RESUME_PARSER_AVAILABLE = False

# --- Carica i modelli linguistici di spaCy ---
# Carica i modelli all'avvio dell'applicazione Flask
# così non vengono ricaricati ad ogni richiesta.
nlp_en = None
nlp_it = None

try:
    # Modello inglese (usato internamente da resume-parser o esplicitamente)
    nlp_en = spacy.load("en_core_web_sm")
    print("Modello spaCy inglese 'en_core_web_sm' caricato con successo.")
except OSError:
    print("AVVISO: Modello spaCy inglese 'en_core_web_sm' non trovato.")
    print("Per favore, esegui: python -m spacy download en_core_web_sm")
    print("L'estrazione con resume-parser (inglese) potrebbe non funzionare.")
except Exception as e:
    print(f"AVVISO: Errore imprevisto durante il caricamento di 'en_core_web_sm': {e}")


try:
    # Modello italiano
    nlp_it = spacy.load("it_core_news_sm")
    print("Modello spaCy italiano 'it_core_news_sm' caricato con successo.")
except OSError:
    print("AVVISO: Modello spaCy italiano 'it_core_news_sm' non trovato.")
    print("Per favore, esegui: python -m spacy download it_core_news_sm") # Corretto il nome del modello nel messaggio
    print("L'estrazione con spaCy (italiano) potrebbe non funzionare.")
except Exception as e:
    print(f"AVVISO: Errore imprevisto durante il caricamento di 'it_core_news_sm': {e}")


# --- Funzione per leggere testo da file (PDF e potenzialmente altri) ---
def extract_text_from_file(file_path):
    """Estrae testo da un file (supporta PDF)."""
    extension = os.path.splitext(file_path)[1].lower()
    text = ""
    if extension == ".pdf":
        try:
            reader = PdfReader(file_path)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
            if not text:
                print(f"AVVISO: Nessun testo estratto dal PDF {file_path}. Il PDF potrebbe essere basato su immagini o protetto.")
                return None
            return text
        except Exception as e:
            print(f"Errore nella lettura del file PDF {file_path}: {e}")
            return None
    # Aggiungi qui il supporto per altri formati, es. .docx
    # elif extension == ".docx":
    #     try:
    #         doc = Document(file_path)
    #         for paragraph in doc.paragraphs:
    #             text += paragraph.text + "\n"
    #         return text
    #     except Exception as e:
    #          print(f"Errore nella lettura del file DOCX {file_path}: {e}")
    #          return None
    # Aggiungi supporto per .txt
    elif extension == ".txt":
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                text = f.read()
            if not text.strip():
                 print(f"AVVISO: File TXT vuoto {file_path}.")
                 return None
            return text
        except Exception as e:
             print(f"Errore nella lettura del file TXT {file_path}: {e}")
             return None
    # Potresti voler aggiungere .rtf ma richiede una libreria specifica
    # elif extension == ".rtf":
    #     print("Supporto RTF non implementato.")
    #     return None
    else:
        print(f"Formato file non supportato per l'estrazione testo: {extension}.")
        return None


# --- Funzione per l'estrazione con resume-parser (modello inglese) ---
def extract_with_resume_parser_en(file_path):
    """
    Estrae dati usando resume-parser (basato su modello inglese) dal percorso del file.
    Utilizza il modello nlp_en (en_core_web_sm) caricato esternamente.
    """
    if not RESUME_PARSER_AVAILABLE:
        return {"error": "Estrazione inglese (resume-parser) non disponibile: libreria non importata."}
    if nlp_en is None:
        return {"error": "Estrazione inglese (resume-parser) non disponibile: modello spaCy 'en_core_web_sm' non caricato."}
    if not os.path.exists(file_path):
         return {"error": f"File non trovato per resume-parser: {file_path}"}

    print(f"\n--- Tentativo di estrazione con resume-parser (modello inglese: en_core_web_sm) da {os.path.basename(file_path)} ---")

    try:
        # MODIFICA CHIAVE: Passa il modello nlp_en caricato esplicitamente
        parser = ResumeParser(file_path, clean_text=True, spacy_model=nlp_en)
        extracted_data = parser.get_extracted_data()
        print("Estrazione resume-parser completata.")
        # Aggiungi un controllo per vedere se i dati estratti sono vuoti o minimi
        if not extracted_data or all(value is None or (isinstance(value, (list, dict)) and not value) or (isinstance(value, str) and not value.strip()) for value in extracted_data.values()):
            print("AVVISO: resume-parser ha restituito dati vuoti o minimi. Il CV potrebbe non essere in un formato/lingua ottimale per questo parser.")
        return extracted_data
    except Exception as e:
        print(f"Errore o eccezione durante l'esecuzione di resume-parser: {str(e)}")
        print("Questo potrebbe essere dovuto a incompatibilità o problemi interni alla libreria resume-parser, anche usando en_core_web_sm.")
        return {"error": f"Errore durante l'estrazione con resume-parser (inglese): {str(e)}"}


# --- Funzione per l'estrazione migliorata con spaCy (modello italiano) ---
def extract_with_spacy_italian_improved(text):
    """
    Estrae dati usando spaCy con modello italiano e logica euristica migliorata.
    """
    if nlp_it is None:
        return {"error": "Modello spaCy italiano 'it_core_news_sm' non disponibile. Impossibile eseguire estrazione italiana."}
    if not text or text.isspace():
        return {"error": "Testo del CV vuoto o mancante per l'estrazione italiana."}

    print(f"\n--- Tentativo di estrazione migliorata con spaCy (modello italiano) ---")

    doc = nlp_it(text)

    extracted_data_it_internal = {
        "nome": None, "email": None, "telefono": None, "linkedin": None, "github": None,
        "sommario": None, "competenze_list_raw": [],
        "istruzione_list_structured": [], "esperienza_lavorativa_list_structured": [],
        "lingue_list_raw": [], "altre_entita": []
    }

    email_match = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text)
    if email_match: extracted_data_it_internal["email"] = email_match.group(0)

    # Regex per telefono migliorata, considera vari formati inclusi +39 e spazi/punti
    phone_match = re.search(r'(\+?\d{1,4}[.\-\s]?)?(\(?\d{2,}\)?[.\-\s]?)?(\d{3,})[.\-\s]?(\d{3,})[.\-\s]?(\d*)', text)
    if phone_match:
        # Rimuovi separatori non numerici per standardizzare
        phone_number = ''.join(filter(None, phone_match.groups())).replace('.', '').replace('-', '').replace('(', '').replace(')', '').replace(' ', '')
        # Aggiungi +39 se sembra un numero italiano senza prefisso internazionale
        if re.match(r'^\d{6,}$', phone_number) and not phone_number.startswith('0') and not phone_number.startswith('39'):
             phone_number = '+39' + phone_number
        elif re.match(r'^0\d', phone_number): # Se inizia con 0, aggiungi +39
             phone_number = '+39' + phone_number
        extracted_data_it_internal["telefono"] = phone_number


    linkedin_match = re.search(r'(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w_-]+', text, re.IGNORECASE)
    if linkedin_match: extracted_data_it_internal["linkedin"] = linkedin_match.group(0).strip()

    github_match = re.search(r'(?:https?:\/\/)?(?:www\.)?github\.com\/[\w_-]+', text, re.IGNORECASE)
    if github_match: extracted_data_it_internal["github"] = github_match.group(0).strip()

    text_lower = text.lower()
    section_boundaries = {}
    section_titles_it = {
        "sommario": ["profilo professionale", "sommario", "profilo", "chi sono", "about me"], # Aggiunto "about me" per flessibilità
        "esperienza_lavorativa": ["esperienza lavorativa", "esperienze professionali", "esperienza", "work experience"], # Aggiunto "work experience"
        "istruzione": ["istruzione", "formazione", "education"], # Aggiunto "education"
        "competenze": ["competenze tecniche", "competenze", "skills", "capacità professionali", "capacità", "technical skills"], # Aggiunto "technical skills"
        "lingue": ["lingue", "languages"], # Aggiunto "languages"
    }

    for key, titles in section_titles_it.items():
        for title in titles:
            # Regex migliorata per trovare titoli di sezione con maggiore precisione
            match = re.search(r"(^|\n)\s*" + re.escape(title) + r"\s*($|\n|:)", text_lower, re.MULTILINE)
            if match:
                section_boundaries[match.start()] = key
                break

    sorted_starts = sorted(section_boundaries.keys())
    section_texts = {}
    for i, start_index in enumerate(sorted_starts):
        section_name = section_boundaries[start_index]
        # Trova l'inizio del testo della sezione (dopo il titolo)
        # Cerca il primo newline o ':' dopo l'inizio del titolo trovato
        header_match = re.match(r"([^\n:]+)(:|\n|$)", text[start_index:], re.IGNORECASE)
        actual_text_start = start_index
        if header_match:
            actual_text_start += len(header_match.group(0))

        end_index = sorted_starts[i+1] if i+1 < len(sorted_starts) else len(text)
        section_texts[section_name] = text[actual_text_start:end_index].strip()


    # Nome (Prima entità PERSON o prime righe non vuote) - Logica migliorata
    first_section_start = sorted_starts[0] if sorted_starts else len(text)
    text_before_first_section = text[:first_section_start].strip()
    if text_before_first_section:
        doc_before = nlp_it(text_before_first_section)
        person_entities = [ent.text.strip() for ent in doc_before.ents if ent.label_ == "PERSON" and len(ent.text.split()) > 1]
        if person_entities:
            extracted_data_it_internal["nome"] = person_entities[0]
        else:
            lines_before = [line.strip() for line in text_before_first_section.split('\n') if line.strip()]
            if lines_before:
                 potential_name_line = ""
                 for line in lines_before:
                     # Euristiche migliorate: 1-4 parole, inizia con maiuscola, non contiene numeri o simboli strani comuni nei contatti
                     if 1 < len(line.split()) < 5 and all(word[0].isupper() for word in line.split() if word) and not re.search(r'\d|@|\.com|\+|-', line):
                         potential_name_line = line
                         break
                 if potential_name_line:
                     extracted_data_it_internal["nome"] = potential_name_line
                 elif lines_before: # Fallback estremo
                     extracted_data_it_internal["nome"] = lines_before[0]


    if "sommario" in section_texts:
        extracted_data_it_internal["sommario"] = section_texts["sommario"]

    if "competenze" in section_texts:
        comp_text = section_texts["competenze"]
        potential_skills = []
        # Divisione per linea e poi potenziale divisione interna per virgola o punto e virgola se la linea è lunga
        for line in comp_text.split('\n'):
            clean_line = re.sub(r"^[\-\*\•\s]+", "", line.strip()).strip()
            if not clean_line: continue

            # Cerca se la linea inizia con un titolo di categoria (Linguaggi:, Framework:, etc.)
            category_match = re.match(r"^\s*([^:\n]+?)\s*:\s*(.+)", clean_line, re.IGNORECASE)
            if category_match:
                # category_name = category_match.group(1).strip()
                skills_string = category_match.group(2).strip()
                # Dividi per virgola, punto e virgola o altri separatori comuni
                skills_on_line = [skill.strip() for skill in re.split(r',|;', skills_string) if skill.strip()]
                for skill_name in skills_on_line:
                    potential_skills.append({"name": skill_name.replace('.', '').strip(), "level": "N/A"})
            elif clean_line: # Altrimenti, considera l'intera linea una skill
                 potential_skills.append({"name": clean_line.replace('.', '').strip(), "level": "N/A"})

        extracted_data_it_internal["competenze_list_raw"] = list({skill["name"]: skill for skill in potential_skills if skill["name"]}.values()) # Usa un dict per rimuovere duplicati per nome skill


    if "lingue" in section_texts:
        lang_text = section_texts["lingue"]
        potential_languages = []
        for line in lang_text.split('\n'):
            clean_line = re.sub(r"^[\-\*\•\s]+", "", line.strip()).strip()
            if not clean_line: continue
            # Regex più robusta per catturare nome e livello
            match = re.match(r"^\s*([^:\-\(\s]+)[\s:\-\(]+([^:\-\(\s]+(?:\s+[^:\-\(\s]+)*)?[\s:\-\(]*\)?", clean_line) # Lingua : Livello or Lingua (Livello)
            if match:
                lang_name = match.group(1).strip()
                lang_level = match.group(2).strip() if match.group(2) else "N/A"
                if lang_name:
                    potential_languages.append({"name": lang_name, "level": lang_level})
            elif clean_line: # Solo nome lingua
                 potential_languages.append({"name": clean_line, "level": "N/A"})
        extracted_data_it_internal["lingue_list_raw"] = list({lang["name"]: lang for lang in potential_languages if lang["name"]}.values()) # Rimuovi duplicati


    def parse_experience_or_education_section(section_text):
        items_structured = []
        # Regex per periodi di date, più flessibile e cerca all'inizio della linea o dopo bullets
        date_pattern = r'(?:^|\n)\s*([\-\*\•\s]*)?\b((?:Gennaio|Febbraio|Marzo|Aprile|Maggio|Giugno|Luglio|Agosto|Settembre|Ottobre|Novembre|Dicembre|Giu|Lug|Set|Ott|Nov|Dic|\d{1,2})?[.\-\s]+)?(\d{4})\s*[\-\–]\s*((?:Gennaio|Febbraio|Marzo|Aprile|Maggio|Giugno|Luglio|Agosto|Settembre|Ottobre|Novembre|Dicembre|Giu|Lug|Set|Ott|Nov|Dic|\d{1,2})?[.\-\s]+)?(\d{4}|Presente|In corso|Attualmente)\b|\b\d{4}\s*-\s*(Presente|In corso|Attualmente)\b|\b\d{4}\b'

        # Tenta di dividere il testo in blocchi basati su linee che sembrano iniziare un nuovo elemento
        # (es. linea che inizia con una data, un bullet point, o una maiuscola che non segue un punto)
        # Questo è un punto molto euristico e può fallire con formattazioni inattese.
        lines = section_text.split('\n')
        blocks = []
        current_block_lines = []

        for i, line in enumerate(lines):
            clean_line = line.strip()
            if not clean_line:
                if current_block_lines:
                    blocks.append("\n".join(current_block_lines))
                    current_block_lines = []
                continue

            is_new_item_candidate = False
            # Criteri euristici per un nuovo item:
            # 1. Inizia con una data (pattern di date)
            # 2. Inizia con un bullet point
            # 3. Inizia con una maiuscola e la linea precedente finisce con un punto (fine frase)
            # 4. La linea precedente è vuota

            if re.match(date_pattern, clean_line, re.IGNORECASE) or re.match(r"^[\-\*\•]", clean_line):
                is_new_item_candidate = True
            elif i > 0:
                prev_line_clean = lines[i-1].strip()
                if not prev_line_clean or prev_line_clean.endswith('.') or prev_line_clean.endswith('!') or prev_line_clean.endswith('?'):
                     if clean_line and clean_line[0].isupper():
                         is_new_item_candidate = True


            if is_new_item_candidate and current_block_lines:
                blocks.append("\n".join(current_block_lines))
                current_block_lines = []

            current_block_lines.append(clean_line)

        if current_block_lines:
            blocks.append("\n".join(current_block_lines))

        for block_text in blocks:
            if not block_text.strip(): continue

            item = {"period": None, "title": None, "subtitle": None, "description_lines": []}
            lines_in_block = block_text.split('\n')

            # Tenta di estrarre il periodo dalla prima linea del blocco
            first_line = lines_in_block[0]
            date_match = re.search(date_pattern, first_line, re.IGNORECASE)
            if date_match:
                item["period"] = date_match.group(0).strip().replace('-', ' - ').replace('–', ' – ') # Normalizza separatore date
                # Rimuovi il periodo dalla prima linea per ottenere il resto (potenziale titolo)
                first_line_without_period = first_line.replace(date_match.group(0), "").strip()
                if first_line_without_period:
                     item["title"] = re.sub(r"^[\-\*\•\s]+", "", first_line_without_period).strip() # Rimuovi bullets residui
                item["description_lines"].extend(lines_in_block[1:]) # Il resto sono linee di descrizione
            else:
                 # Se non c'è data nella prima linea, la prima linea è probabilmente il titolo
                 item["title"] = re.sub(r"^[\-\*\•\s]+", "", first_line).strip()
                 item["description_lines"].extend(lines_in_block[1:])


            # Logica per trovare sottotitolo e descrizioni migliorata
            remaining_lines = list(item["description_lines"]) # Copia le linee di descrizione iniziali
            item["description_lines"] = [] # Reset per ricostruire

            potential_subtitle = None
            if remaining_lines:
                 # Considera la prima o le prime due righe come potenziale sottotitolo se non troppo lunghe
                 candidate_subtitle_lines = []
                 for i in range(min(2, len(remaining_lines))): # Controlla max le prime 2 linee
                     line = remaining_lines[i].strip()
                     if line and len(line.split()) < 15 and not re.search(date_pattern, line, re.IGNORECASE): # Non deve sembrare una data o una descrizione troppo lunga
                         candidate_subtitle_lines.append(line)
                     else:
                         break # Se una linea non sembra un sottotitolo, il sottotitolo finisce prima

                 if candidate_subtitle_lines:
                     potential_subtitle = " ".join(candidate_subtitle_lines).strip()
                     # Le righe rimanenti sono la vera descrizione
                     item["description_lines"].extend(remaining_lines[len(candidate_subtitle_lines):])
                 else:
                     # Se nessuna delle prime righe sembra un sottotitolo, tutte sono descrizione
                     item["description_lines"].extend(remaining_lines)

            item["subtitle"] = potential_subtitle

            # Pulisci e unisci le linee di descrizione
            item["description"] = " ".join(line.strip() for line in item["description_lines"] if line.strip()).strip()

            # Se il sottotitolo è vuoto ma la descrizione non lo è, usa la descrizione come sottotitolo
            if not item["subtitle"] and item["description"]:
                 item["subtitle"] = item["description"]
                 item["description"] = "" # Evita duplicazione
            elif item["subtitle"] and item["description"]: # Se entrambi esistono, potresti volerli unire o lasciare separati
                 # Qui scegliamo di unirli nel sottotitolo per semplicità di mapping al template attuale
                 item["subtitle"] += ". " + item["description"]
                 item["description"] = "" # Evita duplicazione


            # Raffina titolo e sottotitolo finali (rimuovi bullets, etc.)
            if item["title"]: item["title"] = re.sub(r"^[\-\*\•\s]+", "", item["title"]).strip()
            if item["subtitle"]: item["subtitle"] = re.sub(r"^[\-\*\•\s]+", "", item["subtitle"]).strip()


            if item["title"] or item["period"] or item["subtitle"]: # Aggiungi solo se c'è almeno un campo significativo
                # Mapping semplificato al formato del template (period, title, subtitle)
                items_structured.append({
                    "period": item.get("period", ""),
                    "title": item.get("title", ""),
                    "subtitle": item.get("subtitle", "")
                })

        return items_structured


    if "istruzione" in section_texts:
        extracted_data_it_internal["istruzione_list_structured"] = parse_experience_or_education_section(section_texts["istruzione"])

    if "esperienza_lavorativa" in section_texts:
        extracted_data_it_internal["esperienza_lavorativa_list_structured"] = parse_experience_or_education_section(section_texts["esperienza_lavorativa"])


    # Estrazione entità generiche non coperte dalle sezioni specifiche
    for ent in doc.ents:
        if ent.label_ not in ["PERSON", "ORG", "LOC", "DATE", "GPE", "CARDINAL", "PERCENT", "MONEY", "QUANTITY", "ORDINAL"] and len(ent.text.strip()) > 2:
             extracted_data_it_internal["altre_entita"].append({"text": ent.text.strip(), "label": ent.label_})

    print("Estrazione spaCy (italiano) completata.")
    # Aggiungi un controllo per vedere se i dati estratti sono vuoti o minimi
    if not extracted_data_it_internal or all(value is None or (isinstance(value, (list, dict)) and not value) or (isinstance(value, str) and not value.strip()) for key, value in extracted_data_it_internal.items() if key not in ["altre_entita"]):
         print("AVVISO: L'estrazione spaCy (italiano) ha restituito dati vuoti o minimi.")

    return extracted_data_it_internal


# --- Funzione di Mapping (aggiornata per gestire entrambi i risultati) ---
def map_extracted_data_to_template(extracted_data_en, extracted_data_it, template_data):
    """
    Mappa i dati estratti dai parser inglese e italiano nella struttura del template.
    Preferisce i dati dall'estrazione italiana se disponibili.
    """
    populated_data = copy.deepcopy(template_data)
    print(f"\n--- Mapping dati estratti nella struttura del template ---")

    # Gestione stato estrazione
    populated_data["extraction_status_en"] = "Success" if "error" not in extracted_data_en else "Failed"
    if "error" in extracted_data_en:
         populated_data["extraction_error_en"] = extracted_data_en["error"]
         print(f"Estrazione inglese fallita: {extracted_data_en['error']}")

    populated_data["extraction_status_it"] = "Success" if "error" not in extracted_data_it else "Failed"
    if "error" in extracted_data_it:
         populated_data["extraction_error_it"] = extracted_data_it["error"]
         print(f"Estrazione italiana fallita: {extracted_data_it['error']}")


    # --- Mapping dai dati estratti (preferendo l'italiano) ---

    # Campi semplici (preferenza italiano)
    name = extracted_data_it.get("nome") if extracted_data_it.get("nome") else extracted_data_en.get("name")
    if name: populated_data["name"] = name

    email_it = extracted_data_it.get("email")
    email_en = extracted_data_en.get("email")
    email_to_map = email_it if email_it else email_en
    if email_to_map and populated_data.get("personal_info"):
         populated_data["personal_info"]["work_email"] = email_to_map
         populated_data["personal_info"]["personal_email"] = email_to_map

    phone_it = extracted_data_it.get("telefono")
    phone_en = extracted_data_en.get("phone")
    phone_to_map = phone_it if phone_it else phone_en
    if phone_to_map and populated_data.get("personal_info"):
         populated_data["personal_info"]["work_number"] = phone_to_map

    linkedin_it = extracted_data_it.get("linkedin")
    linkedin_en = extracted_data_en.get("linkedin")
    linkedin_to_map = linkedin_it if linkedin_it else linkedin_en
    if linkedin_to_map and populated_data.get("social_links"):
         populated_data["social_links"]["linkedin"] = linkedin_to_map

    github_it = extracted_data_it.get("github")
    github_en = extracted_data_en.get("github")
    github_to_map = github_it if github_it else github_en
    if github_to_map and populated_data.get("social_links"):
         populated_data["social_links"]["github"] = github_to_map

    # Sommario / About (preferenza italiano)
    summary_it = extracted_data_it.get("sommario")
    if summary_it and populated_data.get("about"):
         sentences = re.split(r'(?<=[.!?])\s+', summary_it, 1)
         populated_data["about"]["who"] = sentences[0].strip() if sentences else summary_it.strip()
         populated_data["about"]["details"] = sentences[1].strip() if len(sentences) > 1 else ""
    # Non mappiamo il sommario inglese automaticamente qui per evitare sovrascritture indesiderate se l'italiano ha trovato qualcosa


    # Skills (preferenza italiano, altrimenti inglese)
    skills_it = extracted_data_it.get("competenze_list_raw")
    skills_en = extracted_data_en.get("skills")
    skills_to_map = skills_it if skills_it else ([] if "error" in extracted_data_it else None) # Usa italiano se disponibile, altrimenti None se errore, altrimenti cerca inglese
    if skills_to_map is None:
         skills_to_map = [{"name": str(skill).strip(), "level": "N/A"} for skill in skills_en if str(skill).strip()] if skills_en else [] # Mappa skill inglesi se disponibili

    if skills_to_map is not None: # Aggiorna solo se abbiamo trovato skill da qualche parte
         populated_data["skills"] = [s for s in skills_to_map if s.get("name")] # Filtra skill senza nome


    # Lingue (preferenza italiano)
    languages_it = extracted_data_it.get("lingue_list_raw")
    if languages_it:
         populated_data["languages"] = [l for l in languages_it if l.get("name")]


    # Istruzione (preferenza italiano)
    education_it = extracted_data_it.get("istruzione_list_structured")
    if education_it:
         populated_data["education_list"] = [e for e in education_it if e.get("title") or e.get("period") or e.get("subtitle")]


    # Esperienza Lavorativa (preferenza italiano)
    experience_it = extracted_data_it.get("esperienza_lavorativa_list_structured")
    if experience_it:
        # Mappa le esperienze italiane al formato del template work_experience_list
         populated_data["work_experience_list"] = [e for e in experience_it if e.get("title") or e.get("period") or e.get("subtitle")]

    # Se l'estrazione italiana dell'esperienza fallisce, prova l'inglese
    elif "error" not in extracted_data_en and extracted_data_en.get("experience"):
        exp_list_en = []
        for exp_item in extracted_data_en["experience"]:
            if isinstance(exp_item, dict):
                title = str(exp_item.get('title', '')).strip()
                company = str(exp_item.get('company', '')).strip()
                period = str(exp_item.get('years', '') or exp_item.get('date_range', '') or exp_item.get('dates','')).strip()
                description = str(exp_item.get('description', '')).strip()

                subtitle = company
                if company and description:
                    subtitle += ": " + description
                elif description and not company:
                    subtitle = description

                if title or subtitle or period:
                    exp_list_en.append({"period": period, "title": title, "subtitle": subtitle})
        populated_data["work_experience_list"] = exp_list_en


    # Puoi aggiungere qui la logica di mapping per altre sezioni (expertise, statistics, services, portfolio_items, blog_posts, pricing_packs)
    # in base ai dati che i tuoi parser riescono a estrarre e alla struttura del template.
    # Al momento, per queste sezioni, se non sono popolate sopra, manterranno i valori dal template originale.

    print("Mapping completato.")
    return populated_data


# --- Configurazione Flask ---
app = Flask(__name__)
CORS(app) # Abilita CORS per permettere richieste dal frontend React

# Definizione della struttura JSON template (puoi caricarla da file qui o mantenerla come costante)
# Per semplicità, la manteniamo come costante come nel frontend, ma in un'applicazione reale
# potresti volerla caricare da un file di configurazione.
originalJsonStructure = {
	"name": "",
	"presentation": "",
	"header_mono_subtitle": "",
	"print_resume": "",
	"download_my_cv": "",
	"social_links": {
		"facebook": "#",
		"twitter": "#",
		"instagram": "#",
		"github": "#"
	},
	"my_resume_label": {
		"my": "My",
		"resume": "Resume"
	},
	"who_am_i": "",
	"about": {
		"who": "", # Inizializza vuoto se vuoi che il parser lo popoli
		"details": "" # Inizializza vuoto
	},
	"personal_info": {
		"birthdate": "",
		"work_email": "",
		"personal_email": "",
		"work_number": "",
		"instagram": ""
	},
	"skills_label": "",
	"skills": [], # Inizializza vuoto per essere popolato dal parser
	"languages_label": "",
	"languages": [], # Inizializza vuoto per essere popolato dal parser
	"personal_info_label": "",
	"my_expertise_label": "",
	"expertise_list": [], # Inizializza vuoto
	"education_label": "",
	"education_list": [], # Inizializza vuoto per essere popolato dal parser
	"work_experience_label": "",
	"work_experience_list": [], # Inizializza vuoto per essere popolato dal parser
	"statistics": [], # Inizializza vuoto
	"my_service_label": "",
	"services": [], # Inizializza vuoto
	"contact_label": "",
	"pricing_packs_label": "",
	"pricing_packs": [], # Inizializza vuoto
	"freelancing_label": "",
	"hire_me_label": "",
	"my_portfolio_label": "",
	"portfolio_items": [], # Inizializza vuoto o con elementi base se vuoi
	"latest_label": "",
	"news_label": "",
	"blog_posts": [], # Inizializza vuoto o con elementi base se vuoi
	"form_title": "",
	"form_placeholder_name": "",
	"form_placeholder_email": "",
	"form_placeholder_message": "",
	"form_button_text": "",
	"contact_title": "",
	"phone_label": "",
	"phone_number": "",
	"address_label": "",
	"address": "",
	"email_label": "",
	"email": ""
}


# --- Endpoint API per il parsing del CV ---
@app.route('/parse-cv', methods=['POST'])
def parse_cv_api():
    print("Richiesta /parse-cv ricevuta.")
    if 'cv_file' not in request.files:
        return jsonify({"error": "Nessun file 'cv_file' nella richiesta."}), 400

    file = request.files['cv_file']
    if file.filename == '':
        return jsonify({"error": "Nome file vuoto."}), 400

    # Salva temporaneamente il file per permettere ai parser basati su percorso di accedervi
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp_file:
            file.save(tmp_file.name)
            temp_path = tmp_file.name

        # Esegui le estrazioni
        cv_text = extract_text_from_file(temp_path)

        if cv_text is None:
             # Se l'estrazione del testo fallisce, restituisci un JSON con un errore
             error_payload = {"error": "Estrazione testo dal file fallita (formato non supportato o contenuto illeggibile)."}
             # Mappa l'errore nel template per coerenza con il frontend
             mapped_data = map_extracted_data_to_template(error_payload, error_payload, originalJsonStructure)
             os.remove(temp_path) # Pulisci il file temporaneo
             return jsonify(mapped_data), 200 # Restituisci comunque 200 con stato di errore nel JSON

        extracted_data_en = extract_with_resume_parser_en(temp_path)
        extracted_data_it = extract_with_spacy_italian_improved(cv_text)

        # Pulisci il file temporaneo subito dopo l'uso da parte dei parser
        os.remove(temp_path)
        print(f"File temporaneo '{temp_path}' rimosso.")


        # Mappa i dati estratti nel template JSON
        mapped_data = map_extracted_data_to_template(extracted_data_en, extracted_data_it, originalJsonStructure)

        print("Risposta JSON pronta.")
        return jsonify(mapped_data) # Restituisce il JSON popolato al frontend

    except Exception as e:
        print(f"Errore interno del server: {str(e)}")
        # Assicurati di pulire il file temporaneo anche in caso di eccezioni
        if 'temp_path' in locals() and os.path.exists(temp_path):
             os.remove(temp_path)
             print(f"File temporaneo '{temp_path}' rimosso dopo errore.")
        return jsonify({"error": f"Errore interno del server: {str(e)}"}), 500


# --- Esecuzione del server Flask ---
if __name__ == '__main__':
    print("Avvio server Flask...")
    # Controlla la disponibilità dei modelli e librerie all'avvio
    if nlp_en is None or nlp_it is None or not RESUME_PARSER_AVAILABLE:
         print("\nATTENZIONE: Alcuni modelli spaCy o la libreria resume-parser non sono stati caricati.")
         print("L'estrazione dei dati potrebbe non funzionare correttamente.")
         print("Assicurati di aver installato i modelli e le librerie richieste:")
         print("pip install -r requirements.txt (con pypdf, Flask, Flask-Cors, resume-parser)")
         print("python -m spacy download en_core_web_sm")
         print("python -m spacy download it_core_news_sm")
         print("-" * 20)


    # L'host='0.0.0.0' rende il server accessibile esternamente (utile in Docker o reti locali)
    # Per sviluppo locale su un singolo computer, host='127.0.0.1' o ometterlo va bene.
    # debug=True è utile per lo sviluppo, mostra errori dettagliati. Rimuoverlo in produzione.
    app.run(debug=True, host='127.0.0.1', port=5000) # Esegui il server sulla porta 5000