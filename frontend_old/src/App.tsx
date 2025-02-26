import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';  // Importa il componente Home
import OutputTest from './pages/OutputTest';  // Importa il componente Profile
import PhoneMockup from './components/PhoneMockup';
import DesktopMockup from './components/DesktopMockup';
import Footer from './components/Footer';

const App = () => {
  const [count, setCount] = useState(0);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/data/")  // Adjust to your backend URL
      .then((response) => response.json())
      .then((json) => setData(json))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);
  return (
    <>

    <Navbar />
      {/* Puoi aggiungere altri contenuti qui se vuoi */}
      <div className="card">
        <button onClick={() => setCount(count + 1)}>
          count is {count}
        </button>
      </div>
      <div className="md:container md:mx-auto">
        
      <OutputTest />
</div>



      <Home />  {/* Aggiungi il componente Home qui per visualizzarlo */}
      <div className="grid grid-cols-4 gap-4">
      <div className="col-span-1">Hello</div>
  <div className="col-span-1"><PhoneMockup /></div>
  <div className="col-span-2"><DesktopMockup /></div>
</div>



      
      <Footer />
      <script src="../node_modules/dist/flowbite.min.js"></script>

    </>
  );
};

export default App;
