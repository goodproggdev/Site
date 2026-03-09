import React from 'react';

const PrivacyPolicy: React.FC = () => {
    return (
        <div className="bg-white dark:bg-gray-900 min-h-screen py-24">
            <div className="container mx-auto px-4 max-w-screen-md">
                <h1 className="text-4xl font-extrabold mb-8 text-gray-900 dark:text-white">Privacy Policy</h1>
                <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 space-y-6">
                    <p>Ultimo aggiornamento: 9 Marzo 2026</p>
                    
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">1. Informazioni Generali</h2>
                        <p>Il presente documento descrive le modalità di trattamento dei dati personali degli utenti che consultano la piattaforma Nordevit (di seguito, "la Piattaforma").</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">2. Dati Trattati</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Dati di navigazione (indirizzo IP, tipo di browser, ecc.)</li>
                            <li>Dati forniti volontariamente dall'utente (email, file CV caricati per il parsing)</li>
                            <li>Dati di pagamento (gestiti in modo sicuro tramite Stripe)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">3. Finalità del Trattamento</h2>
                        <p>I dati vengono raccolti per fornire il servizio di generazione CV, gestire i pagamenti e analytics anonime.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">4. Diritti dell'interessato</h2>
                        <p>Ai sensi del GDPR, ogni utente ha il diritto di accedere, rettificare o cancellare i propri dati personali in qualsiasi momento inviando una mail a privacy@nordevit.it.</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
