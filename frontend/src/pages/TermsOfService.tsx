import React from 'react';

const TermsOfService: React.FC = () => {
    return (
        <div className="bg-white dark:bg-gray-900 min-h-screen py-24">
            <div className="container mx-auto px-4 max-w-screen-md">
                <h1 className="text-4xl font-extrabold mb-8 text-gray-900 dark:text-white">Termini di Servizio</h1>
                <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 space-y-6">
                    <p>Ultimo aggiornamento: 9 Marzo 2026</p>
                    
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">1. Oggetto</h2>
                        <p>Nordevit fornisce una piattaforma per l'hosting e la gestione di CV digitali professionali.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">2. Account Utente</h2>
                        <p>L'utente è responsabile della custodia delle proprie credenziali e dell'accuratezza delle informazioni fornite nel proprio CV.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">3. Abbonamenti e Pagamenti</h2>
                        <p>I servizi Premium sono soggetti al pagamento di un canone mensile tramite Stripe. Il mancato pagamento può comportare la sospensione dell'hosting del CV.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">4. Limitazione di Responsabilità</h2>
                        <p>Site non è responsabile per la perdita di dati o per l'uso improprio della piattaforma da parte degli utenti.</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
