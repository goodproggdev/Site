import { useState } from 'react';
import ContactForm from './ContactForm';

const Pricing = () => {
    const [selectedPlan, setSelectedPlan] = useState<string>('');

    const handleCheckout = async (priceId: string) => {
        try {
            const response = await fetch("http://localhost:8000/api/stripe/create-checkout/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('access_token')}` // Assumi che il token sia salvato qui
                },
                body: JSON.stringify({ price_id: priceId }),
            });
            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert("Errore durante l'avvio del pagamento: " + (data.error || "Riprova più tardi."));
            }
        } catch (error) {
            console.error("Errore checkout:", error);
            alert("Errore di connessione al server.");
        }
    };

    const handleContactClick = (planName: string) => {
        console.log(`Richiesta per: ${planName}`);
        setSelectedPlan(planName);

        const contactSection = document.getElementById('contact');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
        }
    };
    return (
        <>
            <section id="price" className="relative py-24 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                <div className="mx-auto max-w-screen-xl px-4 lg:px-6">
                    <div className="mx-auto text-center mb-16 max-w-screen-md">
                        <div className="text-indigo-600 font-bold tracking-widest uppercase text-sm mb-4">Pricing</div>
                        <h2 className="mb-6 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white lg:text-5xl">
                            Piani su misura per la tua <span className="text-gradient">Carriera</span>
                        </h2>
                        <p className="text-gray-600 sm:text-xl dark:text-gray-400 leading-relaxed">
                            Scegli il livello di visibilità di cui hai bisogno per scalare il tuo personal brand su LinkedIn.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                        {/* Piano Basic */}
                        <div className="flex flex-col p-6 lg:p-10 mx-auto max-w-lg text-center text-gray-900 bg-gray-50 dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 transition-all hover:shadow-2xl">
                            <h3 className="mb-4 text-xl lg:text-2xl font-bold">Standard</h3>
                            <p className="font-light text-gray-500 text-sm lg:text-lg dark:text-gray-400 leading-relaxed text-sm">Per chi inizia a curare la propria presenza online.</p>
                            <div className="flex justify-center items-baseline my-8 lg:my-10">
                                <span className="mr-2 text-5xl lg:text-6xl font-extrabold">9€</span>
                                <span className="text-gray-500 dark:text-gray-400 font-medium">/mese</span>
                            </div>
                            <ul className="mb-8 lg:mb-10 space-y-4 lg:space-y-5 text-left">
                                <li className="flex items-center space-x-3 text-gray-600 dark:text-gray-300 text-sm lg:text-base">
                                    <svg className="flex-shrink-0 w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                                    <span>CV Digitale su subdominio</span>
                                </li>
                                <li className="flex items-center space-x-3 text-gray-600 dark:text-gray-300 text-sm lg:text-base">
                                    <svg className="flex-shrink-0 w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                                    <span>Hosting premium incluso</span>
                                </li>
                            </ul>
                            <button 
                                onClick={() => handleCheckout('price_basic_id')}
                                className="w-full py-3 lg:py-4 px-6 text-sm font-bold text-gray-900 bg-white border-2 border-gray-200 rounded-2xl hover:bg-gray-100 transition-all dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600">
                                Abbonati Ora
                            </button>
                        </div>

                        {/* Piano Professional */}
                        <div className="glass-card flex flex-col p-6 lg:p-10 mx-auto max-w-lg text-center rounded-3xl border-2 border-indigo-600 shadow-2xl relative transform lg:scale-105 z-10 my-4 lg:my-0">
                            <span className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] lg:text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">Più Popolare</span>
                            <h3 className="mb-4 text-xl lg:text-2xl font-bold dark:text-white">Premium</h3>
                            <p className="font-light text-gray-500 text-sm lg:text-lg dark:text-gray-400">Per professionisti che vogliono massimizzare le visite.</p>
                            <div className="flex justify-center items-baseline my-8 lg:my-10">
                                <span className="mr-2 text-5xl lg:text-6xl font-extrabold text-gradient">19€</span>
                                <span className="text-indigo-600 dark:text-indigo-400 font-bold">/mese</span>
                            </div>
                            <ul className="mb-8 lg:mb-10 space-y-4 lg:space-y-5 text-left">
                                <li className="flex items-center space-x-3 text-gray-600 dark:text-gray-300 text-sm lg:text-base">
                                    <svg className="flex-shrink-0 w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                                    <span>Tutto quello che c'è in Standard</span>
                                </li>
                                <li className="flex items-center space-x-3 text-gray-900 dark:text-white font-bold text-sm lg:text-base">
                                    <svg className="flex-shrink-0 w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                                    <span>Dominio Personalizzato .it/.com</span>
                                </li>
                                <li className="flex items-center space-x-3 text-gray-600 dark:text-gray-300 text-sm lg:text-base">
                                    <svg className="flex-shrink-0 w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                                    <span>Tracking Analytics LinkedIn</span>
                                </li>
                            </ul>
                            <button
                                onClick={() => handleContactClick('Premium Plan')}
                                className="btn-primary-gradient w-full py-3 lg:py-4 px-6 text-sm">
                                Diventa Premium
                            </button>
                        </div>

                        {/* Piano Executive */}
                        <div className="flex flex-col p-6 lg:p-10 mx-auto max-w-lg text-center text-gray-900 bg-gray-50 dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 transition-all hover:shadow-2xl">
                            <h3 className="mb-4 text-xl lg:text-2xl font-bold">Executive</h3>
                            <p className="font-light text-gray-500 text-sm lg:text-lg dark:text-gray-400 tracking-tight leading-relaxed text-sm">Personal branding strategico per Senior Leader.</p>
                            <div className="flex justify-center items-baseline my-8 lg:my-10">
                                <span className="mr-2 text-5xl lg:text-6xl font-extrabold">49€</span>
                                <span className="text-gray-500 dark:text-gray-400 font-medium">/mese</span>
                            </div>
                            <ul className="mb-8 lg:mb-10 space-y-4 lg:space-y-5 text-left">
                                <li className="flex items-center space-x-3 text-gray-600 dark:text-gray-300 text-sm lg:text-base">
                                    <svg className="flex-shrink-0 w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                                    <span>Tutto quello che c'è in Premium</span>
                                </li>
                                <li className="flex items-center space-x-3 text-gray-600 dark:text-gray-300 text-sm lg:text-base">
                                    <svg className="flex-shrink-0 w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                                    <span>Content Strategy Focalizzata</span>
                                </li>
                                <li className="flex items-center space-x-3 text-gray-600 dark:text-gray-300 text-sm lg:text-base">
                                    <svg className="flex-shrink-0 w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                                    <span>Supporto 1-to-1 Prioritario</span>
                                </li>
                            </ul>
                            <button
                                onClick={() => handleCheckout('price_executive_id')}
                                className="w-full py-3 lg:py-4 px-6 text-sm font-bold text-gray-900 bg-white border-2 border-gray-200 rounded-2xl hover:bg-gray-100 transition-all dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600">
                                Scegli Executive
                            </button>
                        </div>
                    </div>
                </div>
            </section>
            <ContactForm planName={selectedPlan} onFormSubmit={() => setSelectedPlan('')} />
        </>
    );
};

export default Pricing;