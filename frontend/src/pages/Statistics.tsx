const Statistics = () => {
    return(
        <section className="relative py-16 lg:py-24 mesh-gradient overflow-hidden">
          <div className="absolute inset-0 bg-indigo-900/10 dark:bg-black/40 pointer-events-none"></div>
          <div className="relative max-w-screen-xl px-4 mx-auto text-center lg:px-6">
              <dl className="grid max-w-screen-lg gap-6 mx-auto text-gray-900 grid-cols-1 md:grid-cols-3 dark:text-white">
                  <div className="glass-card flex flex-col items-center justify-center p-8 lg:p-12 rounded-3xl transform transition-transform hover:scale-105">
                      <dt className="mb-2 text-4xl lg:text-6xl font-extrabold text-gradient">73M+</dt>
                      <dd className="text-sm lg:text-lg font-medium text-gray-600 dark:text-gray-300 uppercase tracking-widest">Developers</dd>
                  </div>
                  <div className="glass-card flex flex-col items-center justify-center p-8 lg:p-12 rounded-3xl transform transition-transform hover:scale-105">
                      <dt className="mb-2 text-4xl lg:text-6xl font-extrabold text-gradient">1B+</dt>
                      <dd className="text-sm lg:text-lg font-medium text-gray-600 dark:text-gray-300 uppercase tracking-widest">Profile Views</dd>
                  </div>
                  <div className="glass-card flex flex-col items-center justify-center p-8 lg:p-12 rounded-3xl transform transition-transform hover:scale-105">
                      <dt className="mb-2 text-4xl lg:text-6xl font-extrabold text-gradient">4M+</dt>
                      <dd className="text-sm lg:text-lg font-medium text-gray-600 dark:text-gray-300 uppercase tracking-widest">Premium CVs</dd>
                  </div>
              </dl>
          </div>
        </section>
    );
};

export default Statistics;