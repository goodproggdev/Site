import React, { useEffect, useState, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import cvApi from '../services/cvApi';
import Home from './Home';

const PublicCV: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [cvData, setCvData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCV = async () => {
      try {
        const response = await cvApi.get(`/api/cv/public/${slug}/`);
        setCvData(response.data);
      } catch (err: any) {
        setError(err.response?.data?.error || "CV non trovato.");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCV();
    }
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Caricamento CV...</div>;
  if (error) return <div className="min-h-screen flex flex-col items-center justify-center">
    <h1 className="text-2xl font-bold text-gray-800">404 - Ops!</h1>
    <p className="text-gray-600 mt-2">{error}</p>
    <a href="/" className="mt-4 text-primary hover:underline">Torna alla Home</a>
  </div>;

  // Qui dovremmo idealmente rendere il CV usando lo stesso componente del preview o iniettando i dati nel template
  // Per ora, visto che il template è dinamico in Home, proviamo a passare i dati a un'istanza di Home specializzata
  // O meglio, se Home supporta un prop di dati iniziale, usiamo quello.
  // In mancanza di ciò, mostriamo un'anteprima testuale o un componente dedicato.
  
  return (
    <div className="public-cv-container">
      {/* 
        In una versione completa, qui caricheremmo il template scelto dall'utente.
        Per ora riutilizziamo la struttura della Home passando i dati caricati.
      */}
      <Suspense fallback={<div>Rendering...</div>}>
         {/* Assumendo che Home possa gestire dati esterni se passati come prop o tramite context */}
         <Home initialData={cvData} isPublicView={true} />
      </Suspense>
    </div>
  );
};

export default PublicCV;
