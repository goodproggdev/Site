const About = () => {
	return(
		<section id="about" className="bg-gray-50/50 dark:bg-gray-900 shadow-inner py-16 lg:py-20">
			<div className="gap-12 items-center px-4 mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 lg:px-6">
				<div className="font-light text-gray-600 sm:text-lg dark:text-gray-400">
          <div className="inline-block px-3 py-1 mb-4 text-[10px] lg:text-xs font-semibold tracking-wider text-purple-600 uppercase bg-purple-100 rounded-full dark:bg-purple-900/30 dark:text-purple-400">
            Expertly Crafted
          </div>
					<h2 className="mb-6 text-3xl tracking-tight font-extrabold text-gray-900 dark:text-white lg:text-5xl leading-tight">Cattura l’attenzione dei <span className="text-gradient">Recruiter</span></h2>
					<p className="mb-6 leading-relaxed text-sm lg:text-base">I recruiter dedicano pochissimo tempo a ogni profilo LinkedIn. Il nostro generatore automatico crea un CV professionale e immediatamente leggibile che ti fa distinguere dalla massa.</p>
					<p className="leading-relaxed font-medium text-gray-900 dark:text-white border-l-4 border-purple-500 pl-4 text-sm lg:text-base">È un metodo efficace per differenziarsi: chi riceve il tuo CV vede subito le tue competenze chiave in un formato chiaro e moderno.</p>
				</div>
				<div className="mt-10 lg:mt-0 relative flex justify-center">
          <div className="absolute -inset-4 bg-purple-500/10 rounded-full blur-3xl"></div>
					<img className="relative w-4/5 lg:w-full rounded-2xl shadow-2xl transform lg:rotate-2 hover:rotate-0 transition-transform duration-500 border border-gray-200 dark:border-gray-800" src="/logo-nordev.png" alt="Nordevit Brand" />
				</div>
			</div>
		</section>
	);
};

export default About;