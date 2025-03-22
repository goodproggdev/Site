import ContactForm from './ContactForm';
import React, { useState } from 'react';

const Pricing = () => {
    const [selectedPlan, setSelectedPlan] = useState<string>('');

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
            <section id="price" className="bg-gray-50 dark:bg-gray-900 py-16">
                <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
                    <div className="mx-auto text-center mb-8">
                        <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">
                            <span className="text-red-600">Packs</span> Pricing
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Card Vetrina */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Sito Vetrina</h3>
                            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                750€
                            </div>
                            <ul className="space-y-3 mb-8">
                                <li className="flex justify-between text-gray-500 dark:text-gray-400">
                                    1 <span className="text-gray-900 dark:text-gray-300">Progetto</span>
                                </li>
                                <li className="flex justify-between text-gray-500 dark:text-gray-400">
                                    10GB <span className="text-gray-900 dark:text-gray-300">Storage</span>
                                </li>
                                <li className="flex justify-between text-gray-500 dark:text-gray-400">
                                    1 <span className="text-gray-900 dark:text-gray-300">Dominio</span>
                                </li>
                                <li className="flex justify-between text-gray-500 dark:text-gray-400">
                                    1 <span className="text-gray-900 dark:text-gray-300">Utente</span>
                                </li>
                            </ul>
                            <button 
                                onClick={() => handleContactClick('Pack 1')}
                                className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg focus:ring-4 focus:ring-red-200 dark:bg-red-700 dark:hover:bg-red-800 dark:focus:ring-red-900">
                                Parliamone!
                            </button>
                        </div>

                        {/* Card eCommerce */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">eCommerce</h3>
                            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                1600€
                            </div>
                            <ul className="space-y-3 mb-8">
                                <li className="flex justify-between text-gray-500 dark:text-gray-400">
                                    2 <span className="text-gray-900 dark:text-gray-300">Progetti</span>
                                </li>
                                <li className="flex justify-between text-gray-500 dark:text-gray-400">
                                    50GB <span className="text-gray-900 dark:text-gray-300">Storage</span>
                                </li>
                                <li className="flex justify-between text-gray-500 dark:text-gray-400">
                                    1 <span className="text-gray-900 dark:text-gray-300">Dominio</span>
                                </li>
                                <li className="flex justify-between text-gray-500 dark:text-gray-400">
                                    3 <span className="text-gray-900 dark:text-gray-300">Utenti</span>
                                </li>
                            </ul>
                            <button
                                onClick={() => handleContactClick('Pack 2')}
                                className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg focus:ring-4 focus:ring-red-200 dark:bg-red-700 dark:hover:bg-red-800 dark:focus:ring-red-900">
                                Parliamone!
                            </button>
                        </div>

                        {/* Card Web App */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 border-red-600 transform scale-105">
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Web App</h3>
                                <div className="text-3xl font-bold text-red-600 mb-4">
                                    3000€
                                </div>
                                <ul className="space-y-3 mb-8">
                                    <li className="flex justify-between text-gray-500 dark:text-gray-400">
                                        4 <span className="text-gray-900 dark:text-gray-300">Progetti</span>
                                    </li>
                                    <li className="flex justify-between text-gray-500 dark:text-gray-400">
                                        50GB <span className="text-gray-900 dark:text-gray-300">Storage</span>
                                    </li>
                                    <li className="flex justify-between text-gray-500 dark:text-gray-400">
                                        2 <span className="text-gray-900 dark:text-gray-300">Domini</span>
                                    </li>
                                    <li className="flex justify-between text-gray-500 dark:text-gray-400">
                                        10 <span className="text-gray-900 dark:text-gray-300">Utenti</span>
                                    </li>
                                </ul>
                                <button 
                                    onClick={() => handleContactClick('Pack 3')}
                                    className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg focus:ring-4 focus:ring-red-200 dark:bg-red-700 dark:hover:bg-red-800 dark:focus:ring-red-900">
                                    Parliamone!
                                </button>
                            </div>
                        </div>

                        {/* Card Gestionale */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Gestionale</h3>
                            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                5000€
                            </div>
                            <ul className="space-y-3 mb-8">
                                <li className="flex justify-between text-gray-500 dark:text-gray-400">
                                    10 <span className="text-gray-900 dark:text-gray-300">Progetti</span>
                                </li>
                                <li className="flex justify-between text-gray-500 dark:text-gray-400">
                                    1000GB <span className="text-gray-900 dark:text-gray-300">Storage</span>
                                </li>
                                <li className="flex justify-between text-gray-500 dark:text-gray-400">
                                    3 <span className="text-gray-900 dark:text-gray-300">Domini</span>
                                </li>
                                <li className="flex justify-between text-gray-500 dark:text-gray-400">
                                    Unlimited <span className="text-gray-900 dark:text-gray-300">Utenti</span>
                                </li>
                            </ul>
                            <button
                                onClick={() => handleContactClick('Pack 4')}
                                className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg focus:ring-4 focus:ring-red-200 dark:bg-red-700 dark:hover:bg-red-800 dark:focus:ring-red-900">
                                Parliamone!
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