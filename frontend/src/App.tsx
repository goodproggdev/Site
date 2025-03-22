import { Navbar, Footer } from "./layout";
import { Welcome, Preview, About, Statistics, Testimonials, Feature, Pricing } from "./pages";

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
      <Footer />
    </>
  );
}

export default App;
