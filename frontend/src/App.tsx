import { Navbar, Footer } from "./layout";
import { Welcome, Preview, About, Statistics, Testimonials, ContactForm, Feature, Pricing } from "./pages";

function App() {
  return (
    <>
      <Navbar />
      <Welcome />
      <Preview />
      <About />
      <Feature />
      <Pricing />
      <Statistics />
      <Testimonials />
      <ContactForm />
      <Footer />
    </>
  );
}

export default App;
