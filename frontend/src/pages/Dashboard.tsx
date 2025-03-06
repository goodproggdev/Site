import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard = ({ onLogout }: DashboardProps) => {
  const { username } = useParams();
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Welcome {username}</h1>
          <button 
            onClick={onLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
        
        {/* Aggiungi qui il contenuto della dashboard */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Your Statistics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded">
              <h3>Total Activities</h3>
              <p className="text-2xl font-bold">0</p>
            </div>
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded">
              <h3>Recent Updates</h3>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;