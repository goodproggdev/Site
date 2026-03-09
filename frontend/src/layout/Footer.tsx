import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
            <div className="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
                <div className="md:flex md:justify-between">
                    <div className="mb-6 md:mb-0">
                        <a href="https://nordevit.it/" className="flex items-center">
                            <span className="self-center text-2xl font-bold whitespace-nowrap dark:text-white text-indigo-600">NORDEVIT</span>
                        </a>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                            Soluzioni digitali per professionisti che vogliono scalare la propria carriera su LinkedIn.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-2">
                        <div>
                            <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">Piattaforma</h2>
                            <ul className="text-gray-500 dark:text-gray-400 font-medium">
                                <li className="mb-4">
                                    <a href="/" className="hover:underline">Home</a>
                                </li>
                                <li>
                                <a href="#price" className="hover:underline">Pricing</a>
                            </li>
                            <li className="mt-4">
                                <a href="#contact" className="hover:underline">Contatti</a>
                            </li>
                            </ul>
                        </div>
                        <div>
                            <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">Legal</h2>
                            <ul className="text-gray-500 dark:text-gray-400 font-medium">
                                <li className="mb-4">
                                    <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
                                </li>
                                <li>
                                    <Link to="/terms" className="hover:underline">Terms &amp; Conditions</Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
                <div className="sm:flex sm:items-center sm:justify-between">
                    <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">© 2024 <a href="https://nordevit.it/" className="hover:underline font-bold">Nordevit™</a>. All Rights Reserved.
                    </span>
                    <div className="flex mt-4 sm:justify-center sm:mt-0">
                        <a href="https://linkedin.com/" className="text-gray-500 hover:text-indigo-600 transition-colors">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-1.337-.025-3.041-1.852-3.041-1.854 0-2.138 1.45-2.138 2.944v5.701h-3v-11h2.88v1.503h.04c.401-.759 1.381-1.56 2.839-1.56 3.039 0 3.601 2.001 3.601 4.603v6.457z" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;