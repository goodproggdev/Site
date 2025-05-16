import { useState, useEffect } from "react"; // Importa useEffect
import { Button, Modal, Spinner } from "flowbite-react"; // Importa Spinner
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// Importa il JSON di esempio. Assicurati che il percorso sia corretto
import exampleData from './data.json';

// Definisci la struttura JSON originale come base (rimane necessaria per inizializzare lo stato)
// Assicurati che questa struttura corrisponda a quella nel backend Python
const initialJsonStructure = {
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
		"who": "",
		"details": ""
	},
	"personal_info": {
		"birthdate": "",
		"work_email": "",
		"personal_email": "",
		"work_number": "",
		"instagram": ""
	},
	"skills_label": "",
	"skills": [],
	"languages_label": "",
	"languages": [],
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
	"portfolio_items": [],
	"latest_label": "",
	"news_label": "",
	"blog_posts": [],
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
  // Stato principale che riflette la struttura del JSON
  // Inizializzalo con la struttura base vuota
  const [formData, setFormData] = useState(initialJsonStructure);

  // Stato per tenere i file immagine selezionati, indicizzati per array e indice
  const [selectedImageFiles, setSelectedImageFiles] = useState({});

  // Stato per tenere il file CV selezionato
   const [selectedCVFile, setSelectedCVFile] = useState(null);

   // Stato per gestire lo stato di caricamento durante il parsing
   const [isParsing, setIsParsing] = useState(false);
   // Stato per gestire eventuali errori di parsing
    const [parsingError, setParsingError] = useState(null);

    // Stato per memorizzare il JSON di esempio caricato
    const [exampleJson, setExampleJson] = useState(null);


    // Carica il JSON di esempio all'apertura del modal
    useEffect(() => {
        if (isOpen) {
            // Assumi che exampleData sia già importato correttamente
             setExampleJson(exampleData);
             console.log("JSON di esempio caricato:", exampleData);
        }
    }, [isOpen]);


    // Reset dello stato quando il modal viene chiuso
    useEffect(() => {
        if (!isOpen) {
            setFormData(initialJsonStructure); // Resetta la form ai valori iniziali
            setSelectedImageFiles({}); // Resetta i file immagine
            setSelectedCVFile(null); // Resetta il file CV
            setIsParsing(false); // Resetta lo stato di parsing
            setParsingError(null); // Resetta l'errore
            setExampleJson(null); // Resetta il JSON di esempio
        }
    }, [isOpen]);


  // Gestisce i cambiamenti negli input di testo
  const handleTextChange = (e) => {
    const { id, value } = e.target;
     // Gestisce anche i campi nidificati
    const keys = id.split('.'); // Suddivide l'id per gestire i percorsi nidificati
    if (keys.length === 1) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          [id]: value,
        }));
    } else {
        setFormData(prevFormData => {
            const newData = { ...prevFormData };
            let current = newData;
            for (let i = 0; i < keys.length - 1; i++) {
                // Assicurati che la chiave esista o crea un oggetto vuoto se necessario
                if (current[keys[i]] === undefined || current[keys[i]] === null) {
                    current[keys[i]] = {};
                }
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            return newData;
        });
    }
  };


  // Gestisce i cambiamenti negli input di testo per gli elementi degli array
  const handleArrayItemTextChange = (arrayName, index, fieldName, value) => {
        setFormData(prevFormData => {
            const updatedArray = [...prevFormData[arrayName]];
            // Assicurati che l'elemento all'indice esista prima di modificarlo
            if (updatedArray[index]) {
                updatedArray[index] = {
                    ...updatedArray[index],
                    [fieldName]: value
                };
            }
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
            // Assicurati che l'elemento all'indice esista
           if (updatedArray[index]) {
               updatedArray[index] = {
                   ...updatedArray[index],
                   image: file ? `imgs/${file.name}` : '' // Aggiorna il percorso nel JSON preview
               };
           }
           return {
               ...prevFormData,
               [arrayName]: updatedArray
           };
       });
  };


  // Gestisce il cambiamento nell'input di tipo file per il CV - Ora invia al backend
  const handleCVFileChange = async (e) => {
      const file = e.target.files ? e.target.files[0] : null;
      setSelectedCVFile(file); // Salva il file selezionato nello stato

       if (file) {
           setParsingError(null); // Resetta l'errore precedente
           setIsParsing(true); // Imposta lo stato di parsing a true
           console.log(`Invio file CV '${file.name}' al backend per il parsing...`);

           const formData = new FormData(); // Crea un oggetto FormData
           formData.append('cv_file', file); // Aggiungi il file CV con il nome 'cv_file' (deve corrispondere al backend)

           try {
               // Sostituisci con l'URL del tuo backend Flask
               const backendUrl = 'http://127.0.0.1:8000/api/parse-cv-upload/';

               const response = await fetch(backendUrl, {
                   method: 'POST',
                   body: formData // Invia il FormData con il file
               });

                if (!response.ok) {
                      const errorResponse = await response.json();
                      console.error("Errore HTTP dal backend:", response.status, errorResponse);
                       setParsingError(`Errore dal backend: ${response.status} - ${errorResponse.error || response.statusText} `);
                       setIsParsing(false);
                      return;
                  }

                  const parsedData = await response.json();

                  console.log("Dati JSON ricevuti dal backend:", parsedData);

                // *** Popola la form con i dati ricevuti ***
                // Questo sovrascriverà lo stato attuale con i dati estratti
                setFormData(prevFormData => ({
                    ...prevFormData, // Mantieni i campi non popolati dal parser o le strutture complesse se non modificate
                    ...parsedData // Sovrascrivi con i dati estratti dal parser
                    // Nota: questa fusione funziona bene per i campi top-level e le strutture
                    // nidificate se il parser le restituisce. Per gli array, sovrascriverà l'intero array.
                    // Se vuoi unire elementi degli array (es. aggiungere esperienze estratte
                    // a quelle già presenti), la logica qui deve essere più complessa.
                    // Per semplicità, qui sostituiamo gli array con quelli estratti.
                }));

                // Potresti voler pulire i file immagine selezionati in precedenza se il CV ne ha di nuovi
                 setSelectedImageFiles({});


           } catch (error) {
               console.error("Errore durante la comunicazione con il backend o il parsing:", error);
               setParsingError(`Errore durante il parsing: ${error.message}`);
           } finally {
               setIsParsing(false); // Termina lo stato di parsing
           }
       }
  };


    // Funzione per popolare un campo con il valore d'esempio
    const populateFieldWithExample = (id) => {
        if (!exampleJson) return; // Non fare nulla se il JSON di esempio non è caricato

        const keys = id.split('.');
        let exampleValue = exampleJson;
        let found = true;

        // Naviga attraverso le chiavi per trovare il valore nel JSON di esempio
        for (let i = 0; i < keys.length; i++) {
            if (exampleValue && typeof exampleValue === 'object' && exampleValue.hasOwnProperty(keys[i])) {
                exampleValue = exampleValue[keys[i]];
            } else {
                found = false;
                break;
            }
        }

        if (found && exampleValue !== undefined && exampleValue !== null && typeof exampleValue !== 'object' && !Array.isArray(exampleValue)) {
            // Aggiorna lo stato formData con il valore d'esempio solo se è un tipo primitivo
            setFormData(prevFormData => {
                const newData = { ...prevFormData };
                let current = newData;
                for (let i = 0; i < keys.length - 1; i++) {
                     if (!current[keys[i]]) current[keys[i]] = {}; // Crea l'oggetto se non esiste
                     current = current[keys[i]];
                }
                current[keys[keys.length - 1]] = exampleValue;
                return newData;
            });
        } else if (!found) {
            console.warn(`Chiave "${id}" non trovata nel JSON di esempio per il popolamento.`);
        } else if (exampleValue !== undefined && exampleValue !== null && typeof exampleValue === 'object') {
             console.warn(`Il valore per la chiave "${id}" nel JSON di esempio è un oggetto/array. Non può essere usato per popolare un campo di testo singolo.`);
        }
    };

     // Funzione per popolare un campo all'interno di un array con il valore d'esempio
    const populateArrayItemFieldWithExample = (arrayName, fieldName, index) => {
        if (!exampleJson || !exampleJson[arrayName] || !exampleJson[arrayName][index]) return;

        const exampleValue = exampleJson[arrayName][index][fieldName];

         if (exampleValue !== undefined && exampleValue !== null && typeof exampleValue !== 'object' && !Array.isArray(exampleValue)) {
             handleArrayItemTextChange(arrayName, index, fieldName, exampleValue);
         } else if (exampleValue !== undefined && exampleValue !== null && typeof exampleValue === 'object') {
             console.warn(`Il valore per la chiave "${fieldName}" per l'elemento ${index} nell'array "${arrayName}" nel JSON di esempio è un oggetto/array. Non può essere usato per popolare un campo di testo singolo.`);
         } else {
             console.warn(`Chiave "${fieldName}" per l'elemento ${index} nell'array "${arrayName}" non trovata nel JSON di esempio per il popolamento.`);
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
            return {
                ...prevFormData,
                portfolio_items: updatedArray
            };
        });
         // Pulire anche selectedImageFiles per l'elemento rimosso
         setSelectedImageFiles(prevSelectedFiles => {
             const updatedSelectedFiles = { ...prevSelectedFiles };
             delete updatedSelectedFiles[`portfolio_items_${index}_image`];
             return updatedSelectedFiles;
         });
    };

     const removeBlogPost = (index) => {
        setFormData(prevFormData => {
            const updatedArray = prevFormData.blog_posts.filter((_, i) => i !== index);
            return {
                ...prevFormData,
                blog_posts: updatedArray
            };
        });
         // Pulire anche selectedImageFiles per l'elemento rimosso
          setSelectedImageFiles(prevSelectedFiles => {
             const updatedSelectedFiles = { ...prevSelectedFiles };
             delete updatedSelectedFiles[`blog_posts_${index}_image`];
             return updatedSelectedFiles;
         });
    };


  // Gestisce l'invio del form e crea l'archivio ZIP
  const handleSubmit = async (e) => {
    e.preventDefault();

    const zip = new JSZip();
    const imgsFolder = zip.folder("imgs");

    // Utilizza direttamente lo stato corrente del formData per il JSON
    const dataToSave = JSON.parse(JSON.stringify(formData)); // Crea una copia profonda dello stato attuale

    // Processa i file immagine e aggiungi i file immagine allo ZIP
    // Nota: i percorsi delle immagini nel JSON sono già stati aggiornati in handleArrayItemImageChange
    for (const key in selectedImageFiles) {
        const file = selectedImageFiles[key];
        if (file) {
             // La chiave è nel formato 'arrayName_index_image'
             // Puoi estrarre nome_array e indice se necessario, ma per aggiungere allo ZIP
             // serve solo il nome del file e il file stesso.
             // Assicurati che il percorso nel JSON sia 'imgs/nome_file.estensione'
             // E qui aggiungi il file allo ZIP nella cartella imgs.
             imgsFolder.file(file.name, file);
        }
    }


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

    // Chiudi il modal solo se non ci sono errori gravi e il download è iniziato (o gestisci diversamente)
    // onClose();
  };

  return (
    <Modal show={isOpen} onClose={onClose} size="md"> {/* Puoi regolare la dimensione del modal */}
      <Modal.Header>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Popola Dati da CV, Modifica e Scarica ZIP
        </h3>
      </Modal.Header>
      <Modal.Body className="overflow-y-auto max-h-[80vh]"> {/* Aggiungi scroll al body */}
        <form className="max-w-sm mx-auto" onSubmit={handleSubmit}>

           {/* Campo per l'upload del CV con stato di parsing */}
            <div className="mb-5 border-b pb-4">
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="cv_file">Carica CV (PDF, Word, TXT, RTF)</label>
                <input
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                    id="cv_file"
                    type="file"
                    onChange={handleCVFileChange}
                    accept=".pdf,.doc,.docx,.txt,.rtf"
                     disabled={isParsing} // Disabilita durante il parsing
                />
                 {isParsing && (
                     <div className="flex items-center mt-2 text-blue-600 dark:text-blue-400">
                         <Spinner size="sm" className="mr-2" />
                         Parsing in corso...
                     </div>
                 )}
                 {parsingError && (
                     <p className="mt-1 text-sm text-red-600 dark:text-red-400">{parsingError}</p>
                 )}
                 {!isParsing && !parsingError && selectedCVFile && (
                     <p className="mt-1 text-sm text-green-600 dark:text-green-400">File '{selectedCVFile.name}' caricato. Modifica i campi estratti se necessario.</p>
                 )}
                 {!isParsing && !parsingError && !selectedCVFile && (
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                        Carica il tuo CV per popolare automaticamente la form. Potrebbe essere necessario modificare i dati estratti.
                     </p>
                 )}
            </div>


           {/* Campi di testo statici (top-level) - Aggiunta icona con carattere unicode */}
            <div className="mb-5">
                <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Name
                     {exampleJson && exampleJson.hasOwnProperty('name') && (
                        <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('name')}
                            title={`Esempio: ${exampleJson.name}`}
                        >
                            ℹ️
                        </span>
                     )}
                </label>
                <input type="text" id="name" className="block w-full p-4 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-base focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.name || ''} onChange={handleTextChange} />
            </div>
             <div className="mb-5">
                <label htmlFor="presentation" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Presentation
                     {exampleJson && exampleJson.hasOwnProperty('presentation') && (
                         <span
                             className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                              onClick={() => populateFieldWithExample('presentation')}
                              title={`Esempio: ${exampleJson.presentation}`}
                         >
                             ℹ️
                         </span>
                     )}
                </label>
                <input type="text" id="presentation" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.presentation || ''} onChange={handleTextChange} />
            </div>
             <div className="mb-5">
                <label htmlFor="header_mono_subtitle" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Header Mono Subtitle
                     {exampleJson && exampleJson.hasOwnProperty('header_mono_subtitle') && (
                         <span
                             className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                             onClick={() => populateFieldWithExample('header_mono_subtitle')}
                             title={`Esempio: ${exampleJson.header_mono_subtitle}`}
                         >
                             ℹ️
                         </span>
                     )}
                </label>
                <input type="text" id="header_mono_subtitle" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.header_mono_subtitle || ''} onChange={handleTextChange} />
            </div>
             <div className="mb-5">
                <label htmlFor="print_resume" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Print Resume
                     {exampleJson && exampleJson.hasOwnProperty('print_resume') && (
                         <span
                             className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                             onClick={() => populateFieldWithExample('print_resume')}
                             title={`Esempio: ${exampleJson.print_resume}`}
                         >
                             ℹ️
                         </span>
                     )}
                </label>
                <input type="text" id="print_resume" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.print_resume || ''} onChange={handleTextChange} />
            </div>
             <div className="mb-5">
                <label htmlFor="download_my_cv" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Download My CV
                      {exampleJson && exampleJson.hasOwnProperty('download_my_cv') && (
                         <span
                             className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                             onClick={() => populateFieldWithExample('download_my_cv')}
                             title={`Esempio: ${exampleJson.download_my_cv}`}
                         >
                             ℹ️
                         </span>
                     )}
                </label>
                <input type="text" id="download_my_cv" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.download_my_cv || ''} onChange={handleTextChange} />
            </div>
              <div className="mb-5">
                <label htmlFor="my_resume_label.my" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    My Resume Label (My)
                     {exampleJson && exampleJson.my_resume_label && exampleJson.my_resume_label.hasOwnProperty('my') && (
                        <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('my_resume_label.my')}
                             title={`Esempio: ${exampleJson.my_resume_label.my}`}
                        >
                            ℹ️
                        </span>
                     )}
                </label>
                <input type="text" id="my_resume_label.my" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.my_resume_label.my || ''} onChange={handleTextChange} />
            </div>
             <div className="mb-5">
                <label htmlFor="my_resume_label.resume" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    My Resume Label (Resume)
                     {exampleJson && exampleJson.my_resume_label && exampleJson.my_resume_label.hasOwnProperty('resume') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('my_resume_label.resume')}
                             title={`Esempio: ${exampleJson.my_resume_label.resume}`}
                        >
                            ℹ️
                        </span>
                     )}
                </label>
                <input type="text" id="my_resume_label.resume" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.my_resume_label.resume || ''} onChange={handleTextChange} />
            </div>

              <div className="mb-5">
                <label htmlFor="who_am_i" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Who Am I?
                    {exampleJson && exampleJson.hasOwnProperty('who_am_i') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('who_am_i')}
                             title={`Esempio: ${exampleJson.who_am_i}`}
                        >
                            ℹ️
                        </span>
                     )}
                </label>
                <input type="text" id="who_am_i" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.who_am_i || ''} onChange={handleTextChange} />
            </div>

            {/* Campi nidificati - about */}
             <div className="mb-5 border-t pt-4">
                 <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">About</h4>
                 <div className="mb-5">
                     <label htmlFor="about.who" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                         Who
                          {exampleJson && exampleJson.about && exampleJson.about.hasOwnProperty('who') && (
                             <span
                                className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                onClick={() => populateFieldWithExample('about.who')}
                                 title={`Esempio: ${exampleJson.about.who}`}
                            >
                                ℹ️
                            </span>
                         )}
                     </label>
                      <textarea
                         id="about.who"
                         className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                         value={formData.about.who || ''}
                         onChange={handleTextChange}
                         rows={3}
                      ></textarea>
                 </div>
                  <div className="mb-5">
                     <label htmlFor="about.details" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                         Details
                          {exampleJson && exampleJson.about && exampleJson.about.hasOwnProperty('details') && (
                              <span
                                className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                onClick={() => populateFieldWithExample('about.details')}
                                 title={`Esempio: ${exampleJson.about.details}`}
                            >
                                ℹ️
                            </span>
                         )}
                     </label>
                      <textarea
                         id="about.details"
                         className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                         value={formData.about.details || ''}
                         onChange={handleTextChange}
                         rows={5}
                      ></textarea>
                 </div>
             </div>

             {/* Campi nidificati - personal_info */}
             <div className="mb-5 border-t pt-4">
                 <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Info</h4>
                  <div className="mb-5">
                     <label htmlFor="personal_info.birthdate" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                         Birthdate
                          {exampleJson && exampleJson.personal_info && exampleJson.personal_info.hasOwnProperty('birthdate') && (
                             <span
                                className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                onClick={() => populateFieldWithExample('personal_info.birthdate')}
                                 title={`Esempio: ${exampleJson.personal_info.birthdate}`}
                            >
                                ℹ️
                            </span>
                         )}
                     </label>
                     <input
                         type="text"
                         id="personal_info.birthdate"
                         className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                         value={formData.personal_info.birthdate || ''}
                         onChange={handleTextChange}
                     />
                 </div>
                  <div className="mb-5">
                     <label htmlFor="personal_info.work_email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                         Work Email
                          {exampleJson && exampleJson.personal_info && exampleJson.personal_info.hasOwnProperty('work_email') && (
                              <span
                                className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                onClick={() => populateFieldWithExample('personal_info.work_email')}
                                 title={`Esempio: ${exampleJson.personal_info.work_email}`}
                            >
                                ℹ️
                            </span>
                         )}
                     </label>
                     <input
                         type="text"
                         id="personal_info.work_email"
                         className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                         value={formData.personal_info.work_email || ''}
                         onChange={handleTextChange}
                     />
                 </div>
                  <div className="mb-5">
                     <label htmlFor="personal_info.personal_email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                         Personal Email
                          {exampleJson && exampleJson.personal_info && exampleJson.personal_info.hasOwnProperty('personal_email') && (
                              <span
                                className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                onClick={() => populateFieldWithExample('personal_info.personal_email')}
                                 title={`Esempio: ${exampleJson.personal_info.personal_email}`}
                            >
                                ℹ️
                            </span>
                         )}
                     </label>
                     <input
                         type="text"
                         id="personal_info.personal_email"
                         className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                         value={formData.personal_info.personal_email || ''}
                         onChange={handleTextChange}
                     />
                 </div>
                  <div className="mb-5">
                     <label htmlFor="personal_info.work_number" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                         Work Number
                          {exampleJson && exampleJson.personal_info && exampleJson.personal_info.hasOwnProperty('work_number') && (
                              <span
                                className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                onClick={() => populateFieldWithExample('personal_info.work_number')}
                                 title={`Esempio: ${exampleJson.personal_info.work_number}`}
                            >
                                ℹ️
                            </span>
                         )}
                     </label>
                     <input
                         type="text"
                         id="personal_info.work_number"
                         className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                         value={formData.personal_info.work_number || ''}
                         onChange={handleTextChange}
                     />
                 </div>
                  <div className="mb-5">
                     <label htmlFor="personal_info.instagram" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                         Instagram
                          {exampleJson && exampleJson.personal_info && exampleJson.personal_info.hasOwnProperty('instagram') && (
                              <span
                                className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                onClick={() => populateFieldWithExample('personal_info.instagram')}
                                 title={`Esempio: ${exampleJson.personal_info.instagram}`}
                            >
                                ℹ️
                            </span>
                         )}
                     </label>
                     <input
                         type="text"
                         id="personal_info.instagram"
                         className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                         value={formData.personal_info.instagram || ''}
                         onChange={handleTextChange}
                     />
                 </div>
             </div>

               <div className="mb-5">
                <label htmlFor="skills_label" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Skills Label
                     {exampleJson && exampleJson.hasOwnProperty('skills_label') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('skills_label')}
                             title={`Esempio: ${exampleJson.skills_label}`}
                        >
                            ℹ️
                        </span>
                     )}
                </label>
                <input type="text" id="skills_label" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.skills_label || ''} onChange={handleTextChange} />
            </div>
              <div className="mb-5">
                <label htmlFor="languages_label" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Languages Label
                     {exampleJson && exampleJson.hasOwnProperty('languages_label') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('languages_label')}
                             title={`Esempio: ${exampleJson.languages_label}`}
                        >
                            ℹ️
                        </span>
                     )}
                </label>
                <input type="text" id="languages_label" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.languages_label || ''} onChange={handleTextChange} />
            </div>
               <div className="mb-5">
                <label htmlFor="personal_info_label" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Personal Info Label
                     {exampleJson && exampleJson.hasOwnProperty('personal_info_label') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('personal_info_label')}
                             title={`Esempio: ${exampleJson.personal_info_label}`}
                        >
                            ℹ️
                        </span>
                     )}
                </label>
                <input type="text" id="personal_info_label" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.personal_info_label || ''} onChange={handleTextChange} />
            </div>
              <div className="mb-5">
                <label htmlFor="my_expertise_label" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    My Expertise Label
                     {exampleJson && exampleJson.hasOwnProperty('my_expertise_label') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('my_expertise_label')}
                             title={`Esempio: ${exampleJson.my_expertise_label}`}
                        >
                            ℹ️
                        </span>
                     )}
                </label>
                <input type="text" id="my_expertise_label" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.my_expertise_label || ''} onChange={handleTextChange} />
            </div>
             <div className="mb-5">
                <label htmlFor="education_label" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Education Label
                     {exampleJson && exampleJson.hasOwnProperty('education_label') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('education_label')}
                             title={`Esempio: ${exampleJson.education_label}`}
                        >
                            ℹ️
                        </span>
                     )}
                </label>
                <input type="text" id="education_label" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.education_label || ''} onChange={handleTextChange} />
            </div>
             <div className="mb-5">
                <label htmlFor="work_experience_label" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Work Experience Label
                     {exampleJson && exampleJson.hasOwnProperty('work_experience_label') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('work_experience_label')}
                             title={`Esempio: ${exampleJson.work_experience_label}`}
                        >
                            ℹ️
                        </span>
                     )}
                </label>
                <input type="text" id="work_experience_label" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.work_experience_label || ''} onChange={handleTextChange} />
            </div>
              <div className="mb-5">
                <label htmlFor="my_service_label" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    My Service Label
                     {exampleJson && exampleJson.hasOwnProperty('my_service_label') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('my_service_label')}
                             title={`Esempio: ${exampleJson.my_service_label}`}
                        >
                            ℹ️
                        </span>
                     )}
                </label>
                <input type="text" id="my_service_label" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.my_service_label || ''} onChange={handleTextChange} />
            </div>
             <div className="mb-5">
                <label htmlFor="contact_label" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Contact Label
                     {exampleJson && exampleJson.hasOwnProperty('contact_label') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('contact_label')}
                             title={`Esempio: ${exampleJson.contact_label}`}
                        >
                            ℹ️
                        </span>
                     )}
                </label>
                <input type="text" id="contact_label" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.contact_label || ''} onChange={handleTextChange} />
            </div>
              <div className="mb-5">
                <label htmlFor="pricing_packs_label" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Pricing Packs Label
                     {exampleJson && exampleJson.hasOwnProperty('pricing_packs_label') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('pricing_packs_label')}
                             title={`Esempio: ${exampleJson.pricing_packs_label}`}
                        >
                            ℹ️
                        </span>
                     )}
                </label>
                <input type="text" id="pricing_packs_label" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.pricing_packs_label || ''} onChange={handleTextChange} />
            </div>
            <div className="mb-5">
                <label htmlFor="freelancing_label" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Freelancing Label
                     {exampleJson && exampleJson.hasOwnProperty('freelancing_label') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('freelancing_label')}
                             title={`Esempio: ${exampleJson.freelancing_label}`}
                        >
                            ℹ️
                        </span>
                     )}
                </label>
                <input type="text" id="freelancing_label" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.freelancing_label || ''} onChange={handleTextChange} />
            </div>
            <div className="mb-5">
                <label htmlFor="hire_me_label" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Hire Me Label
                     {exampleJson && exampleJson.hasOwnProperty('hire_me_label') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('hire_me_label')}
                             title={`Esempio: ${exampleJson.hire_me_label}`}
                        >
                            ℹ️
                        </span>
                     )}
                </label>
                <input type="text" id="hire_me_label" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.hire_me_label || ''} onChange={handleTextChange} />
            </div>
             <div className="mb-5">
                <label htmlFor="my_portfolio_label" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    My Portfolio Label
                     {exampleJson && exampleJson.hasOwnProperty('my_portfolio_label') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('my_portfolio_label')}
                             title={`Esempio: ${exampleJson.my_portfolio_label}`}
                        >
                            ℹ️
                        </span>
                     )}
                </label>
                <input type="text" id="my_portfolio_label" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.my_portfolio_label || ''} onChange={handleTextChange} />
            </div>
             <div className="mb-5">
                <label htmlFor="latest_label" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Latest Label
                     {exampleJson && exampleJson.hasOwnProperty('latest_label') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('latest_label')}
                             title={`Esempio: ${exampleJson.latest_label}`}
                        >
                            ℹ️
                        </span>
                     )}
                </label>
                <input type="text" id="latest_label" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.latest_label || ''} onChange={handleTextChange} />
            </div>
              <div className="mb-5">
                <label htmlFor="news_label" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    News Label
                     {exampleJson && exampleJson.hasOwnProperty('news_label') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('news_label')}
                             title={`Esempio: ${exampleJson.news_label}`}
                        >
                            ℹ️
                        </span>
                     )}
                </label>
                <input type="text" id="news_label" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.news_label || ''} onChange={handleTextChange} />
            </div>
              <div className="mb-5">
                <label htmlFor="form_title" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Form Title
                     {exampleJson && exampleJson.hasOwnProperty('form_title') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('form_title')}
                             title={`Esempio: ${exampleJson.form_title}`}
                        >
                            ℹ️
                        </span>
                     )}
                </label>
                <input type="text" id="form_title" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.form_title || ''} onChange={handleTextChange} />
            </div>
             <div className="mb-5">
                <label htmlFor="form_placeholder_name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Form Placeholder Name
                     {exampleJson && exampleJson.hasOwnProperty('form_placeholder_name') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('form_placeholder_name')}
                             title={`Esempio: ${exampleJson.form_placeholder_name}`}
                        >
                            ℹ️
                        </span>
                     )}
                </label>
                <input type="text" id="form_placeholder_name" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.form_placeholder_name || ''} onChange={handleTextChange} />
            </div>
              <div className="mb-5">
                <label htmlFor="form_placeholder_email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Form Placeholder Email
                     {exampleJson && exampleJson.hasOwnProperty('form_placeholder_email') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('form_placeholder_email')}
                             title={`Esempio: ${exampleJson.form_placeholder_email}`}
                        >
                            ℹ️
                        </span>
                     )}
                </label>
                <input type="text" id="form_placeholder_email" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.form_placeholder_email || ''} onChange={handleTextChange} />
            </div>
             <div className="mb-5">
                <label htmlFor="form_placeholder_message" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Form Placeholder Message
                     {exampleJson && exampleJson.hasOwnProperty('form_placeholder_message') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('form_placeholder_message')}
                             title={`Esempio: ${exampleJson.form_placeholder_message}`}
                        >
                            ℹ️
                        </span>
                     )}
                </label>
                <input type="text" id="form_placeholder_message" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.form_placeholder_message || ''} onChange={handleTextChange} />
            </div>
              <div className="mb-5">
                <label htmlFor="form_button_text" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Form Button Text
                     {exampleJson && exampleJson.hasOwnProperty('form_button_text') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('form_button_text')}
                             title={`Esempio: ${exampleJson.form_button_text}`}
                        >
                            ℹ️
                        </span>
                     )}
                </label>
                <input type="text" id="form_button_text" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.form_button_text || ''} onChange={handleTextChange} />
            </div>
             <div className="mb-5">
                <label htmlFor="contact_title" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Contact Title
                     {exampleJson && exampleJson.hasOwnProperty('contact_title') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('contact_title')}
                             title={`Esempio: ${exampleJson.contact_title}`}
                        >
                            ℹ️
                        </span>
                     )}
                </label>
                <input type="text" id="contact_title" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.contact_title || ''} onChange={handleTextChange} />
            </div>
              <div className="mb-5">
                <label htmlFor="phone_label" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Phone Label
                     {exampleJson && exampleJson.hasOwnProperty('phone_label') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('phone_label')}
                             title={`Esempio: ${exampleJson.phone_label}`}
                        >
                            ℹ️
                        </span>
                     )}
                </label>
                <input type="text" id="phone_label" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.phone_label || ''} onChange={handleTextChange} />
            </div>
             <div className="mb-5">
                <label htmlFor="phone_number" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Phone Number
                     {exampleJson && exampleJson.hasOwnProperty('phone_number') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('phone_number')}
                             title={`Esempio: ${exampleJson.phone_number}`}
                        >
                            ℹ️
                        </span>
                     )}
                </label>
                <input type="text" id="phone_number" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.phone_number || ''} onChange={handleTextChange} />
            </div>
             <div className="mb-5">
                <label htmlFor="address_label" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Address Label
                     {exampleJson && exampleJson.hasOwnProperty('address_label') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('address_label')}
                             title={`Esempio: ${exampleJson.address_label}`}
                        >
                            ℹ️
                        </span>
                     )}
                </label>
                <input type="text" id="address_label" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.address_label || ''} onChange={handleTextChange} />
            </div>
              <div className="mb-5">
                <label htmlFor="address" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Address
                     {exampleJson && exampleJson.hasOwnProperty('address') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('address')}
                             title={`Esempio: ${exampleJson.address}`}
                        >
                            ℹ️
                        </span>
                     )}
                </label>
                <input type="text" id="address" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.address || ''} onChange={handleTextChange} />
            </div>
             <div className="mb-5">
                <label htmlFor="email_label" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Email Label
                     {exampleJson && exampleJson.hasOwnProperty('email_label') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('email_label')}
                             title={`Esempio: ${exampleJson.email_label}`}
                        >
                            ℹ️
                        </span>
                     )}
                </label>
                <input type="text" id="email_label" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.email_label || ''} onChange={handleTextChange} />
            </div>
              <div className="mb-5">
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Email
                     {exampleJson && exampleJson.hasOwnProperty('email') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('email')}
                             title={`Esempio: ${exampleJson.email}`}
                        >
                            ℹ️
                        </span>
                     )}
                </label>
                <input type="text" id="email" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.email || ''} onChange={handleTextChange} />
            </div>


           {/* Sezione dinamica per Portfolio Items - Aggiunta icona */}
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
                         <label htmlFor={`portfolio_items_${index}_title`} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                             Title
                              {exampleJson && exampleJson.portfolio_items && exampleJson.portfolio_items[index] && exampleJson.portfolio_items[index].hasOwnProperty('title') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('portfolio_items', 'title', index)}
                                      title={`Esempio: ${exampleJson.portfolio_items[index].title}`}
                                 >
                                     ℹ️
                                 </span>
                              )}
                         </label>
                         <input
                            type="text"
                            id={`portfolio_items_${index}_title`}
                            className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={item.title || ''} // Usa || '' per gestire null/undefined
                            onChange={(e) => handleArrayItemTextChange('portfolio_items', index, 'title', e.target.value)}
                         />
                     </div>
                     <div className="mb-5">
                         <label htmlFor={`portfolio_items_${index}_subtitle`} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                             Subtitle
                             {exampleJson && exampleJson.portfolio_items && exampleJson.portfolio_items[index] && exampleJson.portfolio_items[index].hasOwnProperty('subtitle') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('portfolio_items', 'subtitle', index)}
                                      title={`Esempio: ${exampleJson.portfolio_items[index].subtitle}`}
                                 >
                                     ℹ️
                                 </span>
                              )}
                         </label>
                         <input
                            type="text"
                            id={`portfolio_items_${index}_subtitle`}
                            className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={item.subtitle || ''}
                             onChange={(e) => handleArrayItemTextChange('portfolio_items', index, 'subtitle', e.target.value)}
                         />
                     </div>
                      <div className="mb-5">
                         <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor={`portfolio_items_${index}_alt`}>
                             Alt Text / Link
                              {exampleJson && exampleJson.portfolio_items && exampleJson.portfolio_items[index] && exampleJson.portfolio_items[index].hasOwnProperty('alt') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('portfolio_items', 'alt', index)}
                                      title={`Esempio: ${exampleJson.portfolio_items[index].alt}`}
                                 >
                                     ℹ️
                                 </span>
                              )}
                         </label>
                         <input
                            type="text"
                            id={`portfolio_items_${index}_alt`}
                            className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={item.alt || ''}
                            onChange={(e) => handleArrayItemTextChange('portfolio_items', index, 'alt', e.target.value)}
                         />
                     </div>
                      {/* Il campo immagine è un file input e non viene popolato con testo */}
                      <div className="mb-5">
                         <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor={`portfolio_items_${index}_image`}>Image</label>
                         <input
                            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                            id={`portfolio_items_${index}_image`}
                            type="file"
                            onChange={(e) => handleArrayItemImageChange('portfolio_items', index, e.target.files[0])}
                            accept="image/*"
                         />
                          {item.image && ( // Mostra il nome del file o percorso esistente
                              <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">{item.image}</p>
                          )}
                     </div>
                 </div>
             ))}
             {/* Puoi aggiungere qui la logica per popolare automaticamente i primi elementi se exampleJson è disponibile */}
             <Button type="button" onClick={addPortfolioItem}>Aggiungi Portfolio Item</Button>
          </div>


           {/* Sezione dinamica per Blog Posts - Aggiunta icona */}
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
                         <label htmlFor={`blog_posts_${index}_title`} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                             Title
                             {exampleJson && exampleJson.blog_posts && exampleJson.blog_posts[index] && exampleJson.blog_posts[index].hasOwnProperty('title') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('blog_posts', 'title', index)}
                                      title={`Esempio: ${exampleJson.blog_posts[index].title}`}
                                 >
                                     ℹ️
                                 </span>
                              )}
                         </label>
                         <input
                            type="text"
                            id={`blog_posts_${index}_title`}
                            className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={item.title || ''}
                             onChange={(e) => handleArrayItemTextChange('blog_posts', index, 'title', e.target.value)}
                         />
                     </div>
                      <div className="mb-5">
                         <label htmlFor={`blog_posts_${index}_author`} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                             Author
                             {exampleJson && exampleJson.blog_posts && exampleJson.blog_posts[index] && exampleJson.blog_posts[index].hasOwnProperty('author') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('blog_posts', 'author', index)}
                                      title={`Esempio: ${exampleJson.blog_posts[index].author}`}
                                 >
                                     ℹ️
                                 </span>
                              )}
                         </label>
                         <input
                            type="text"
                            id={`blog_posts_${index}_author`}
                            className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={item.author || ''}
                             onChange={(e) => handleArrayItemTextChange('blog_posts', index, 'author', e.target.value)}
                         />
                     </div>
                      {/* Il campo immagine è un file input */}
                       <div className="mb-5">
                         <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor={`blog_posts_${index}_image`}>Image</label>
                         <input
                            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                            id={`blog_posts_${index}_image`}
                            type="file"
                            onChange={(e) => handleArrayItemImageChange('blog_posts', index, e.target.files[0])}
                            accept="image/*"
                         />
                         {item.image && ( // Mostra il nome del file o percorso esistente
                              <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">{item.image}</p>
                          )}
                     </div>
                      <div className="mb-5">
                         <label htmlFor={`blog_posts_${index}_alt`} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                             Alt Text / Link
                             {exampleJson && exampleJson.blog_posts && exampleJson.blog_posts[index] && exampleJson.blog_posts[index].hasOwnProperty('alt') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('blog_posts', 'alt', index)}
                                      title={`Esempio: ${exampleJson.blog_posts[index].alt}`}
                                 >
                                     ℹ️
                                 </span>
                              )}
                         </label>
                         <input
                            type="text"
                            id={`blog_posts_${index}_alt`}
                            className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={item.alt || ''}
                             onChange={(e) => handleArrayItemTextChange('blog_posts', index, 'alt', e.target.value)}
                         />
                     </div>
                     <div className="mb-5">
                         <label htmlFor={`blog_posts_${index}_description`} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                             Description
                             {exampleJson && exampleJson.blog_posts && exampleJson.blog_posts[index] && exampleJson.blog_posts[index].hasOwnProperty('description') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('blog_posts', 'description', index)}
                                      title={`Esempio: ${exampleJson.blog_posts[index].description}`}
                                 >
                                     ℹ️
                                 </span>
                              )}
                         </label>
                         <textarea
                            id={`blog_posts_${index}_description`}
                            className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={item.description || ''}
                            onChange={(e) => handleArrayItemTextChange('blog_posts', index, 'description', e.target.value)}
                            rows="3"
                         ></textarea>
                     </div>
                      <div className="mb-5">
                         <label htmlFor={`blog_posts_${index}_full_description`} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                             Full Description
                              {exampleJson && exampleJson.blog_posts && exampleJson.blog_posts[index] && exampleJson.blog_posts[index].hasOwnProperty('full_description') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('blog_posts', 'full_description', index)}
                                      title={`Esempio: ${exampleJson.blog_posts[index].full_description}`}
                                 >
                                     ℹ️
                                 </span>
                              )}
                         </label>
                         <textarea
                            id={`blog_posts_${index}_full_description`}
                            className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={item.full_description || ''}
                             onChange={(e) => handleArrayItemTextChange('blog_posts', index, 'full_description', e.target.value)}
                             rows="5"
                         ></textarea>
                     </div>
                      <div className="mb-5">
                         <label htmlFor={`blog_posts_${index}_read_more_url`} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                             Read More URL
                             {exampleJson && exampleJson.blog_posts && exampleJson.blog_posts[index] && exampleJson.blog_posts[index].hasOwnProperty('read_more_url') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('blog_posts', 'read_more_url', index)}
                                      title={`Esempio: ${exampleJson.blog_posts[index].read_more_url}`}
                                 >
                                     ℹ️
                                 </span>
                              )}
                         </label>
                         <input
                            type="text"
                            id={`blog_posts_${index}_read_more_url`}
                            className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={item.read_more_url || ''}
                             onChange={(e) => handleArrayItemTextChange('blog_posts', index, 'read_more_url', e.target.value)}
                         />
                     </div>
                      {/* Puoi aggiungere likes_html e comments_html se vuoi gestirli */}
                 </div>
             ))}
             {/* Puoi aggiungere qui la logica per popolare automaticamente i primi elementi se exampleJson è disponibile */}
             <Button type="button" onClick={addBlogPost}>Aggiungi Blog Post</Button>
          </div>
           {/* Aggiungi qui sezioni dinamiche per altri array (skills, education_list, ecc.) in modo simile */}
           {/* Questo richiederà l'implementazione della logica di aggiunta/rimozione e handler per ogni array */}
           {/* Esempio per skills (solo i campi name e level) - Aggiunta icona */}
            <div className="mb-5 mt-10 border-t pt-4">
             <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Skills</h4>
             {/* Aggiungi un bottone o logica per aggiungere una nuova skill vuota se l'array estratto è vuoto */}
             {formData.skills.map((item, index) => (
                 <div key={index} className="mb-4 p-3 border rounded-lg dark:border-gray-700 relative flex items-center space-x-4">
                      <button
                         type="button"
                         onClick={() => setFormData(prev => ({...prev, skills: prev.skills.filter((_, i) => i !== index)}))}
                         className=" text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-700"
                     >
                        Rimuovi
                     </button>
                    <div className="flex-grow">
                         <label htmlFor={`skills_${index}_name`} className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
                             Skill Name
                              {exampleJson && exampleJson.skills && exampleJson.skills[index] && exampleJson.skills[index].hasOwnProperty('name') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('skills', 'name', index)}
                                      title={`Esempio: ${exampleJson.skills[index].name}`}
                                 >
                                     ℹ️
                                 </span>
                              )}
                         </label>
                         <input
                            type="text"
                            id={`skills_${index}_name`}
                            className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={item.name || ''}
                            onChange={(e) => handleArrayItemTextChange('skills', index, 'name', e.target.value)}
                         />
                     </div>
                     <div className="flex-grow">
                         <label htmlFor={`skills_${index}_level`} className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
                             Level
                              {exampleJson && exampleJson.skills && exampleJson.skills[index] && exampleJson.skills[index].hasOwnProperty('level') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('skills', 'level', index)}
                                      title={`Esempio: ${exampleJson.skills[index].level}`}
                                 >
                                     ℹ️
                                 </span>
                              )}
                         </label>
                         <input
                            type="text"
                            id={`skills_${index}_level`}
                            className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={item.level || ''}
                            onChange={(e) => handleArrayItemTextChange('skills', index, 'level', e.target.value)}
                         />
                     </div>
                 </div>
             ))}
             {/* Puoi aggiungere qui la logica per popolare automaticamente i primi elementi se exampleJson è disponibile */}
             <Button type="button" onClick={() => setFormData(prev => ({...prev, skills: [...prev.skills, { name: "", level: "" }]}))}>Aggiungi Skill</Button>
            </div>

            {/* Esempio per education_list - Aggiunta icona */}
            <div className="mb-5 mt-10 border-t pt-4">
             <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Education</h4>
             {formData.education_list.map((item, index) => (
                 <div key={index} className="mb-4 p-3 border rounded-lg dark:border-gray-700 relative">
                      <button
                         type="button"
                         onClick={() => setFormData(prev => ({...prev, education_list: prev.education_list.filter((_, i) => i !== index)}))}
                         className="absolute top-2 right-2 text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-700"
                     >
                        Rimuovi
                     </button>
                    <h5 className="text-md font-medium text-gray-900 dark:text-white mb-3">Item #{index + 1}</h5>
                    <div className="mb-5">
                         <label htmlFor={`education_list_${index}_period`} className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
                             Period
                             {exampleJson && exampleJson.education_list && exampleJson.education_list[index] && exampleJson.education_list[index].hasOwnProperty('period') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('education_list', 'period', index)}
                                      title={`Esempio: ${exampleJson.education_list[index].period}`}
                                 >
                                     ℹ️
                                 </span>
                              )}
                         </label>
                         <input
                            type="text"
                            id={`education_list_${index}_period`}
                            className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={item.period || ''}
                            onChange={(e) => handleArrayItemTextChange('education_list', index, 'period', e.target.value)}
                         />
                     </div>
                      <div className="mb-5">
                         <label htmlFor={`education_list_${index}_title`} className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
                             Title
                             {exampleJson && exampleJson.education_list && exampleJson.education_list[index] && exampleJson.education_list[index].hasOwnProperty('title') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('education_list', 'title', index)}
                                      title={`Esempio: ${exampleJson.education_list[index].title}`}
                                 >
                                     ℹ️
                                 </span>
                              )}
                         </label>
                         <input
                            type="text"
                            id={`education_list_${index}_title`}
                            className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={item.title || ''}
                            onChange={(e) => handleArrayItemTextChange('education_list', index, 'title', e.target.value)}
                         />
                     </div>
                     <div className="mb-5">
                         <label htmlFor={`education_list_${index}_subtitle`} className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
                             Subtitle
                              {exampleJson && exampleJson.education_list && exampleJson.education_list[index] && exampleJson.education_list[index].hasOwnProperty('subtitle') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('education_list', 'subtitle', index)}
                                      title={`Esempio: ${exampleJson.education_list[index].subtitle}`}
                                 >
                                     ℹ️
                                 </span>
                              )}
                         </label>
                         <textarea
                            id={`education_list_${index}_subtitle`}
                            className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={item.subtitle || ''}
                            onChange={(e) => handleArrayItemTextChange('education_list', index, 'subtitle', e.target.value)}
                            rows={3}
                         ></textarea>
                     </div>
                 </div>
             ))}
              {/* Puoi aggiungere qui la logica per popolare automaticamente i primi elementi se exampleJson è disponibile */}
             <Button type="button" onClick={() => setFormData(prev => ({...prev, education_list: [...prev.education_list, { period: "", title: "", subtitle: "" }]}))}>Aggiungi Education Item</Button>
            </div>

            {/* Esempio per work_experience_list - Aggiunta icona */}
            <div className="mb-5 mt-10 border-t pt-4">
             <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Work Experience</h4>
             {formData.work_experience_list.map((item, index) => (
                 <div key={index} className="mb-4 p-3 border rounded-lg dark:border-gray-700 relative">
                      <button
                         type="button"
                         onClick={() => setFormData(prev => ({...prev, work_experience_list: prev.work_experience_list.filter((_, i) => i !== index)}))}
                         className="absolute top-2 right-2 text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-700"
                     >
                        Rimuovi
                     </button>
                    <h5 className="text-md font-medium text-gray-900 dark:text-white mb-3">Item #{index + 1}</h5>
                    <div className="mb-5">
                         <label htmlFor={`work_experience_list_${index}_period`} className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
                             Period
                             {exampleJson && exampleJson.work_experience_list && exampleJson.work_experience_list[index] && exampleJson.work_experience_list[index].hasOwnProperty('period') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('work_experience_list', 'period', index)}
                                      title={`Esempio: ${exampleJson.work_experience_list[index].period}`}
                                 >
                                     ℹ️
                                 </span>
                              )}
                         </label>
                         <input
                            type="text"
                            id={`work_experience_list_${index}_period`}
                            className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={item.period || ''}
                            onChange={(e) => handleArrayItemTextChange('work_experience_list', index, 'period', e.target.value)}
                         />
                     </div>
                      <div className="mb-5">
                         <label htmlFor={`work_experience_list_${index}_title`} className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
                             Title
                             {exampleJson && exampleJson.work_experience_list && exampleJson.work_experience_list[index] && exampleJson.work_experience_list[index].hasOwnProperty('title') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('work_experience_list', 'title', index)}
                                      title={`Esempio: ${exampleJson.work_experience_list[index].title}`}
                                 >
                                     ℹ️
                                 </span>
                              )}
                         </label>
                         <input
                            type="text"
                            id={`work_experience_list_${index}_title`}
                            className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={item.title || ''}
                            onChange={(e) => handleArrayItemTextChange('work_experience_list', index, 'title', e.target.value)}
                         />
                     </div>
                     <div className="mb-5">
                         <label htmlFor={`work_experience_list_${index}_subtitle`} className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
                             Subtitle
                             {exampleJson && exampleJson.work_experience_list && exampleJson.work_experience_list[index] && exampleJson.work_experience_list[index].hasOwnProperty('subtitle') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('work_experience_list', 'subtitle', index)}
                                      title={`Esempio: ${exampleJson.work_experience_list[index].subtitle}`}
                                 >
                                     ℹ️
                                 </span>
                              )}
                         </label>
                         <textarea
                            id={`work_experience_list_${index}_subtitle`}
                            className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={item.subtitle || ''}
                            onChange={(e) => handleArrayItemTextChange('work_experience_list', index, 'subtitle', e.target.value)}
                            rows={3}
                         ></textarea>
                     </div>
                 </div>
             ))}
               {/* Puoi aggiungere qui la logica per popolare automaticamente i primi elementi se exampleJson è disponibile */}
             <Button type="button" onClick={() => setFormData(prev => ({...prev, work_experience_list: [...prev.work_experience_list, { period: "", title: "", subtitle: "" }]}))}>Aggiungi Work Experience Item</Button>
            </div>

             {/* Esempio per languages - Aggiunta icona */}
            <div className="mb-5 mt-10 border-t pt-4">
             <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Languages</h4>
             {formData.languages.map((item, index) => (
                 <div key={index} className="mb-4 p-3 border rounded-lg dark:border-gray-700 relative flex items-center space-x-4">
                      <button
                         type="button"
                         onClick={() => setFormData(prev => ({...prev, languages: prev.languages.filter((_, i) => i !== index)}))}
                         className=" text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-700"
                     >
                        Rimuovi
                     </button>
                    <div className="flex-grow">
                         <label htmlFor={`languages_${index}_name`} className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
                             Language Name
                              {exampleJson && exampleJson.languages && exampleJson.languages[index] && exampleJson.languages[index].hasOwnProperty('name') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('languages', 'name', index)}
                                      title={`Esempio: ${exampleJson.languages[index].name}`}
                                 >
                                     ℹ️
                                 </span>
                              )}
                         </label>
                         <input
                            type="text"
                            id={`languages_${index}_name`}
                            className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={item.name || ''}
                            onChange={(e) => handleArrayItemTextChange('languages', index, 'name', e.target.value)}
                         />
                     </div>
                     <div className="flex-grow">
                         <label htmlFor={`languages_${index}_level`} className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
                             Level
                             {exampleJson && exampleJson.languages && exampleJson.languages[index] && exampleJson.languages[index].hasOwnProperty('level') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('languages', 'level', index)}
                                      title={`Esempio: ${exampleJson.languages[index].level}`}
                                 >
                                     ℹ️
                                 </span>
                              )}
                         </label>
                         <input
                            type="text"
                            id={`languages_${index}_level`}
                            className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={item.level || ''}
                            onChange={(e) => handleArrayItemTextChange('languages', index, 'level', e.target.value)}
                         />
                     </div>
                 </div>
             ))}
              {/* Puoi aggiungere qui la logica per popolare automaticamente i primi elementi se exampleJson è disponibile */}
             <Button type="button" onClick={() => setFormData(prev => ({...prev, languages: [...prev.languages, { name: "", level: "" }]}))}>Aggiungi Language</Button>
            </div>

            {/* Aggiungi qui le altre sezioni dinamiche (expertise_list, services, statistics, pricing_packs) in modo simile, aggiungendo l'icona per ogni campo come mostrato sopra. */}
            {/* Ricorda di adattare `populateArrayItemFieldWithExample` per ogni tipo di array e i suoi campi. */}


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