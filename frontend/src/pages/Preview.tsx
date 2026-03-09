import React from 'react';

interface PreviewProps {
  initialData?: any;
  isPublicView?: boolean;
}

const Preview: React.FC<PreviewProps> = ({ initialData, isPublicView }) => {
  const data = initialData || {
    personal_info: { name: "Il Tuo Nome", title: "La Tua Professione" },
    summary: "Dimentica l'invio di vecchi file PDF. Con la nostra piattaforma, il tuo profilo professionale è una Single Page Application moderna sul tuo dominio."
  };

  return (
    <section className="relative py-16 lg:py-24 overflow-hidden dark:bg-gray-900/50">
      <div className="mx-auto max-w-screen-xl items-center gap-16 px-4 lg:grid lg:grid-cols-2 lg:px-6">
        <div className="relative group order-2 lg:order-1">
          <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="glass-card relative p-6 lg:p-10 rounded-2xl min-h-[350px] lg:min-h-[450px] transform transition-all duration-500 lg:hover:-translate-y-2">
             {/* Mock CV Rendering */}
             <div className="border-b border-gray-200/50 dark:border-gray-700/50 pb-4 lg:pb-6 mb-4 lg:mb-6">
                <div className="flex items-center gap-3 lg:gap-4 mb-4">
                  <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500"></div>
                  <div>
                    <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white leading-tight">{data.personal_info?.name}</h3>
                    <p className="text-indigo-600 dark:text-indigo-400 font-medium tracking-wide uppercase text-[10px] lg:text-xs">{data.personal_info?.title}</p>
                  </div>
                </div>
             </div>
             <div className="text-gray-600 dark:text-gray-300">
                <p className="leading-relaxed text-sm lg:text-base">{data.summary}</p>
             </div>
             <div className="mt-8 lg:mt-10 space-y-3 lg:space-y-4">
                <div className="h-2.5 bg-gray-200/50 dark:bg-gray-700/50 rounded-full w-full"></div>
                <div className="h-2.5 bg-gray-200/50 dark:bg-gray-700/50 rounded-full w-5/6"></div>
                <div className="h-2.5 bg-gray-200/50 dark:bg-gray-700/50 rounded-full w-4/6"></div>
                <div className="grid grid-cols-3 gap-3 lg:gap-4 mt-4 lg:mt-6">
                   <div className="h-1.5 bg-indigo-500/20 rounded-full"></div>
                   <div className="h-1.5 bg-purple-500/20 rounded-full"></div>
                   <div className="h-1.5 bg-pink-500/20 rounded-full"></div>
                </div>
             </div>
          </div>
        </div>
        <div className="mt-8 lg:mt-0 order-1 lg:order-2">
          <div className="inline-block px-3 py-1 mb-4 text-[10px] lg:text-xs font-semibold tracking-wider text-indigo-600 uppercase bg-indigo-100 rounded-full dark:bg-indigo-900/30 dark:text-indigo-400">
            Interactive Experience
          </div>
          <h2 className="mb-6 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white lg:text-5xl leading-tight">
            Il tuo CV, <span className="text-gradient">sempre online</span>.
          </h2>
          {!isPublicView && (
            <div className="mb-6 lg:mb-8 p-4 border-l-4 border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 rounded-r-lg">
              <p className="font-medium text-gray-700 dark:text-gray-300 italic text-base lg:text-lg leading-relaxed">
                "Ho inserito il link del mio CV digitale su LinkedIn e ho ricevuto il 40% di visite in più."
              </p>
              <footer className="mt-2 text-xs lg:text-sm text-indigo-600 dark:text-indigo-400 font-bold">— Marco G., Senior Developer</footer>
            </div>
          )}
          <p className="mb-8 text-base lg:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            {isPublicView 
              ? `Esplora il profilo professionale di ${data.personal_info?.name} in un formato web moderno e veloce.`
              : "Basta inviare PDF pesanti. Nordevit trasforma il tuo curriculum in una **Single Page Application** velocissima."}
          </p>
          {!isPublicView && (
            <div className="flex flex-wrap gap-4">
              <a
                href="#price"
                className="inline-flex items-center px-5 py-2.5 lg:px-6 lg:py-3 text-sm lg:text-base font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
              >
                Scopri i Piani
                <svg className="ml-2 w-4 h-4 lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Preview;
