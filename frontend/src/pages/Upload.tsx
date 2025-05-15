import { useState } from "react";
import { Button, Modal } from "flowbite-react";
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
// Assicurati che l'import sia corretto per il tuo ambiente se usi content_fetcher
// import { content_fetcher } from '@google/generative-ai-toolbox/tools';


// Definisci la struttura JSON originale come base
const originalJsonStructure = {
	"name": "",
	"presentation": "",
	"header_mono_subtitle": "",
	"print_resume": "",
	"download_my_cv": "",
	"social_links": {
		"facebook": "#",
		"twitter": "#",
		"instagram": "#",
		"github": "#"
	},
	"my_resume_label": {
		"my": "My",
		"resume": "Resume"
	},
	"who_am_i": "",
	"about": {
		"who": "Mi occupo di Backend per gestsionali aziendali, Sviluppo eCommerce e Integrazione per sistemi Regionali, Ministeroiali ed Europei",
		"details": "Lavoro a stretto contatto con piccole imprese per farle crescere sul mercato internazionale, tramite gestionali ed eCommerce. Inoltre faccio capo al governo europeo e italiano per permettere la condivisione dati tra i vari Paesi Membri dell'Europa'"
	},
	"personal_info": {
		"birthdate": "23/03/1999",
		"work_email": "sitiegestionali@gmail.com",
		"personal_email": "sitiegestionali@gmail.com",
		"work_number": "+ (39) 3517287336",
		"instagram": "enricobaldasso"
	},
	"skills_label": "",
	"skills": [
		{
			"name": "C",
			"level": "97%"
		}
	],
	"languages_label": "",
	"languages": [
		{
			"name": "Italiano",
			"level": "100%"
		}
	],
	"personal_info_label": "",
	"my_expertise_label": "",
	"expertise_list": [],
	"education_label": "",
	"education_list": [],
	"work_experience_label": "",
	"work_experience_list": [],
	"statistics": [],
	"my_service_label": "",
	"services": [],
	"contact_label": "",
	"pricing_packs_label": "",
	"pricing_packs": [],
	"freelancing_label": "",
	"hire_me_label": "",
	"my_portfolio_label": "",
	"portfolio_items": [
		{
			"title": "Pircher",
			"subtitle": "Cliente Gestionale",
			"image": "static/assets/imgs/Pircher.jpg",
			"alt": "https://www.pircher.eu/it/"
		},
		{
			"title": "Maddalena Spa",
			"subtitle": "Cliente Gestionale",
			"image": "static/assets/imgs/maddalena02.jpg",
			"alt": "https://www.maddalena.it/"
		}
	],
	"latest_label": "",
	"news_label": "",
	"blog_posts": [
		{
			"title": "Tecnico per Bruxells - Projectathon Europeo",
			"author": "Admin",
			"likes_html": "",
			"comments_html": "",
			"image": "static/assets/imgs/EU01.jpg",
			"alt": "https://interoperable-europe.ec.europa.eu/collection/digital-building-blocks/solution/once-only-technical-system-oots",
			"description": "Progetti chiave dell'Unione Europea per la semplificazione dell'accesso e dell'uso dei servizi pubblici",
			"full_description": "Ho contribuito attivamente...",
			"read_more_url": "https://interoperable-europe.ec.europa.eu/collection/digital-building-blocks/solution/once-only-technical-system-oots"
		},
		{
			"title": "Certificato IBM in Data Science",
			"author": "Admin",
			"likes_html": "",
			"comments_html": "",
			"image": "static/assets/imgs/Certi01.jpg",
			"alt": "https://coursera.org/share/67a906a955411b3c4e85a8be587c848a",
			"description": "Corso completo IBM in Data Science",
			"full_description": "In questo certificato professionale...",
			"read_more_url": "https://coursera.org/share/67a906a955411b3c4e85a8be587c848a"
		}
	],
	"form_title": "",
	"form_placeholder_name": "",
	"form_placeholder_email": "",
	"form_placeholder_message": "",
	"form_button_text": "",
	"contact_title": "",
	"phone_label": "",
	"phone_number": "",
	"address_label": "",
	"address": "",
	"email_label": "",
	"email": ""
};


