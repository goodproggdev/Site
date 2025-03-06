from pymongo import MongoClient
import json

def salva_json_in_mongodb():
    try:
        # 1. Connessione a MongoDB
        client = MongoClient('localhost', 27017)
        print("✅ Connessione a MongoDB riuscita!")

        # 2. Seleziona il database (se non esiste, verrà creato automaticamente)
        db = client['mio_database']

        # 3. Seleziona la collezione (se non esiste, verrà creata automaticamente)
        collection = db['mia_collezione']

        # 4. Leggi il file JSON
        with open('data.json', 'r') as file:
            dati_json = json.load(file)
            print("📄 File JSON letto correttamente!")

        # 5. Inserisci i dati in MongoDB
        if isinstance(dati_json, list):
            # Se il JSON è un array, usa insert_many per inserire più documenti
            risultato = collection.insert_many(dati_json)
            print(f"➡️ {len(risultato.inserted_ids)} documenti inseriti con ID: {risultato.inserted_ids}")
        else:
            # Se il JSON è un singolo oggetto, usa insert_one per inserire un documento
            risultato = collection.insert_one(dati_json)
            print(f"➡️ 1 documento inserito con ID: {risultato.inserted_id}")

    except Exception as e:
        print(f"❌ Errore: {e}")
    finally:
        # Chiudi la connessione a MongoDB
        if 'client' in locals():
            client.close()
            print("🔌 Connessione chiusa.")

# Esegui la funzione
salva_json_in_mongodb()