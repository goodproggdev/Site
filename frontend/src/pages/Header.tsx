import React, { useState } from 'react';
import { Navbar, Button } from 'flowbite-react';

const Header: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark', darkMode);
  };

  return (
    <Navbar fluid={true} rounded={true} className="navbar-gradient p-4 shadow-xl">
      <Navbar.Brand href="/">
        <img
          src="/path/to/logo.svg"
          className="mr-3 h-6 sm:h-9 glow-logo"
          alt="Logo"
        />
        <span className="self-center text-xl font-semibold text-white dark:text-white">
          Nome del Sito
        </span>
      </Navbar.Brand>
      <Navbar.Toggle />
      <Navbar.Collapse>
        <Navbar.Link href="/" active={true} className="text-white hover:text-yellow-400">
          Home
        </Navbar.Link>
        <Navbar.Link href="/about" className="text-white hover:text-yellow-400">
          Aboutgrhtejryw
        </Navbar.Link>
        <Navbar.Link href="/services" className="text-white hover:text-yellow-400">
          Services
        </Navbar.Link>
        <Navbar.Link href="/contact" className="text-white hover:text-yellow-400">
          Contact
        </Navbar.Link>
        <Button onClick={toggleDarkMode} className="text-white bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:bg-gradient-to-l hover:from-yellow-300 hover:via-orange-400 hover:to-red-400 transition duration-300">
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </Button>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Header;
