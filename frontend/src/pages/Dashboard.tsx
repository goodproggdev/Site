import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import cvApi from '../services/cvApi';
import { Link } from 'react-router-dom';

interface CV {
  id: number;
  slug: string;
  created_at: string;
  visits_count: number;
  is_published: boolean;
  thumbnail: string;
}

interface Stats {
  total_cvs: number;
  total_visits: number;
  plan: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [cvs, setCvs] = useState<CV[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await cvApi.get('/api/dashboard/');
        setCvs(response.data.cvs);
        setStats(response.data.stats);
      } catch (error) {
        console.error("Errore fetch dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Caricamento...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bentornato, {user?.name || 'Professionista'}</h1>
          <p className="mt-2 text-gray-600">Gestisci la tua identità digitale e monitora le tue performance.</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Piano Attuale</h3>
            <p className="mt-2 text-2xl font-bold text-primary capitalize">{stats?.plan || 'Free'}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Visite Totali</h3>
            <p className="mt-2 text-2xl font-bold text-gray-900">{stats?.total_visits || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 uppercase">CV Creati</h3>
            <p className="mt-2 text-2xl font-bold text-gray-900">{stats?.total_cvs || 0}</p>
          </div>
        </div>

        {/* CV List */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">I tuoi Siti CV</h2>
          <Link to="/" className="btn-primary py-2 px-4 rounded-lg text-sm">Crea Nuovo</Link>
        </div>

        {cvs.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
            <p className="text-gray-500">Non hai ancora creato alcun sito CV.</p>
            <Link to="/" className="mt-4 inline-block text-primary font-semibold">Inizia ora →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {cvs.map((cv) => (
              <div key={cv.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div className="aspect-video bg-gray-100 relative">
                  <img src={cv.thumbnail} alt={cv.slug} className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${cv.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {cv.is_published ? 'Pubblicato' : 'Bozza'}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="font-bold text-gray-900 truncate">/{cv.slug}</h4>
                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      <span className="font-semibold text-gray-900">{cv.visits_count}</span> visite
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/u/${cv.slug}`} className="p-2 text-gray-400 hover:text-primary" title="Visualizza">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                      </Link>
                      <button className="p-2 text-gray-400 hover:text-primary" title="Modifica">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;