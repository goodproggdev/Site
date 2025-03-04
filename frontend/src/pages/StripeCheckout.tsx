import { Button, Badge } from "flowbite-react";
import { loadStripe } from '@stripe/stripe-js';
import axios from "axios";

const PricingSection: React.FC = () => {
  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
  const products = [
    {
      id: 1,
      name: "Mantieni Online il tuo Sito",
      price: "50€",
      duration: "Annui",
      description: "Mantieni la tua pagina CV Online e Aggiornata alle ultime ricerche di mercato",
      features: [
        "Marketing plan",
        "Seo reporting tool",
        "Keywords explorer",
        "Competitive analysis",
        "Custom Domain"
      ],
      isDemo: true,
      priceId: "price_123" // Sostituisci con il tuo Price ID di Stripe
    },
    {
      id: 2,
      name: "Genera il tuo CV",
      price: "€150",
      duration: "Solo Una Volta",
      description: "Genereremo il tuo CV al Meglio e lo metteremo in una pagina Online",
      features: [
        "Marketing plan",
        "Seo reporting tool",
        "Keywords explorer",
        "Competitive analysis",
        "Your Site projects"
      ],
      priceId: "price_456" // Sostituisci con il tuo Price ID di Stripe
    },
    {
      id: 3,
      name: "Multilingua",
      price: "€100",
      duration: "Solo Una Volta",
      description: "Vuoi farti conoscere in Altri Paesi, con una piccola cifra ne avrai la possibilità di avere il tuo CV e la Tua Pagina anche in Inglese",
      features: [
        "Marketing plan",
        "Seo reporting tool",
        "Keywords explorer",
        "Competitive analysis",
        "Boost your projects"
      ],
      priceId: "price_789" // Sostituisci con il tuo Price ID di Stripe
    }
  ];

  const handleCheckout = async (priceId: string) => {
    try {
      const stripe = await stripePromise;
      
      const { data: session } = await axios.post(
        'http://localhost:8000/api/create-checkout-session/',
        { price_id: priceId },
        { withCredentials: true }
      );

      const result = await stripe?.redirectToCheckout({
        sessionId: session.id
      });

      if (result?.error) {
        console.error(result.error);
      }
    } catch (err) {
      console.error('Payment processing failed:', err);
    }
  };

  return (
    <section id="pricing" className="bg-white dark:bg-gray-900 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Listino Prodotti
          </h2>
          <p className="mt-4 text-xl text-gray-500 dark:text-gray-400">
            The best software to develop perfect content and advertising strategies to increase leads and sales.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((product) => (
            <div 
              key={product.id}
              className={`p-6 rounded-lg shadow-lg ${
                product.isDemo 
                  ? 'bg-gradient-to-b from-blue-500 to-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800'
              }`}
            >
              <div className="mb-6">
                <h3 className={`text-2xl font-bold mb-2 ${
                  !product.isDemo && 'text-gray-900 dark:text-white'
                }`}>
                  {product.name}
                </h3>
                <div className="flex items-baseline mb-2">
                  <span className="text-4xl font-extrabold">{product.price}</span>
                  <span className="ml-2 text-gray-500 dark:text-gray-400">
                    {product.duration}
                  </span>
                </div>
                <p className={`text-lg ${
                  product.isDemo ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {product.description}
                </p>
              </div>

              <div className={`h-px mb-6 ${
                product.isDemo ? 'bg-blue-400' : 'bg-gray-200 dark:bg-gray-700'
              }`} />

              <ul className="space-y-4 mb-8">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg
                      className={`w-5 h-5 mr-2 ${
                        product.isDemo ? 'text-blue-300' : 'text-blue-600 dark:text-blue-500'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className={product.isDemo ? 'text-blue-50' : 'text-gray-900 dark:text-white'}>
                      {feature}
                      {feature.includes('New!') && (
                        <Badge color={product.isDemo ? "blue" : "indigo"} className="ml-2">
                          New!
                        </Badge>
                      )}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="text-center">
                <Button
                  onClick={() => product.isDemo ? null : handleCheckout(product.priceId)}
                  color={product.isDemo ? "light" : "blue"}
                  className={`w-full ${
                    !product.isDemo && 
                    'hover:scale-105 transition-transform transform duration-200'
                  }`}
                  disabled={product.isDemo}
                >
                  {product.isDemo ? "Demo version" : "Buy now"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;