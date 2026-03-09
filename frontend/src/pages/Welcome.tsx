import ModalUpload from "./Upload";
import cv from "../assets/testCV.jpg";

const Welcome = () => {
  return (
    <section className="relative overflow-hidden mesh-gradient py-12 lg:py-32">
      {/* Overlay per migliorare la leggibilità su mesh-gradient se necessario */}
      <div className="absolute inset-0 bg-white/40 dark:bg-black/20 pointer-events-none"></div>
      
      <div className="relative mx-auto grid max-w-screen-xl px-4 lg:grid-cols-12 lg:gap-8 xl:gap-0">
        <div className="mr-auto place-self-center lg:col-span-7 mb-8 lg:mb-0">
          <div className="mb-4 inline-flex items-center rounded-full bg-indigo-100/50 dark:bg-indigo-900/30 px-3 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300 backdrop-blur-sm border border-indigo-200/50 dark:border-indigo-800/50">
            <span className="mr-2 h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
            Elevate Your Career
          </div>
          <h1 className="mb-6 max-w-2xl text-4xl font-extrabold leading-tight tracking-tight lg:text-7xl dark:text-white">
            La tua <span className="text-gradient">Identità Digitale</span>, in un unico Link.
          </h1>
          <p className="mb-8 max-w-2xl font-light text-gray-700 dark:text-gray-300 text-base md:text-lg lg:mb-10 lg:text-xl leading-relaxed">
            Non limitarti a un PDF statico. Trasforma la tua carriera con un CV digitale moderno, interattivo e ottimizzato per il tuo profilo LinkedIn.
          </p>
          
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <a
              href="#price"
              className="btn-primary-gradient inline-flex items-center justify-center text-sm lg:text-base py-3 lg:py-4"
            >
              Inizia ora
              <svg
                className="-mr-1 ml-2 h-5 w-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </a>
            <ModalUpload />
          </div>
        </div>
        <div className="lg:col-span-5 lg:mt-0 flex items-center justify-center">
          <div className="relative group animate-float">
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <img
              src={cv}
              alt="CV Mockup"
              className="relative h-64 w-64 md:h-80 md:w-80 lg:h-[450px] lg:w-[450px] rounded-3xl object-cover shadow-2xl border-4 border-white/20 dark:border-gray-800/50 transform rotate-3 lg:hover:rotate-0 transition-transform duration-500"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Welcome;
