import { useState } from "react";
import { Button, Modal } from "flowbite-react";

// Definisci la struttura JSON originale come una costante
const originalJsonStructure = {
	"name": "", // Sarà popolato dal form
	"presentation": "", // Sarà popolato dal form
	"header_mono_subtitle": "", // Sarà popolato dal form
	"print_resume": "", // Sarà popolato dal form
	"download_my_cv": "", // Sarà popolato dal form
	"social_links": { // Oggetto nidificato - non popolato dal form semplice
		"facebook": "#",
		"twitter": "#",
		"instagram": "#",
		"github": "#"
	},
	"my_resume_label": { // Oggetto nidificato - non popolato dal form semplice
		"my": "My",
		"resume": "Resume"
	},
	"who_am_i": "", // Sarà popolato dal form
	"about": { // Oggetto nidificato - non popolato dal form semplice
		"who": "Mi occupo di Backend per gestsionali aziendali, Sviluppo eCommerce e Integrazione per sistemi Regionali, Ministeroiali ed Europei",
		"details": "Lavoro a stretto contatto con piccole imprese per farle crescere sul mercato internazionale, tramite gestionali ed eCommerce. Inoltre faccio capo al governo europeo e italiano per permettere la condivisione dati tra i vari Paesi Membri dell'Europa"
	},
	"personal_info": { // Oggetto nidificato - non popolato dal form semplice
		"birthdate": "23/03/1999",
		"work_email": "sitiegestionali@gmail.com",
		"personal_email": "sitiegestionali@gmail.com",
		"work_number": "+ (39) 3517287336",
		"instagram": "enricobaldasso"
	},
	"skills_label": "", // Sarà popolato dal form
	"skills": [ // Array di oggetti - non popolato dal form semplice
		{
			"name": "C",
			"level": "97%"
		}
		// ... altri skill (struttura originale)
	],
	"languages_label": "", // Sarà popolato dal form
	"languages": [ // Array di oggetti - non popolato dal form semplice
		{
			"name": "Italiano",
			"level": "100%"
		}
		// ... altre lingue (struttura originale)
	],
	"personal_info_label": "", // Sarà popolato dal form
	"my_expertise_label": "", // Sarà popolato dal form
	"expertise_list": [], // Array di oggetti - non popolato dal form semplice
	"education_label": "", // Sarà popolato dal form
	"education_list": [], // Array di oggetti - non popolato dal form semplice
	"work_experience_label": "", // Sarà popolato dal form
	"work_experience_list": [], // Array di oggetti - non popolato dal form semplice
	"statistics": [], // Array di oggetti - non popolato dal form semplice
	"my_service_label": "", // Sarà popolato dal form
	"services": [], // Array di oggetti - non popolato dal form semplice
	"contact_label": "", // Sarà popolato dal form
	"pricing_packs_label": "", // Sarà popolato dal form
	"pricing_packs": [], // Array di oggetti - non popolato dal form semplice
	"freelancing_label": "", // Sarà popolato dal form
	"hire_me_label": "", // Sarà popolato dal form
	"my_portfolio_label": "", // Sarà popolato dal form
    // Ho incluso solo i primi due elementi per semplificare l'esempio nel form
	"portfolio_items": [
		{
			"title": "Pircher", // Mantiene valore originale
			"subtitle": "Cliente Gestionale", // Mantiene valore originale
			"image": "static/assets/imgs/Pircher.jpg", // Sarà popolato dal form con il nome del file
			"alt": "https://www.pircher.eu/it/" // Mantiene valore originale
		},
		{
			"title": "Maddalena Spa", // Mantiene valore originale
			"subtitle": "Cliente Gestionale", // Mantiene valore originale
			"image": "static/assets/imgs/maddalena02.jpg", // Sarà popolato dal form con il nome del file
			"alt": "https://www.maddalena.it/" // Mantiene valore originale
		}
        // ... altri portfolio_items originali (la struttura completa sarà copiata)
	],
	"latest_label": "", // Sarà popolato dal form
	"news_label": "", // Sarà popolato dal form
    // Ho incluso solo i primi due elementi per semplificare l'esempio nel form
	"blog_posts": [
		{
			"title": "Tecnico per Bruxells - Projectathon Europeo", // Mantiene valore originale
			"author": "Admin", // Mantiene valore originale
			"likes_html": "", // Mantiene valore originale
			"comments_html": "", // Mantiene valore originale
			"image": "static/assets/imgs/EU01.jpg", // Sarà popolato dal form con il nome del file
			"alt": "https://interoperable-europe.ec.europa.eu/collection/digital-building-blocks/solution/once-only-technical-system-oots", // Mantiene valore originale
			"description": "Progetti chiave dell'Unione Europea per la semplificazione dell'accesso e dell'uso dei servizi pubblici", // Mantiene valore originale
			"full_description": "Ho contribuito attivamente...", // Mantiene valore originale
			"read_more_url": "https://interoperable-europe.ec.europa.eu/collection/digital-building-blocks/solution/once-only-technical-system-oots" // Mantiene valore originale
		},
		{
			"title": "Certificato IBM in Data Science", // Mantiene valore originale
			"author": "Admin", // Mantiene valore originale
			"likes_html": "", // Mantiene valore originale
			"comments_html": "", // Mantiene valore originale
			"image": "static/assets/imgs/Certi01.jpg", // Sarà popolato dal form con il nome del file
			"alt": "https://coursera.org/share/67a906a955411b3c4e85a8be587c848a", // Mantiene valore originale
			"description": "Corso completo IBM in Data Science", // Mantiene valore originale
			"full_description": "In questo certificato professionale...", // Mantiene valore originale
			"read_more_url": "https://coursera.org/share/67a906a955411b3c4e85a8be587c848a" // Mantiene valore originale
		}
        // ... altri blog_posts originali (la struttura completa sarà copiata)
	],
	"form_title": "", // Sarà popolato dal form
	"form_placeholder_name": "", // Sarà popolato dal form
	"form_placeholder_email": "", // Sarà popolato dal form
	"form_placeholder_message": "", // Sarà popolato dal form
	"form_button_text": "", // Sarà popolato dal form
	"contact_title": "", // Sarà popolato dal form
	"phone_label": "", // Sarà popolato dal form
	"phone_number": "", // Sarà popolato dal form
	"address_label": "", // Sarà popolato dal form
	"address": "", // Sarà popolato dal form
	"email_label": "", // Sarà popolato dal form
	"email": "" // Sarà popolato dal form
};


