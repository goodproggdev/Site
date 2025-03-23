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
      <Statistics />
      <Testimonials />
      <Pricing />
      <Footer />
    </>
  );
}

export default App;
