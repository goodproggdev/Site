import { Button, Card } from 'flowbite-react';

const HeroSection: React.FC = () => {
  return (
    <section className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-8 text-white">
      <div className="container mx-auto flex flex-col lg:flex-row items-center">
        <div className="lg:w-1/2 w-full mb-6 lg:mb-0">
          <img src="images/iphone.png" alt="Demo image" className="w-full" />
        </div>
        <div className="lg:w-1/2 w-full text-center lg:text-left">
          <span className="text-xl font-semibold">Genera il tuo CV</span>
          <h1 className="text-4xl font-bold mt-2 mb-4">
            Compila il nostro Form <b>Noi Creeremo il tuo CV al meglio</b>
          </h1>
          <p className="mb-4">Dai un Boost alla tua Persona e al tuo Lavoro</p>
          <Button gradientDuoTone="purpleToPink" size="lg">
            Scopri di più
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