const UploadModal = ({ isOpen, onClose }) => {
  // Stato principale che riflette la struttura del JSON, includendo gli array
  const [formData, setFormData] = useState({
    name: "",
    presentation: "",
    header_mono_subtitle: "",
    print_resume: "",
    download_my_cv: "",
    social_links: originalJsonStructure.social_links, // Manteniamo le strutture nidificate iniziali
    my_resume_label: originalJsonStructure.my_resume_label,
    who_am_i: "",
    about: originalJsonStructure.about,
    personal_info: originalJsonStructure.personal_info,
    skills_label: "",
    skills: originalJsonStructure.skills, // Inizializza con la struttura originale
    languages_label: "",
    languages: originalJsonStructure.languages, // Inizializza con la struttura originale
    personal_info_label: "",
    my_expertise_label: "",
    expertise_list: originalJsonStructure.expertise_list, // Inizializza con la struttura originale
    education_label: "",
    education_list: originalJsonStructure.education_list, // Inizializza con la struttura originale
    work_experience_label: "",
    work_experience_list: originalJsonStructure.work_experience_list, // Inizializza con la struttura originale
    statistics: originalJsonStructure.statistics, // Inizializza con la struttura originale
    my_service_label: "",
    services: originalJsonStructure.services, // Inizializza con la struttura originale
    contact_label: "",
    pricing_packs_label: "",
    pricing_packs: originalJsonStructure.pricing_packs, // Inizializza con la struttura originale
    freelancing_label: "",
    hire_me_label: "",
    my_portfolio_label: "",
    portfolio_items: originalJsonStructure.portfolio_items, // Inizializza con gli elementi originali
    latest_label: "",
    news_label: "",
    blog_posts: originalJsonStructure.blog_posts, // Inizializza con gli elementi originali
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

  // Stato per tenere i file immagine selezionati, indicizzati per array e indice
  const [selectedImageFiles, setSelectedImageFiles] = useState({});

  // Stato per tenere il file CV selezionato
   const [selectedCVFile, setSelectedCVFile] = useState(null);


  // Gestisce i cambiamenti negli input di testo
  const handleTextChange = (e) => {
    const { id, value } = e.target;
     // Gestisce anche i campi nidificati se necessario, con una logica più complessa qui
     // Per ora, funziona solo per i campi top-level nel formData state
    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: value,
    }));
  };

  // Gestisce i cambiamenti negli input di testo per gli elementi degli array
  const handleArrayItemTextChange = (arrayName, index, fieldName, value) => {
        setFormData(prevFormData => {
            const updatedArray = [...prevFormData[arrayName]];
            updatedArray[index] = {
                ...updatedArray[index],
                [fieldName]: value
            };
            return {
                ...prevFormData,
                [arrayName]: updatedArray
            };
        });
  };


  // Gestisce i cambiamenti negli input di tipo file immagine per gli elementi degli array
  const handleArrayItemImageChange = (arrayName, index, file) => {
       setSelectedImageFiles(prevSelectedFiles => ({
           ...prevSelectedFiles,
           [`${arrayName}_${index}_image`]: file // Esempio: 'portfolio_items_0_image'
       }));
       // Aggiorna anche il nome del file nel formData per visualizzazione immediata se vuoi
       setFormData(prevFormData => {
           const updatedArray = [...prevFormData[arrayName]];
           updatedArray[index] = {
               ...updatedArray[index],
               image: file ? `imgs/${file.name}` : '' // Aggiorna il percorso nel JSON preview
           };
           return {
               ...prevFormData,
               [arrayName]: updatedArray
           };
       });
  };


  // Gestisce il cambiamento nell'input di tipo file per il CV
  const handleCVFileChange = async (e) => {
      const file = e.target.files ? e.target.files[0] : null;
      setSelectedCVFile(file);

       if (file) {
           console.log("File CV selezionato:", file.name);
           // Qui potresti integrare una chiamata API per l'estrazione dati,
           // ma come discusso, richiede un servizio esterno.
           console.log("Il parsing automatico del CV non è supportato per i formati di documenti.");
       }
  };

    // Funzioni per aggiungere elementi agli array
    const addPortfolioItem = () => {
        setFormData(prevFormData => ({
            ...prevFormData,
            portfolio_items: [...prevFormData.portfolio_items, {
                title: "",
                subtitle: "",
                image: "",
                alt: ""
            }]
        }));
    };

     const addBlogPost = () => {
        setFormData(prevFormData => ({
            ...prevFormData,
            blog_posts: [...prevFormData.blog_posts, {
                title: "",
                author: "",
                likes_html: "",
                comments_html: "",
                image: "",
                alt: "",
                description: "",
                full_description: "",
                read_more_url: ""
            }]
        }));
    };

    // Funzioni per rimuovere elementi dagli array
    const removePortfolioItem = (index) => {
        setFormData(prevFormData => {
            const updatedArray = prevFormData.portfolio_items.filter((_, i) => i !== index);
            // Potrebbe essere necessario pulire anche selectedImageFiles per l'elemento rimosso
            const updatedSelectedImageFiles = { ...selectedImageFiles };
            delete updatedSelectedImageFiles[`portfolio_items_${index}_image`];
            return {
                ...prevFormData,
                portfolio_items: updatedArray
            };
        });
         // Pulire anche selectedImageFiles per l'elemento rimosso in modo asincrono
         setSelectedImageFiles(prevSelectedFiles => {
             const updatedSelectedFiles = { ...prevSelectedFiles };
             delete updatedSelectedFiles[`portfolio_items_${index}_image`];
             return updatedSelectedFiles;
         });
    };

     const removeBlogPost = (index) => {
        setFormData(prevFormData => {
            const updatedArray = prevFormData.blog_posts.filter((_, i) => i !== index);
             // Potrebbe essere necessario pulire anche selectedImageFiles per l'elemento rimosso
            const updatedSelectedImageFiles = { ...selectedImageFiles };
            delete updatedSelectedImageFiles[`blog_posts_${index}_image`];
            return {
                ...prevFormData,
                blog_posts: updatedArray
            };
        });
         // Pulire anche selectedImageFiles per l'elemento rimosso in modo asincrono
          setSelectedImageFiles(prevSelectedFiles => {
             const updatedSelectedFiles = { ...prevSelectedFiles };
             delete updatedSelectedFiles[`blog_posts_${index}_image`];
             return updatedSelectedFiles;
         });
    };


  // Gestisce l'invio del form e crea l'archivio ZIP
  const handleSubmit = async (e) => {
    e.preventDefault();

    const zip = new JSZip(); // Crea una nuova istanza ZIP
    const imgsFolder = zip.folder("imgs"); // Crea la cartella 'imgs' nello ZIP

    // Utilizza direttamente lo stato corrente del formData
    const dataToSave = JSON.parse(JSON.stringify(formData)); // Crea una copia profonda dello stato attuale

    // Processa i file immagine e aggiorna i percorsi nel JSON
    // Per portfolio_items
    if (dataToSave.portfolio_items) {
        dataToSave.portfolio_items.forEach((item, index) => {
            const file = selectedImageFiles[`portfolio_items_${index}_image`];
            if (file) {
                 item.image = `imgs/${file.name}`;
                 imgsFolder.file(file.name, file);
            } else if (item.image && !item.image.startsWith('imgs/')) {
                // Se non è stato caricato un nuovo file, ma l'immagine originale non è nel formato imgs/,
                // potresti voler mantenere il percorso originale o gestirlo diversamente.
                // Qui manteniamo il percorso originale se non inizia con 'imgs/'
            } else if (!item.image) {
                 // Se non c'era un'immagine originale e non ne è stata caricata una nuova
                 item.image = ""; // Assicurati che il campo sia presente ma vuoto
            }
             // Se c'era un'immagine originale e non ne è stata caricata una nuova,
             // il suo percorso originale viene mantenuto dalla copia profonda iniziale.
        });
    }

     // Per blog_posts
     if (dataToSave.blog_posts) {
        dataToSave.blog_posts.forEach((item, index) => {
             const file = selectedImageFiles[`blog_posts_${index}_image`];
            if (file) {
                 item.image = `imgs/${file.name}`;
                 imgsFolder.file(file.name, file);
            } else if (item.image && !item.image.startsWith('imgs/')) {
                 // Mantieni percorso originale se non inizia con 'imgs/'
            } else if (!item.image) {
                 item.image = ""; // Assicurati che il campo sia presente ma vuoto
            }
        });
     }
    // Aggiungi logica simile per altri array con campi immagine


    // Aggiungi il file CV allo ZIP se è stato selezionato
    if (selectedCVFile) {
        zip.file(selectedCVFile.name, selectedCVFile);
    }


    // Converti l'oggetto JavaScript risultante in una stringa JSON formattata
    const jsonString = JSON.stringify(dataToSave, null, 2);

    // Aggiungi il file JSON all'archivio ZIP
    zip.file("dati_compilati.json", jsonString);

    // Genera il contenuto dello ZIP in formato Blob
    try {
        const zipBlob = await zip.generateAsync({ type: "blob" });

        // Usa file-saver per scaricare il file ZIP
        saveAs(zipBlob, "dati_compilati.zip");

    } catch (error) {
        console.error("Errore nella creazione o nel download del file ZIP:", error);
        alert("Si è verificato un errore durante la creazione del file ZIP.");
    }

    onClose();
  };

  return (
    <Modal show={isOpen} onClose={onClose}>
      <Modal.Header>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Popola Dati, Carica Immagini e Scarica ZIP
        </h3>
      </Modal.Header>
      <Modal.Body>
        <form className="max-w-sm mx-auto" onSubmit={handleSubmit}>

           {/* Campo per l'upload del CV */}
            <div className="mb-5 border-b pb-4">
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="cv_file">Carica CV (PDF, Word, TXT, RTF)</label>
                <input
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                    id="cv_file"
                    type="file"
                    onChange={handleCVFileChange}
                    accept=".pdf,.doc,.docx,.txt,.rtf"
                />
                 <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                    Carica il tuo CV. L'estrazione automatica dei dati per popolare i campi del form non è supportata; dovrai copiare i dati manualmente.
                </p>
            </div>


           {/* Campi di testo statici (top-level) */}
           {/* Ho rimosso i campi statici che sono ora gestiti negli array dinamici */}
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
                <input type="text" id="languages_label" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.languages_label} onChange={handleTextChange} />
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


           {/* Sezione dinamica per Portfolio Items */}
          <div className="mb-5 mt-10 border-t pt-4">
             <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Portfolio Items</h4>
             {formData.portfolio_items.map((item, index) => (
                 <div key={index} className="mb-8 p-4 border rounded-lg dark:border-gray-700 relative">
                    {/* Bottone per rimuovere l'elemento */}
                     <button
                         type="button"
                         onClick={() => removePortfolioItem(index)}
                         className="absolute top-2 right-2 text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-700"
                     >
                        Rimuovi
                     </button>
                    <h5 className="text-md font-medium text-gray-900 dark:text-white mb-3">Item #{index + 1}</h5>
                     <div className="mb-5">
                         <label htmlFor={`portfolio_items_${index}_title`} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Title</label>
                         <input
                            type="text"
                            id={`portfolio_items_${index}_title`}
                            className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={item.title}
                            onChange={(e) => handleArrayItemTextChange('portfolio_items', index, 'title', e.target.value)}
                         />
                     </div>
                     <div className="mb-5">
                         <label htmlFor={`portfolio_items_${index}_subtitle`} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Subtitle</label>
                         <input
                            type="text"
                            id={`portfolio_items_${index}_subtitle`}
                            className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={item.subtitle}
                             onChange={(e) => handleArrayItemTextChange('portfolio_items', index, 'subtitle', e.target.value)}
                         />
                     </div>
                      <div className="mb-5">
                         <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor={`portfolio_items_${index}_image`}>Image</label>
                         <input
                            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                            id={`portfolio_items_${index}_image`}
                            type="file"
                            onChange={(e) => handleArrayItemImageChange('portfolio_items', index, e.target.files[0])}
                            accept="image/*"
                         />
                          {item.image && ( // Mostra il nome del file se presente nello stato
                              <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">{item.image}</p>
                          )}
                     </div>
                      <div className="mb-5">
                         <label htmlFor={`portfolio_items_${index}_alt`} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Alt Text / Link</label>
                         <input
                            type="text"
                            id={`portfolio_items_${index}_alt`}
                            className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={item.alt}
                            onChange={(e) => handleArrayItemTextChange('portfolio_items', index, 'alt', e.target.value)}
                         />
                     </div>
                 </div>
             ))}
             <Button type="button" onClick={addPortfolioItem}>Aggiungi Portfolio Item</Button>
          </div>


           {/* Sezione dinamica per Blog Posts */}
          <div className="mb-5 mt-10 border-t pt-4">
             <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Blog Posts</h4>
              {formData.blog_posts.map((item, index) => (
                 <div key={index} className="mb-8 p-4 border rounded-lg dark:border-gray-700 relative">
                     {/* Bottone per rimuovere l'elemento */}
                      <button
                         type="button"
                         onClick={() => removeBlogPost(index)}
                         className="absolute top-2 right-2 text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-700"
                     >
                        Rimuovi
                     </button>
                     <h5 className="text-md font-medium text-gray-900 dark:text-white mb-3">Blog Post #{index + 1}</h5>
                      <div className="mb-5">
                         <label htmlFor={`blog_posts_${index}_title`} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Title</label>
                         <input
                            type="text"
                            id={`blog_posts_${index}_title`}
                            className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={item.title}
                             onChange={(e) => handleArrayItemTextChange('blog_posts', index, 'title', e.target.value)}
                         />
                     </div>
                      <div className="mb-5">
                         <label htmlFor={`blog_posts_${index}_author`} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Author</label>
                         <input
                            type="text"
                            id={`blog_posts_${index}_author`}
                            className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={item.author}
                             onChange={(e) => handleArrayItemTextChange('blog_posts', index, 'author', e.target.value)}
                         />
                     </div>
                      <div className="mb-5">
                         <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor={`blog_posts_${index}_image`}>Image</label>
                         <input
                            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                            id={`blog_posts_${index}_image`}
                            type="file"
                            onChange={(e) => handleArrayItemImageChange('blog_posts', index, e.target.files[0])}
                            accept="image/*"
                         />
                         {item.image && ( // Mostra il nome del file se presente nello stato
                              <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">{item.image}</p>
                          )}
                     </div>
                      <div className="mb-5">
                         <label htmlFor={`blog_posts_${index}_alt`} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Alt Text / Link</label>
                         <input
                            type="text"
                            id={`blog_posts_${index}_alt`}
                            className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={item.alt}
                             onChange={(e) => handleArrayItemTextChange('blog_posts', index, 'alt', e.target.value)}
                         />
                     </div>
                     <div className="mb-5">
                         <label htmlFor={`blog_posts_${index}_description`} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Description</label>
                         <textarea
                            id={`blog_posts_${index}_description`}
                            className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={item.description}
                            onChange={(e) => handleArrayItemTextChange('blog_posts', index, 'description', e.target.value)}
                            rows="3" // Aggiungi righe per textarea
                         ></textarea>
                     </div>
                      <div className="mb-5">
                         <label htmlFor={`blog_posts_${index}_full_description`} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Full Description</label>
                         <textarea
                            id={`blog_posts_${index}_full_description`}
                            className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={item.full_description}
                             onChange={(e) => handleArrayItemTextChange('blog_posts', index, 'full_description', e.target.value)}
                             rows="5" // Aggiungi righe per textarea
                         ></textarea>
                     </div>
                      <div className="mb-5">
                         <label htmlFor={`blog_posts_${index}_read_more_url`} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Read More URL</label>
                         <input
                            type="text"
                            id={`blog_posts_${index}_read_more_url`}
                            className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={item.read_more_url}
                             onChange={(e) => handleArrayItemTextChange('blog_posts', index, 'read_more_url', e.target.value)}
                         />
                     </div>
                      {/* Puoi aggiungere likes_html e comments_html se vuoi gestirli */}
                 </div>
             ))}
             <Button type="button" onClick={addBlogPost}>Aggiungi Blog Post</Button>
          </div>
           {/* Aggiungi qui sezioni dinamiche per altri array (skills, education_list, ecc.) */}


          {/* Bottone per salvare che attiva handleSubmit */}
          <Button type="submit">
            Scarica ZIP con JSON, Immagini e CV
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