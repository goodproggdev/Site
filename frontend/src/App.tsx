
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
      <Footer />
    </>
  );
}

export default App;
