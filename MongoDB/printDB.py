from pymongo import MongoClient

def visualizza_documenti():
    try:
        # 1. Connessione a MongoDB
        client = MongoClient('localhost', 27017)
        print("✅ Connessione a MongoDB riuscita!")

        # 2. Seleziona il database e la collezione
        db = client['mio_database']
        collection = db['mia_collezione']

        # 3. Recupera tutti i documenti
        documenti = collection.find()

        # 4. Stampa i documenti
        for documento in documenti:
            print(documento)

    except Exception as e:
        print(f"❌ Errore: {e}")
    finally:
        # Chiudi la connessione a MongoDB
        if 'client' in locals():
            client.close()
            print("🔌 Connessione chiusa.")

# Esegui la funzione
visualizza_documenti()