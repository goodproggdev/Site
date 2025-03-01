import React, { useState } from 'react';
import { Flowbite, Modal, TextInput, Button, DarkThemeToggle } from 'flowbite-react';

const Navbar: React.FC = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  const openLoginModal = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoginOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginOpen(false);
  };

  const openSignupModal = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSignupOpen(true);
  };

  const closeSignupModal = () => {
    setIsSignupOpen(false);
  };

  return (
    <Flowbite>
      <nav className="bg-white border-gray-200 dark:bg-gray-900">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <a href="https://flowbite.com/" className="flex items-center space-x-3 rtl:space-x-reverse">
            <img src="https://flowbite.com/docs/images/logo.svg" className="h-8" alt="Flowbite Logo" />
            <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Flowbite</span>
          </a>
          <div className="flex items-center ml-auto space-x-4">
            <DarkThemeToggle />
            <button
              data-collapse-toggle="navbar-default"
              type="button"
              className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
              aria-controls="navbar-default"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
              </svg>
            </button>
            <div className="hidden w-full md:block md:w-auto" id="navbar-default">
              <div className="flex md:flex-row space-x-8 rtl:space-x-reverse">
                <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
                  <li>
                    <a href="#Home" className="block py-2 px-3 text-white bg-blue-700 rounded-sm md:bg-transparent md:text-blue-700 md:p-0 dark:text-white md:dark:text-blue-500" aria-current="page">Home</a>
                  </li>
                  <li>
                    <a href="#about" className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">About</a>
                  </li>
                  <li>
                    <a href="#services" className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">Services</a>
                  </li>
                  <li>
                    <a href="#pricing" className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">Pricing</a>
                  </li>
                  <li>
                    <a href="#contact" className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">Contact</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700 ml-auto">
            <li>
              <a href="#" onClick={openLoginModal} className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">
                Login
              </a>
            </li>
            <li>
              <a href="#" onClick={openSignupModal} className="block py-2 px-3 text-white bg-blue-700 rounded-sm md:bg-transparent md:text-blue-700 md:p-0 dark:text-white md:dark:text-blue-500">
                Sign up
              </a>
            </li>
          </ul>
        </div>
      </nav>

      <Modal show={isLoginOpen} onClose={closeLoginModal} size="sm">
        <Modal.Header>Login</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <TextInput id="login-email" type="email" placeholder="Your email" required />
            <TextInput id="login-password" type="password" placeholder="Your password" required />
          </div>
          <div className="mt-2 text-center">
            <a href="/reset-password" className="text-sm text-blue-500 hover:underline">Forgot your password?</a>
          </div>
      </Modal.Body>

        <Modal.Footer>
          <Button onClick={closeLoginModal} color="gray">Close</Button>
          <Button>Login</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={isSignupOpen} onClose={closeSignupModal} size="sm">
        <Modal.Header>Sign Up</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <TextInput id="signup-email" type="email" placeholder="Your email" required />
            <TextInput id="signup-password" type="password" placeholder="Your password" required />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={closeSignupModal} color="gray">Close</Button>
          <Button>Sign Up</Button>
        </Modal.Footer>
      </Modal>

      <style>
        {`
          html {
            scroll-behavior: smooth;
          }
        `}
      </style>
    </Flowbite>
  );
};

export default Navbar;
