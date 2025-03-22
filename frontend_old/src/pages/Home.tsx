import { useState, useEffect } from 'react';
import axios from 'axios';

// Tipizzazione per un singolo item
interface Item {
  id: number;
  name: string;
}

const Home = () => {
  const [data, setData] = useState<Item[]>([]);  // Stato per gli items
  const [loading, setLoading] = useState<boolean>(true);  // Stato di caricamento
  const [error, setError] = useState<Error | null>(null);  // Stato per eventuali errori

  useEffect(() => {
    // Effettua la richiesta GET per recuperare gli items dal backend Django
    axios
      .get('http://127.0.0.1:8000/api/items/')
      .then((response) => {
        setData(response.data);  // Salva i dati
        setLoading(false);        // Termina il caricamento
      })
      .catch((err) => {
        setError(err);            // Imposta l'errore se c'è
        setLoading(false);
      });
  }, []);  // L'array vuoto significa che l'effetto verrà eseguito solo una volta

  const renderContent = () => {
    if (loading) {
      return <p>Caricamento...</p>;
    }

    if (error) {
      return <p>Errore nel recupero dei dati: {error.message}</p>;
    }

    return (
      <ul>
        {data.length === 0 ? (
          <li>Nessun item trovato</li>
        ) : (
          data.map((item) => (
            <li key={item.id}>{item.name}</li>
          ))
        )}
      </ul>
    );
  };

  return (
    <div>
      <h1>Lista di Items</h1>
      {renderContent()}
    </div>
  );
  
};

export default Home;
