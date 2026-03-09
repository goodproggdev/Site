import { Button, Spinner } from 'flowbite-react';
import React, { useState } from 'react';
import { useCVUpload } from '../hooks/useCVUpload';

const HeroSection: React.FC = () => {
  const { upload, state, error, progress } = useCVUpload();
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file: File) => {
    upload(file).then(() => {
      if (state === 'success') {
        // In produzione qui reindirizzeresti alla pagina di preview/editor
        console.log("Upload riuscito! Reindirizzamento...");
      }
    });
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <section id="Home" className="relative overflow-hidden bg-white py-16 dark:bg-gray-900 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-12 lg:flex-row">
          <div className="z-10 w-full text-center lg:w-1/2 lg:text-left">
            <div className="mb-4 inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              <span className="mr-2 h-2 w-2 rounded-full bg-indigo-600"></span>
              LinkedIn-Ready Digital CV
            </div>
            <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
              La tua <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Identità Digitale</span>, in un unico Link.
            </h1>
            <p className="mb-8 text-lg font-light text-gray-500 dark:text-gray-400 lg:text-xl">
              Non limitarti a un PDF statico. Trasforma la tua carriera con un CV digitale moderno, interattivo e ottimizzato per il tuo profilo LinkedIn. Hosting premium incluso.
            </p>
            
            {/* Quick Upload Area */}
            <div 
              className={`relative mb-8 p-8 border-2 border-dashed rounded-2xl transition-all ${
                dragActive ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={onDrop}
            >
              {state === 'uploading' ? (
                <div className="text-center py-4">
                  <Spinner size="xl" className="mb-4" />
                  <p className="text-indigo-600 font-bold">Analisi CV in corso... {progress}%</p>
                </div>
              ) : (
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mb-2 text-gray-900 dark:text-white font-semibold">Trascina qui il tuo CV (PDF, DOCX)</p>
                  <p className="text-sm text-gray-500 mb-4">Inizia a creare il tuo link professionale in 3 secondi</p>
                  <input 
                    type="file" 
                    id="hero-upload" 
                    className="hidden" 
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  />
                  <label 
                    htmlFor="hero-upload" 
                    className="cursor-pointer bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-lg font-bold hover:bg-indigo-200 transition-colors"
                  >
                    Seleziona File
                  </label>
                </div>
              )}
              {error && <p className="mt-4 text-red-500 text-sm font-medium">❌ {error}</p>}
            </div>

            <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 items-center justify-center lg:justify-start">
              <Button 
                gradientDuoTone="purpleToBlue" 
                size="xl" 
                className="px-8 font-bold shadow-lg shadow-indigo-200 dark:shadow-none"
              >
                Scopri Tutti i Piani
              </Button>
            </div>
          </div>
          
          <div className="relative hidden w-full lg:block lg:w-1/2">
             <div className="absolute -left-4 -top-4 h-72 w-72 animate-pulse rounded-full bg-purple-300 opacity-20 blur-3xl dark:bg-purple-900"></div>
             <div className="absolute -bottom-4 -right-4 h-72 w-72 animate-pulse rounded-full bg-indigo-300 opacity-20 blur-3xl dark:bg-indigo-900"></div>
             <img 
               src="/logo-nordev.png" 
               alt="Nordevit Logo" 
               className="relative z-10 w-full max-w-md mx-auto transform transition-all hover:scale-105 drop-shadow-2xl" 
             />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

