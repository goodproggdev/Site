import React from 'react';
import Welcome from './Welcome';
import Preview from './Preview';
import About from './About';
import Feature from './Feature';
import Statistics from './Statistics';
import Testimonials from './Testimonials';
import Pricing from './Pricing';
import ContactForm from './ContactForm';

interface HomeProps {
  initialData?: any;
  isPublicView?: boolean;
}

const Home: React.FC<HomeProps> = ({ initialData, isPublicView = false }) => {
  return (
    <>
      <Welcome />
      {/* Se è una public view, passiamo initialData a Preview per mostrare il CV specifico */}
      <Preview initialData={initialData} isPublicView={isPublicView} />
      {!isPublicView && (
        <>
          <About />
          <Feature />
          <Statistics />
          <Testimonials />
          <Pricing />
          <ContactForm planName="" onFormSubmit={() => {}} />
        </>
      )}
    </>
  );
};

export default Home;