const UploadModal = ({ isOpen, onClose }) => {
  // Stato per tenere i dati dei campi di testo del form
  const [formData, setFormData] = useState({
    name: "",
    presentation: "",
    header_mono_subtitle: "",
    print_resume: "",
    download_my_cv: "",
    who_am_i: "",
    skills_label: "",
    languages_label: "",
    personal_info_label: "",
    my_expertise_label: "",
    education_label: "",
    work_experience_label: "",
    my_service_label: "",
    contact_label: "",
    pricing_packs_label: "",
    freelancing_label: "",
    hire_me_label: "",
    my_portfolio_label: "",
    latest_label: "",
    news_label: "",
    form_title: "",
    form_placeholder_name: "",
    form_placeholder_email: "",
    form_placeholder_message: "",
    form_button_text: "",
    contact_title: "",
    phone_label: "",
    phone_number: "",
    address_label: "",
    address: "",
    email_label: "",
    email: "",
  });

  // Stato per tenere i file selezionati (per le immagini)
  const [selectedFiles, setSelectedFiles] = useState({
    portfolio_items_0_image: null, // Esempio per il primo elemento del portfolio
    portfolio_items_1_image: null, // Esempio per il secondo elemento del portfolio
    blog_posts_0_image: null, // Esempio per il primo elemento del blog
    blog_posts_1_image: null, // Esempio per il secondo elemento del blog
    // Aggiungi qui gli stati per gli altri campi immagine se necessario
  });

  // Gestisce i cambiamenti negli input di testo
  const handleTextChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: value,
    }));
  };

  // Gestisce i cambiamenti negli input di tipo file
  const handleFileChange = (e) => {
    const { id, files } = e.target;
    setSelectedFiles((prevSelectedFiles) => ({
      ...prevSelectedFiles,
      [id]: files[0], // Salva solo il primo file selezionato
    }));
  };


  // Gestisce l'invio del form e salva il JSON localmente
  const handleSubmit = (e) => {
    e.preventDefault();

    // Crea una copia profonda della struttura JSON originale
    const dataToSave = JSON.parse(JSON.stringify(originalJsonStructure));

    // Popola i campi di testo della copia con i dati dal form
    for (const key in formData) {
      if (formData.hasOwnProperty(key) && dataToSave.hasOwnProperty(key)) {
        dataToSave[key] = formData[key];
      }
    }

    // Aggiorna i percorsi delle immagini nel JSON con i nomi dei file selezionati
    // Per portfolio_items (esempio per i primi 2)
    if (dataToSave.portfolio_items && dataToSave.portfolio_items.length > 0) {
        if (selectedFiles.portfolio_items_0_image && dataToSave.portfolio_items[0]) {
            dataToSave.portfolio_items[0].image = `imgs/${selectedFiles.portfolio_items_0_image.name}`;
        }
         if (selectedFiles.portfolio_items_1_image && dataToSave.portfolio_items.length > 1 && dataToSave.portfolio_items[1]) {
            dataToSave.portfolio_items[1].image = `imgs/${selectedFiles.portfolio_items_1_image.name}`;
        }
        // Aggiungi logica simile per gli altri elementi di portfolio_items
    }

     // Per blog_posts (esempio per i primi 2)
     if (dataToSave.blog_posts && dataToSave.blog_posts.length > 0) {
        if (selectedFiles.blog_posts_0_image && dataToSave.blog_posts[0]) {
            dataToSave.blog_posts[0].image = `imgs/${selectedFiles.blog_posts_0_image.name}`;
        }
        if (selectedFiles.blog_posts_1_image && dataToSave.blog_posts.length > 1 && dataToSave.blog_posts[1]) {
            dataToSave.blog_posts[1].image = `imgs/${selectedFiles.blog_posts_1_image.name}`;
        }
        // Aggiungi logica simile per gli altri elementi di blog_posts
     }
    // Aggiungi logica simile per altri array con campi immagine


    // Converti l'oggetto JavaScript risultante in una stringa JSON formattata
    const jsonString = JSON.stringify(dataToSave, null, 2); // null, 2 per formattazione leggibile

    // *** Parte per il download del file JSON ***
    const jsonBlob = new Blob([jsonString], { type: "application/json" });
    const jsonUrl = URL.createObjectURL(jsonBlob);
    const jsonLink = document.createElement("a");
    jsonLink.href = jsonUrl;
    jsonLink.download = "dati_compilati.json"; // Nome del file JSON

    document.body.appendChild(jsonLink);
    jsonLink.click();

    setTimeout(() => {
      URL.revokeObjectURL(jsonUrl);
      document.body.removeChild(jsonLink);
    }, 100);

    // *** Spiegazione per il download delle immagini (richiede logica ZIP) ***
    console.log("File immagine selezionati:", selectedFiles);
    alert("Il file JSON è stato scaricato. Per scaricare anche le immagini in una cartella 'imgs', è necessaria una funzionalità aggiuntiva (creazione ZIP lato browser o backend).");


    // Chiudi il modal dopo aver avviato il download (opzionale)
    onClose();
  };

  return (
    <Modal show={isOpen} onClose={onClose}>
      <Modal.Header>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Popola Dati e Carica Immagini
        </h3>
      </Modal.Header>
      <Modal.Body>
        <form className="max-w-sm mx-auto" onSubmit={handleSubmit}>
           {/* Campi di testo esistenti - mantengono handleTextChange */}
           <div className="mb-5">
            <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name</label>
            <input type="text" id="name" className="block w-full p-4 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-base focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.name} onChange={handleTextChange} />
          </div>
          <div className="mb-5">
            <label htmlFor="presentation" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Presentation</label>
            <input type="text" id="presentation" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.presentation} onChange={handleTextChange} />
          </div>
          <div className="mb-5">
            <label htmlFor="header_mono_subtitle" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Header Mono Subtitle</label>
            <input type="text" id="header_mono_subtitle" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.header_mono_subtitle} onChange={handleTextChange} />
          </div>
          <div className="mb-5">
            <label htmlFor="print_resume" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Print Resume</label>
            <input type="text" id="print_resume" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.print_resume} onChange={handleTextChange} />
          </div>
          <div className="mb-5">
            <label htmlFor="download_my_cv" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Download My CV</label>
            <input type="text" id="download_my_cv" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.download_my_cv} onChange={handleTextChange} />
          </div>
          <div className="mb-5">
            <label htmlFor="who_am_i" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Who Am I?</label>
            <input type="text" id="who_am_i" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.who_am_i} onChange={handleTextChange} />
          </div>
          <div className="mb-5">
            <label htmlFor="skills_label" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Skills Label</label>
            <input type="text" id="skills_label" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.skills_label} onChange={handleTextChange} />
          </div>
          <div className="mb-5">
            <label htmlFor="languages_label" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Languages Label</label>
            <input type="text" id="languages_label" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.languages_label} onChange={handleTextChange} />
          </div>
          <div className="mb-5">
            <label htmlFor="personal_info_label" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Personal Info Label</label>
            <input type="text" id="personal_info_label" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.personal_info_label} onChange={handleTextChange} />
          </div>
          <div className="mb-5">
            <label htmlFor="my_expertise_label" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">My Expertise Label</label>
            <input type="text" id="my_expertise_label" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.my_expertise_label} onChange={handleTextChange} />
          </div>
          <div className="mb-5">
            <label htmlFor="education_label" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Education Label</label>
            <input type="text" id="education_label" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.education_label} onChange={handleTextChange} />
          </div>
            <div className="mb-5">
            <label htmlFor="work_experience_label" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Work Experience Label</label>
            <input type="text" id="work_experience_label" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.work_experience_label} onChange={handleTextChange} />
          </div>
              <div className="mb-5">
            <label htmlFor="my_service_label" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">My Service Label</label>
            <input type="text" id="my_service_label" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.my_service_label} onChange={handleTextChange} />
          </div>
                <div className="mb-5">
            <label htmlFor="contact_label" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Contact Label</label>
            <input type="text" id="contact_label" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.contact_label} onChange={handleTextChange} />
          </div>
                  <div className="mb-5">
            <label htmlFor="pricing_packs_label" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Pricing Packs Label</label>
            <input type="text" id="pricing_packs_label" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.pricing_packs_label} onChange={handleTextChange} />
          </div>
                    <div className="mb-5">
            <label htmlFor="freelancing_label" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Freelancing Label</label>
            <input type="text" id="freelancing_label" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.freelancing_label} onChange={handleTextChange} />
          </div>
                      <div className="mb-5">
            <label htmlFor="hire_me_label" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Hire Me Label</label>
            <input type="text" id="hire_me_label" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.hire_me_label} onChange={handleTextChange} />
          </div>
                        <div className="mb-5">
            <label htmlFor="my_portfolio_label" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">My Portfolio Label</label>
            <input type="text" id="my_portfolio_label" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.my_portfolio_label} onChange={handleTextChange} />
          </div>
                          <div className="mb-5">
            <label htmlFor="latest_label" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Latest Label</label>
            <input type="text" id="latest_label" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.latest_label} onChange={handleTextChange} />
          </div>
                            <div className="mb-5">
            <label htmlFor="news_label" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">News Label</label>
            <input type="text" id="news_label" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.news_label} onChange={handleTextChange} />
          </div>
                              <div className="mb-5">
            <label htmlFor="form_title" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Form Title</label>
            <input type="text" id="form_title" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.form_title} onChange={handleTextChange} />
          </div>
                                <div className="mb-5">
            <label htmlFor="form_placeholder_name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Form Placeholder Name</label>
            <input type="text" id="form_placeholder_name" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.form_placeholder_name} onChange={handleTextChange} />
          </div>
                                  <div className="mb-5">
            <label htmlFor="form_placeholder_email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Form Placeholder Email</label>
            <input type="text" id="form_placeholder_email" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.form_placeholder_email} onChange={handleTextChange} />
          </div>
                                    <div className="mb-5">
            <label htmlFor="form_placeholder_message" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Form Placeholder Message</label>
            <input type="text" id="form_placeholder_message" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.form_placeholder_message} onChange={handleTextChange} />
          </div>
                                      <div className="mb-5">
            <label htmlFor="form_button_text" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Form Button Text</label>
            <input type="text" id="form_button_text" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.form_button_text} onChange={handleTextChange} />
          </div>
                                        <div className="mb-5">
            <label htmlFor="contact_title" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Contact Title</label>
            <input type="text" id="contact_title" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.contact_title} onChange={handleTextChange} />
          </div>
                                          <div className="mb-5">
            <label htmlFor="phone_label" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Phone Label</label>
            <input type="text" id="phone_label" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.phone_label} onChange={handleTextChange} />
          </div>
                                            <div className="mb-5">
            <label htmlFor="phone_number" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Phone Number</label>
            <input type="text" id="phone_number" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.phone_number} onChange={handleTextChange} />
          </div>
                                              <div className="mb-5">
            <label htmlFor="address_label" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Address Label</label>
            <input type="text" id="address_label" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.address_label} onChange={handleTextChange} />
          </div>
                                                <div className="mb-5">
            <label htmlFor="address" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Address</label>
            <input type="text" id="address" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.address} onChange={handleTextChange} />
          </div>
                                                  <div className="mb-5">
            <label htmlFor="email_label" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email Label</label>
            <input type="text" id="email_label" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.email_label} onChange={handleTextChange} />
          </div>
                                                    <div className="mb-5">
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
            <input type="text" id="email" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.email} onChange={handleTextChange} />
          </div>


          {/* Campi per l'upload delle immagini - Esempio per i primi 2 di portfolio_items */}
          <div className="mb-5 mt-10 border-t pt-4"> {/* Separatore visivo */}
             <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Immagini Portfolio</h4>
             <div className="mb-5">
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="portfolio_items_0_image">Portfolio Item 1 Image</label>
                <input className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" id="portfolio_items_0_image" type="file" onChange={handleFileChange} />
             </div>
              <div className="mb-5">
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="portfolio_items_1_image">Portfolio Item 2 Image</label>
                <input className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" id="portfolio_items_1_image" type="file" onChange={handleFileChange} />
             </div>
             {/* Aggiungi qui altri campi per gli altri portfolio_items */}
          </div>

           {/* Campi per l'upload delle immagini - Esempio per i primi 2 di blog_posts */}
          <div className="mb-5 mt-10 border-t pt-4"> {/* Separatore visivo */}
             <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Immagini Blog</h4>
             <div className="mb-5">
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="blog_posts_0_image">Blog Post 1 Image</label>
                <input className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" id="blog_posts_0_image" type="file" onChange={handleFileChange} />
             </div>
              <div className="mb-5">
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="blog_posts_1_image">Blog Post 2 Image</label>
                <input className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" id="blog_posts_1_image" type="file" onChange={handleFileChange} />
             </div>
             {/* Aggiungi qui altri campi per gli altri blog_posts */}
          </div>
          {/* Aggiungi qui campi per altri array con immagini se presenti */}


          {/* Bottone per salvare che attiva handleSubmit */}
          <Button type="submit">
            Salva JSON Locale (Immagini non incluse nel download ZIP)
          </Button>
        </form>
      </Modal.Body>
      <Modal.Footer>
        {/* Puoi aggiungere altri bottoni nel footer se necessario */}
      </Modal.Footer>
    </Modal>
  );
};

// Il componente Home rimane invariato
const Home = () => {
  const [openModal, setOpenModal] = useState(false);

  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="max-w-screen-xl px-4 py-8 mx-auto text-center lg:py-16 lg:px-6">
        <Button onClick={() => setOpenModal(true)}>Apri Upload</Button>
        <UploadModal isOpen={openModal} onClose={() => setOpenModal(false)} />
      </div>
    </section>
  );
};

export default Home;