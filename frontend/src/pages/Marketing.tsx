import { Button } from 'flowbite-react';

const MarketingSection: React.FC = () => {
  return (
    <section className="bg-gray-900 p-8 text-white">
      <div className="container mx-auto flex flex-col lg:flex-row items-center">
        <div className="lg:w-1/2 w-full mb-6 lg:mb-0">
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 rounded-lg shadow-lg">
            <span className="text-xl font-semibold">Genera il tuo CV</span>
            <h2 className="text-3xl font-bold mt-2 mb-4">Dai Valore alla Tua Persona</h2>
            <p className="mb-4">Una volta compilato il Form daremo un punteggio al tuo CV basato su varie ricerche di mercato</p>
            <Button gradientDuoTone="purpleToPink" size="lg">
              Scopri di più
            </Button>
          </div>
        </div>
        <div className="lg:w-1/2 w-full">
          <img src="images/demo-image.png" alt="Demo image" className="w-full" />
        </div>
      </div>
    </section>
  );
};

export default MarketingSection;
