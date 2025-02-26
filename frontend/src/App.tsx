import { DarkThemeToggle } from "flowbite-react";
import { Navbar, Footer } from "./layout";
import { Welcome, Preview, About, Statistics, Testimonials, ContactForm, Feature } from "./pages";

function App() {
  return (
    <>
    <Navbar />
    <Welcome />
    <Preview />
    <About />
    <Feature />
    <Statistics />
    <Testimonials />
    <ContactForm />
    <main className="flex min-h-screen items-center justify-center gap-2 dark:bg-gray-800">
      <h1 className="text-2xl dark:text-white">Flowbite React + Vite</h1>
      <DarkThemeToggle />      
    </main>
    <Footer />
    </>
  );
}

export default App;
