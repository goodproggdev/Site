import { useState, useEffect, useRef } from "react"; // Importa useRef
import { Button, Modal, Spinner } from "flowbite-react";
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// Importa i JSON di default per ogni categoria
// Assicurati che i percorsi siano corretti nel tuo progetto
import defaultDataLogistica from './logistica.json';
import defaultDataAmministra from './amministra.json';
import defaultDataCommerciale from './commerciale.json';
import defaultDataSanita from './sanita.json';
import defaultDataTecnico from './Tecnico.json';
import defaultDataIT from './IT.json';

// Mappa le chiavi delle categorie ai dati JSON importati e ai nomi dei file di output
const categoryDataMap = {
    'digitale-it': { data: defaultDataIT, fileName: 'IT.json' },
    'ingegneri-tecnici': { data: defaultDataTecnico, fileName: 'Tecnico.json' },
    'sanitari-assistenziali': { data: defaultDataSanita, fileName: 'sanita.json' },
    'commerciale-vendita': { data: defaultDataCommerciale, fileName: 'commerciale.json' },
    'amministrative-finanziarie': { data: defaultDataAmministra, fileName: 'amministra.json' },
    'logistica': { data: defaultDataLogistica, fileName: 'logistica.json' },
};

// Definisci una struttura JSON iniziale vuota come base per lo stato
// Usiamo la struttura del primo JSON come riferimento, ma con campi vuoti
const initialJsonStructure = {
	"name": "",
	"presentation": "",
	"header_mono_subtitle": "",
	"print_resume": "",
	"download_my_cv": "",
	"social_links": { "facebook": "", "twitter": "", "instagram": "", "github": "" },
	"my_resume_label": { "my": "", "resume": "" },
	"who_am_i": "",
	"about": { "who": "", "details": "" },
	"personal_info": { "birthdate": "", "work_email": "", "personal_email": "", "work_number": "", "instagram": "" },
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


// Funzione per verificare se un valore è "vuoto"
const isEmptyValue = (value) => {
    return value === null || value === undefined ||
           (typeof value === 'string' && value.trim() === '') ||
           (Array.isArray(value) && value.length === 0) ||
           (typeof value === 'object' && value !== null && Object.keys(value).length === 0 && !Array.isArray(value));
};

// Funzione ricorsiva per ottenere un valore nidificato in modo sicuro
const getNestedValue = (data, keys) => {
    let current = data;
    if (!data || typeof data !== 'object') return undefined; // Gestisce caso base non oggetto

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
         if (current && typeof current === 'object' && current.hasOwnProperty(key)) {
             current = current[key];
         } else {
             return undefined; // Percorso non esiste
         }
    }
    return current;
};


// Funzione di merge: i dati di origine (es. CV parsato) sovrascrivono la destinazione SOLO SE NON SONO VUOTI
// Utilizzata quando si applicano i dati parsati dal CV.
const mergeSourceDataIfNotEmpty = (destinationData, sourceData) => {
    const newData = { ...destinationData }; // Inizia con una copia dei dati di destinazione

    if (sourceData) {
        for (const key in sourceData) {
            if (sourceData.hasOwnProperty(key)) {
                const sourceValue = sourceData[key];
                const destinationValue = newData[key];

                // Se il valore di origine NON è vuoto, usalo
                if (!isEmptyValue(sourceValue)) {
                    if (Array.isArray(sourceValue)) {
                        // Se il valore di origine è un array (non vuoto), sostituisci l'array nella destinazione
                        newData[key] = [...sourceValue]; // Copia l'array
                    } else if (typeof sourceValue === 'object' && sourceValue !== null && typeof destinationValue === 'object' && destinationValue !== null && !Array.isArray(destinationValue)) {
                        // Se entrambi (origine e destinazione) sono oggetti non null e non array, fai un merge ricorsivo
                         newData[key] = mergeSourceDataIfNotEmpty(destinationValue, sourceValue);
                    } else {
                        // Per valori primitivi non vuoti o in caso di mismatch di tipo dove sourceValue non è un oggetto/array,
                        // il valore di origine sovrascrive la destinazione.
                        newData[key] = sourceValue;
                    }
                }
                // Se il valore di origine è vuoto, non facciamo nulla, mantenendo il destinationValue originale.
            }
        }
    }
    return newData;
};

// Funzione di merge: i dati di origine (es. default categoria) riempiono la destinazione SOLO SE IL CAMPO NELLA DESTINAZIONE
// È VUOTO O CORRISPONDE AI DATI DI DEFAULT PRECEDENTEMENTE APPLICATI.
// Utilizzata quando si cambia categoria.
// Funzione di merge modificata: i dati di origine (es. default categoria) riempiono la destinazione SOLO SE IL CAMPO NELLA DESTINAZIONE
// È VUOTO O CORRISPONDE AI DATI DI DEFAULT PRECEDENTEMENTE APPLICATI.
// Vengono applicati anche i valori vuoti/null dal nuovo default in questi casi.
// Funzione di merge modificata: i dati di origine (es. default categoria) riempiono la destinazione SOLO SE IL CAMPO NELLA DESTINAZIONE
// È VUOTO O CORRISPONDE AI DATI DI DEFAULT PRECEDENTEMENTE APPLICATI.
// Vengono applicati anche i valori vuoti/null dal nuovo default in questi casi.
// Funzione di merge modificata: i dati di origine (es. default categoria) riempiono la destinazione SOLO SE IL CAMPO NELLA DESTINAZIONE
// È VUOTO O CORRISPONDE AI DATI DI DEFAULT PRECEDENTEMENTE APPLICATI.
// Vengono applicati anche i valori vuoti/null dal nuovo default in questi casi.
const updateUntouchedGenericFields = (currentData, newGenericData, previousGenericData) => {
    const newData = { ...currentData };

    if (newGenericData) {
        for (const key in newGenericData) {
            if (newGenericData.hasOwnProperty(key)) {
                const newGenericValue = newGenericData[key];
                const currentValue = newData[key];

                // Ottieni il valore corrispondente dai dati di default precedentemente applicati
                // Usiamo la navigazione nidificata sicura se necessario
                 const previousGenericValue = previousGenericData?.[key];


                // Determina se il valore corrente nella form è vuoto OPPURE se corrisponde al valore
                // che aveva dai dati di default precedentemente applicati (e quel valore non era vuoto)
                 // Usiamo JSON.stringify per un confronto profondo di oggetti/array, che funziona per dati serializzabili.
                 // Confrontiamo solo se il previousGenericValue non era esso stesso vuoto, per evitare
                 // di considerare "intoccato" un campo sempre vuoto.
                const isCurrentValueEmptyOrMatchesPreviousGeneric = isEmptyValue(currentValue) || (
                    !isEmptyValue(previousGenericValue) && JSON.stringify(currentValue) === JSON.stringify(previousGenericValue)
                );

                // **Punto di Modifica:** Se il campo corrente è vuoto O non è stato toccato (corrisponde al default precedente),
                // applica SEMPRE il nuovo valore di default, anche se è vuoto o null.
                if (isCurrentValueEmptyOrMatchesPreviousGeneric) { // <<< Modificato: rimossa la condizione && !isEmptyValue(newGenericValue)
                    if (Array.isArray(newGenericValue)) {
                         // Se il nuovo valore di default è un array, sostituisci l'array corrente
                         newData[key] = [...newGenericValue]; // Copia l'array
                    } else if (typeof newGenericValue === 'object' && newGenericValue !== null && typeof currentValue === 'object' && currentValue !== null && !Array.isArray(currentValue)) {
                         // Se entrambi (nuovo default e corrente) sono oggetti non null e non array, fai un merge ricorsivo.
                         // Passiamo anche il corrispondente sotto-oggetto del previousGenericData alla chiamata ricorsiva.
                         // Nota: La ricorsione userà la stessa logica modificata.
                         newData[key] = updateUntouchedGenericFields(currentValue, newGenericValue, previousGenericData?.[key]);
                    } else {
                         // Per valori primitivi, applica il nuovo valore di default (che può essere vuoto/null)
                         newData[key] = newGenericValue;
                    }
                } else if (typeof newGenericValue === 'object' && newGenericValue !== null && typeof currentValue === 'object' && currentValue !== null && !Array.isArray(currentValue)) {
                    // Anche se il campo di primo livello non è vuoto o non corrisponde al default precedente,
                    // dobbiamo comunque fare un merge ricorsivo per riempire eventuali campi vuoti o intoccati
                    // ALL'INTERNO di quell'oggetto nidificato.
                    // Nota: La ricorsione userà la stessa logica modificata.
                     newData[key] = updateUntouchedGenericFields(currentValue, newGenericValue, previousGenericData?.[key]);
                }
                 // Altrimenti (il campo corrente non è vuoto e non corrisponde al default precedente), manteniamo il currentValue originale.
            }
        }
    }
    return newData;
};

const UploadModal = ({ isOpen, onClose }) => {
  // Stato principale che riflette la struttura del JSON
  const [formData, setFormData] = useState(initialJsonStructure);

  // Stato per tenere i file immagine selezionati, indicizzati per array e indice
  const [selectedImageFiles, setSelectedImageFiles] = useState({});

  // Stato per tenere il file CV selezionato
   const [selectedCVFile, setSelectedCVFile] = useState(null);

   // Stato per gestire lo stato di caricamento durante il parsing
   const [isParsing, setIsParsing] = useState(false);
   // Stato per gestire eventuali errori di parsing
    const [parsingError, setParsingError] = useState(null);

    // Stato per memorizzare la categoria selezionata
    // Inizializza con la prima categoria di default ('digitale-it')
    const [selectedCategory, setSelectedCategory] = useState('digitale-it');

     // Ref per memorizzare i dati di default della categoria *precedentemente* applicata.
     // Usiamo useRef perché non vogliamo che il suo cambiamento causi un re-render,
     // ma vogliamo che il valore persista tra i render.
     const previousGenericDataRef = useRef(initialJsonStructure);


    // Effetto per gestire l'apertura del modal e il cambio categoria
    useEffect(() => {
        if (isOpen) {
             const newGenericData = categoryDataMap[selectedCategory]?.data || initialJsonStructure;

             setFormData(prevFormData => {
                 // Utilizza la nuova logica di merge: applica i nuovi dati di default
                 // solo ai campi che sono vuoti O che corrispondono ai dati di default precedentemente applicati.
                 const updatedFormData = updateUntouchedGenericFields(prevFormData, newGenericData, previousGenericDataRef.current);

                 // Aggiorna il ref per memorizzare i dati di default appena applicati.
                 // Questo valore sarà "previousGenericData" nella prossima esecuzione di questo useEffect
                 // dovuta a un cambio di categoria.
                 previousGenericDataRef.current = newGenericData;

                 return updatedFormData;
             });


             // Resetta file states etc.
             // Note: Resetting selectedCVFile here means if you change category after parsing,
             // the CV data won't be prioritized with the *new* generic data unless you re-upload.
             // This seems consistent with "se si cambia categoria più volte" - each category selection
             // applies the *new* default based on the *current* state.
             setSelectedImageFiles({});
             // Non resettiamo selectedCVFile qui, così sappiamo se un CV è stato caricato.
             // La form data è già stata fusa in base alla priorità del CV.
             setParsingError(null);
             setIsParsing(false);

             console.log(`Applicati nuovi dati di default per categoria: ${selectedCategory} ai campi vuoti o intoccati.`);
        }
    }, [isOpen, selectedCategory]); // Depend on modal open state and selected category


    // Reset dello stato quando il modal viene chiuso
    useEffect(() => {
        if (!isOpen) {
            setFormData(initialJsonStructure); // Resetta la form ai valori iniziali
            setSelectedCategory('digitale-it'); // Resetta la categoria selezionata al default
            setSelectedImageFiles({}); // Resetta i file immagine
            setSelectedCVFile(null); // Resetta il file CV
            setIsParsing(false); // Resetta lo stato di parsing
            setParsingError(null); // Resetta l'errore
            previousGenericDataRef.current = initialJsonStructure; // Resetta anche il ref del default precedente
        }
    }, [isOpen]);


  // Gestisce i cambiamenti negli input di testo
  const handleTextChange = (e) => {
    const { id, value } = e.target;
     // Gestisce anche i campi nidificati
    const keys = id.split('.'); // Suddivide l'id per gestire i percorsi nidificati
    setFormData(prevFormData => {
        const newData = { ...prevFormData };
        let current = newData;
        for (let i = 0; i < keys.length - 1; i++) {
            // Assicurati che la chiave esista o crea un oggetto vuoto se necessario
            if (current[keys[i]] === undefined || current[keys[i]] === null || typeof current[keys[i]] !== 'object' || Array.isArray(current[keys[i]])) {
                current[keys[i]] = {}; // Crea un oggetto vuoto se non lo è o se è un array (probabilmente un errore nella struttura)
            }
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        return newData;
    });
  };


  // Gestisce i cambiamenti negli input di testo per gli elementi degli array
  const handleArrayItemTextChange = (arrayName, index, fieldName, value) => {
        setFormData(prevFormData => {
            // Assicurati che l'array esista e sia un array
            const updatedArray = Array.isArray(prevFormData[arrayName]) ? [...prevFormData[arrayName]] : [];
            // Assicurati che l'elemento all'indice esista prima di modificarlo
            if (updatedArray[index]) {
                updatedArray[index] = {
                    ...updatedArray[index],
                    [fieldName]: value
                };
            } else {
                 // Se l'elemento non esiste (es. aggiunta tramite input diretto), creane uno nuovo.
                 // Questo caso è meno comune se si usano i bottoni "Aggiungi Item".
                 console.warn(`Aggiunta/modifica di un elemento inesistente all'indice ${index} nell'array "${arrayName}". Considera l'uso dei bottoni "Aggiungi Item".`);
                 const newItem = {};
                 newItem[fieldName] = value;
                 updatedArray[index] = newItem; // Potrebbe essere necessario gestire correttamente gli indici
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
       // Aggiorna anche il nome del file nel formData per visualizzazione immediata
       setFormData(prevFormData => {
            // Assicurati che l'array esista e sia un array
           const updatedArray = Array.isArray(prevFormData[arrayName]) ? [...prevFormData[arrayName]] : [];
            // Assicurati che l'elemento all'indice esista
           if (updatedArray[index]) {
               updatedArray[index] = {
                   ...updatedArray[index],
                   image: file ? `imgs/${file.name}` : (updatedArray[index]?.image || '') // Mantieni l'immagine esistente se nessun file è selezionato
               };
           } else {
                // Se l'elemento non esiste, creane uno nuovo con l'immagine
                 updatedArray[index] = { image: file ? `imgs/${file.name}` : '' };
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

           const formDataToSend = new FormData(); // Crea un oggetto FormData
           formDataToSend.append('cv_file', file); // Aggiungi il file CV con il nome 'cv_file' (deve corrispondere al backend)
           // Invia anche la categoria selezionata al backend - Potrebbe influenzare il parsing
           formDataToSend.append('category', selectedCategory);


           try {
               // Sostituisci con l'URL del tuo backend Flask
               const backendUrl = 'http://127.0.0.1:8000/api/parse-cv-upload/';

               const response = await fetch(backendUrl, {
                   method: 'POST',
                   body: formDataToSend // Invia il FormData con il file e la categoria
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

                // === Logica di Fusione: i dati parsati sovrascrivono solo se non sono vuoti ===
                // Questo avviene INDIPENDENTEMENTE dalla categoria selezionata al momento del parsing.
                // I dati del CV hanno la priorità sui dati correnti della form (che potrebbero essere default o modificati).
                setFormData(prevFormData => {
                    return mergeSourceDataIfNotEmpty(prevFormData, parsedData);
                });
                // ====================================================================


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


    // Funzione per popolare un campo con il valore dal *corrente* formData (che proviene dal default o dal CV parsato)
    const populateFieldWithExample = (id) => {
        const keys = id.split('.');
        let currentValue = formData; // Usa formData come sorgente

        // Naviga attraverso le chiavi per trovare il valore nel formData corrente
        for (let i = 0; i < keys.length; i++) {
            if (currentValue && typeof currentValue === 'object' && currentValue.hasOwnProperty(keys[i])) {
                currentValue = currentValue[keys[i]];
            } else {
                // Se la chiave non esiste nel formData corrente, non possiamo popolarla con un "esempio"
                console.warn(`Chiave "${id}" non trovata nel JSON corrente (categoria selezionata o dati parsati) per il popolamento esempio.`);
                return;
            }
        }

        if (currentValue !== undefined && currentValue !== null && typeof currentValue !== 'object' && !Array.isArray(currentValue)) {
            // Aggiorna lo stato formData con il valore corrente (che funge da "esempio")
            setFormData(prevFormData => {
                const newData = { ...prevFormData };
                let current = newData;
                for (let i = 0; i < keys.length - 1; i++) {
                     // Crea l'oggetto se non esiste (utile se l'esempio proviene da una struttura parziale)
                     if (!current[keys[i]] || typeof current[keys[i]] !== 'object' || Array.isArray(current[keys[i]])) current[keys[i]] = {};
                     current = current[keys[i]];
                }
                current[keys[keys.length - 1]] = currentValue; // Popola con il valore trovato nel formData attuale
                return newData;
            });
        } else if (currentValue !== undefined && currentValue !== null && typeof currentValue === 'object') {
             console.warn(`Il valore per la chiave "${id}" nel JSON corrente è un oggetto/array. Non può essere usato per popolare un campo di testo singolo.`);
        }
    };

     // Funzione per popolare un campo all'interno di un array con il valore dal *corrente* formData
    const populateArrayItemFieldWithExample = (arrayName, fieldName, index) => {
        // Controlla se l'array e l'elemento all'indice esistono nel formData corrente
        if (!formData || !formData[arrayName] || !Array.isArray(formData[arrayName]) || !formData[arrayName][index]) {
             console.warn(`Array "${arrayName}" o indice ${index} non trovati nel JSON corrente per il popolamento esempio.`);
             return;
        }

        const currentValue = formData[arrayName][index][fieldName]; // Usa formData come sorgente

         if (currentValue !== undefined && currentValue !== null && typeof currentValue !== 'object' && !Array.isArray(currentValue)) {
             handleArrayItemTextChange(arrayName, index, fieldName, currentValue); // Popola con il valore trovato
         } else if (currentValue !== undefined && currentValue !== null && typeof currentValue === 'object') {
             console.warn(`Il valore per la chiave "${fieldName}" per l'elemento ${index} nell'array "${arrayName}" nel JSON corrente è un oggetto/array. Non può essere usato per popolare un campo di testo singolo.`);
         } else {
             console.warn(`Chiave "${fieldName}" per l'elemento ${index} nell'array "${arrayName}" non trovata nel JSON corrente per il popolamento esempio.`);
         }
    };


    // Funzioni per aggiungere elementi agli array (mantengono la struttura vuota per i nuovi elementi)
    // Ho aggiunto un controllo per assicurare che l'array esista prima di aggiungere
    const addPortfolioItem = () => {
        setFormData(prevFormData => ({
            ...prevFormData,
            portfolio_items: [...(Array.isArray(prevFormData.portfolio_items) ? prevFormData.portfolio_items : []), {
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
            blog_posts: [...(Array.isArray(prevFormData.blog_posts) ? prevFormData.blog_posts : []), {
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

     const addSkill = () => {
         setFormData(prev => ({...prev, skills: [...(Array.isArray(prev.skills) ? prev.skills : []), { name: "", level: "" }]}));
     };

     const addEducationItem = () => {
         setFormData(prev => ({...prev, education_list: [...(Array.isArray(prev.education_list) ? prev.education_list : []), { period: "", title: "", subtitle: "" }]}));
     };

     const addWorkExperienceItem = () => {
         setFormData(prev => ({...prev, work_experience_list: [...(Array.isArray(prev.work_experience_list) ? prev.work_experience_list : []), { period: "", title: "", subtitle: "" }]}));
     };

      const addLanguage = () => {
         setFormData(prev => ({...prev, languages: [...(Array.isArray(prev.languages) ? prev.languages : []), { name: "", level: "" }]}));
     };

     const addExpertiseItem = () => {
         setFormData(prev => ({...prev, expertise_list: [...(Array.isArray(prev.expertise_list) ? prev.expertise_list : []), { name: "", icon_class: "", subtitle: "" }]}));
     };

      const addService = () => {
         setFormData(prev => ({...prev, services: [...(Array.isArray(prev.services) ? prev.services : []), { icon: "", icon_class: "", title: "", description: "" }]}));
     };

      const addStatistic = () => {
         setFormData(prev => ({...prev, statistics: [...(Array.isArray(prev.statistics) ? prev.statistics : []), { icon: "", count: "", label: "", icon_class: "" }]}));
     };

      const addPricingPack = () => {
         setFormData(prev => ({...prev, pricing_packs: [...(Array.isArray(prev.pricing_packs) ? prev.pricing_packs : []).filter(item => item && typeof item === 'object'), { title: "", cost: "", project: "", storage: "", domain: "", users: "", special_class: "" }]}));
        // Aggiunto un filtro per sicurezza nel caso ci siano elementi null/undefined nell'array esistente
     };


    // Funzioni per rimuovere elementi dagli array
     // Ho aggiunto un controllo per assicurare che l'array esista prima di filtrare
    const removePortfolioItem = (index) => {
        setFormData(prevFormData => {
            const updatedArray = (Array.isArray(prevFormData.portfolio_items) ? prevFormData.portfolio_items : []).filter((_, i) => i !== index);
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
            const updatedArray = (Array.isArray(prevFormData.blog_posts) ? prevFormData.blog_posts : []).filter((_, i) => i !== index);
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

     const removeSkill = (index) => {
         setFormData(prev => ({...prev, skills: (Array.isArray(prev.skills) ? prev.skills : []).filter((_, i) => i !== index)}));
     };

     const removeEducationItem = (index) => {
         setFormData(prev => ({...prev, education_list: (Array.isArray(prev.education_list) ? prev.education_list : []).filter((_, i) => i !== index)}));
     };

     const removeWorkExperienceItem = (index) => {
         setFormData(prev => ({...prev, work_experience_list: (Array.isArray(prev.work_experience_list) ? prev.work_experience_list : []).filter((_, i) => i !== index)}));
     };

     const removeLanguage = (index) => {
         setFormData(prev => ({...prev, languages: (Array.isArray(prev.languages) ? prev.languages : []).filter((_, i) => i !== index)}));
     };

      const removeExpertiseItem = (index) => {
         setFormData(prev => ({...prev, expertise_list: (Array.isArray(prev.expertise_list) ? prev.expertise_list : []).filter((_, i) => i !== index)}));
     };

      const removeService = (index) => {
         setFormData(prev => ({...prev, services: (Array.isArray(prev.services) ? prev.services : []).filter((_, i) => i !== index)}));
     };

      const removeStatistic = (index) => {
         setFormData(prev => ({...prev, statistics: (Array.isArray(prev.statistics) ? prev.statistics : []).filter((_, i) => i !== index)}));
     };

      const removePricingPack = (index) => {
         setFormData(prev => ({...prev, pricing_packs: (Array.isArray(prev.pricing_packs) ? prev.pricing_packs : []).filter((_, i) => i !== index)}));
     };


  // Gestisce l'invio del form e crea l'archivio ZIP
  const handleSubmit = async (e) => {
    e.preventDefault();

    const zip = new JSZip();
    const imgsFolder = zip.folder("imgs");

    // Utilizza direttamente lo stato corrente del formData per il JSON
    const dataToSave = JSON.parse(JSON.stringify(formData)); // Crea una copia profonda dello stato attuale

    // Processa i file immagine e aggiungi i file immagine allo ZIP
    for (const key in selectedImageFiles) {
        const file = selectedImageFiles[key];
        if (file) {
             imgsFolder.file(file.name, file);
        }
    }

    // Aggiungi il file CV allo ZIP se è stato selezionato
    if (selectedCVFile) {
        zip.file(selectedCVFile.name, selectedCVFile);
    }

    // Converti l'oggetto JavaScript risultante in una stringa JSON formattata
    const jsonString = JSON.stringify(dataToSave, null, 2);

    // Determina il nome del file JSON in base alla categoria selezionata
     const jsonFileName = categoryDataMap[selectedCategory]?.fileName || 'dati_compilati.json'; // Fallback name

    // Aggiungi il file JSON all'archivio ZIP
    zip.file(jsonFileName, jsonString);

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
    <Modal show={isOpen} onClose={onClose} size="md">
      <Modal.Header>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Popola Dati e Scarica ZIP
        </h3>
      </Modal.Header>
      <Modal.Body className="overflow-y-auto max-h-[80vh]">
        <form className="max-w-sm mx-auto" onSubmit={handleSubmit}>

           {/* Campo per l'upload del CV con stato di parsing */}
            <div className="mb-5 border-b pb-4">
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="cv_file">Carica CV (Popola Campi da CV)</label>
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
                        Carica il tuo CV per popolare automaticamente la form (i dati estratti verranno fusi con i dati attuali, con priorità per i campi non vuoti del CV).
                     </p>
                 )}
            </div>

            {/* Sezione per la selezione della categoria (secondo blocco) */}
            <div className="mb-5 border-b pb-4">
                 <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Seleziona Categoria (Applica Default ai Campi Intoccati):</label>
                 <fieldset>
                    <legend className="sr-only">Categorie di Lavoro</legend>

                    <div className="flex items-center mb-4">
                        <input
                            id="category-digitale-it"
                            type="radio"
                            name="category"
                            value="digitale-it"
                            className="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:focus:bg-blue-600 dark:bg-gray-700 dark:border-gray-600"
                            checked={selectedCategory === 'digitale-it'}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        />
                        <label htmlFor="category-digitale-it" className="block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                            Professionisti del Digitale e IT
                        </label>
                    </div>

                    <div className="flex items-center mb-4">
                        <input
                            id="category-ingegneri-tecnici"
                            type="radio"
                            name="category"
                            value="ingegneri-tecnici"
                            className="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:focus:bg-blue-600 dark:bg-gray-700 dark:border-gray-600"
                            checked={selectedCategory === 'ingegneri-tecnici'}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        />
                        <label htmlFor="category-ingegneri-tecnici" className="block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                            Ingegneri e Tecnici Specializzati
                        </label>
                    </div>

                    <div className="flex items-center mb-4">
                        <input
                            id="category-sanitari-assistenziali"
                            type="radio"
                            name="category"
                            value="sanitari-assistenziali"
                            className="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:bg-gray-700 dark:border-gray-600"
                            checked={selectedCategory === 'sanitari-assistenziali'}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        />
                        <label htmlFor="category-sanitari-assistenziali" className="block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                            Professionisti Sanitari e Assistenziali
                        </label>
                    </div>

                    <div className="flex items-center mb-4">
                        <input
                            id="category-commerciale-vendita"
                            type="radio"
                            name="category"
                            value="commerciale-vendita"
                            className="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus-ring-blue-600 dark:bg-gray-700 dark:border-gray-600"
                            checked={selectedCategory === 'commerciale-vendita'}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        />
                        <label htmlFor="category-commerciale-vendita" className="block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                            Esperti Commerciali e di Vendita
                        </label>
                    </div>

                    <div className="flex items-center mb-4">
                        <input
                            id="category-amministrative-finanziarie"
                            type="radio"
                            name="category"
                            value="amministrative-finanziarie"
                            className="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus-ring-blue-600 dark:bg-gray-700 dark:border-gray-600"
                            checked={selectedCategory === 'amministrative-finanziarie'}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        />
                        <label htmlFor="category-amministrative-finanziarie" className="block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                            Figure Amministrative e Finanziarie con competenze specifiche
                        </label>
                    </div>

                    <div className="flex items-center mb-4">
                        <input
                            id="category-logistica"
                            type="radio"
                            name="category"
                            value="logistica"
                            className="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus-ring-blue-600 dark:bg-gray-700 dark:border-gray-600"
                            checked={selectedCategory === 'logistica'}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        />
                        <label htmlFor="category-logistica" className="block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                            Specialisti della Logistica
                        </label>
                    </div>
                </fieldset>
                 <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                     Seleziona una categoria per popolare i campi vuoti o non modificati.
                 </p>
            </div>


           {/* Campi di testo statici (top-level) - Aggiunta icona con carattere unicode */}
            <div className="mb-5">
                <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Name
                     {formData.hasOwnProperty('name') && ( // Controlla direttamente su formData corrente
                        <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('name')}
                            title={`Esempio: ${formData.name}`} // Usa formData corrente per l'esempio
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
                     {formData.hasOwnProperty('presentation') && (
                         <span
                             className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                              onClick={() => populateFieldWithExample('presentation')}
                              title={`Esempio: ${formData.presentation}`}
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
                     {formData.hasOwnProperty('header_mono_subtitle') && (
                         <span
                             className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                             onClick={() => populateFieldWithExample('header_mono_subtitle')}
                             title={`Esempio: ${formData.header_mono_subtitle}`}
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
                     {formData.hasOwnProperty('print_resume') && (
                         <span
                             className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                             onClick={() => populateFieldWithExample('print_resume')}
                             title={`Esempio: ${formData.print_resume}`}
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
                      {formData.hasOwnProperty('download_my_cv') && (
                         <span
                             className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                             onClick={() => populateFieldWithExample('download_my_cv')}
                             title={`Esempio: ${formData.download_my_cv}`}
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
                     {formData.my_resume_label && formData.my_resume_label.hasOwnProperty('my') && (
                        <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('my_resume_label.my')}
                             title={`Esempio: ${formData.my_resume_label.my}`}
                        >
                            ℹ️
                        </span>
                     )}
                </label>
                <input type="text" id="my_resume_label.my" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.my_resume_label?.my || ''} onChange={handleTextChange} />
            </div>
             <div className="mb-5">
                <label htmlFor="my_resume_label.resume" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    My Resume Label (Resume)
                     {formData.my_resume_label && formData.my_resume_label.hasOwnProperty('resume') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('my_resume_label.resume')}
                             title={`Esempio: ${formData.my_resume_label.resume}`}
                        >
                            ℹ️
                        </span>
                     )}
                </label>
                <input type="text" id="my_resume_label.resume" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.my_resume_label?.resume || ''} onChange={handleTextChange} />
            </div>

              <div className="mb-5">
                <label htmlFor="who_am_i" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Who Am I?
                    {formData.hasOwnProperty('who_am_i') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('who_am_i')}
                             title={`Esempio: ${formData.who_am_i}`}
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
                          {formData.about && formData.about.hasOwnProperty('who') && (
                             <span
                                className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                onClick={() => populateFieldWithExample('about.who')}
                                 title={`Esempio: ${formData.about.who}`}
                            >
                                ℹ️
                            </span>
                         )}
                     </label>
                      <textarea
                         id="about.who"
                         className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                         value={formData.about?.who || ''}
                         onChange={handleTextChange}
                         rows={3}
                      ></textarea>
                 </div>
                  <div className="mb-5">
                     <label htmlFor="about.details" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                         Details
                          {formData.about && formData.about.hasOwnProperty('details') && (
                              <span
                                className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                onClick={() => populateFieldWithExample('about.details')}
                                 title={`Esempio: ${formData.about.details}`}
                            >
                                ℹ️
                            </span>
                         )}
                     </label>
                      <textarea
                         id="about.details"
                         className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                         value={formData.about?.details || ''}
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
                          {formData.personal_info && formData.personal_info.hasOwnProperty('birthdate') && (
                             <span
                                className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                onClick={() => populateFieldWithExample('personal_info.birthdate')}
                                 title={`Esempio: ${formData.personal_info.birthdate}`}
                            >
                                ℹ️
                            </span>
                         )}
                     </label>
                     <input
                         type="text"
                         id="personal_info.birthdate"
                         className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                         value={formData.personal_info?.birthdate || ''}
                         onChange={handleTextChange}
                     />
                 </div>
                  <div className="mb-5">
                     <label htmlFor="personal_info.work_email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                         Work Email
                          {formData.personal_info && formData.personal_info.hasOwnProperty('work_email') && (
                              <span
                                className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                onClick={() => populateFieldWithExample('personal_info.work_email')}
                                 title={`Esempio: ${formData.personal_info.work_email}`}
                            >
                                ℹ️
                            </span>
                         )}
                     </label>
                     <input
                         type="text"
                         id="personal_info.work_email"
                         className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                         value={formData.personal_info?.work_email || ''}
                         onChange={handleTextChange}
                     />
                 </div>
                  <div className="mb-5">
                     <label htmlFor="personal_info.personal_email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                         Personal Email
                          {formData.personal_info && formData.personal_info.hasOwnProperty('personal_email') && (
                              <span
                                className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                onClick={() => populateFieldWithExample('personal_info.personal_email')}
                                 title={`Esempio: ${formData.personal_info.personal_email}`}
                            >
                                ℹ️
                            </span>
                         )}
                     </label>
                     <input
                         type="text"
                         id="personal_info.personal_email"
                         className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                         value={formData.personal_info?.personal_email || ''}
                         onChange={handleTextChange}
                     />
                 </div>
                  <div className="mb-5">
                     <label htmlFor="personal_info.work_number" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                         Work Number
                          {formData.personal_info && formData.personal_info.hasOwnProperty('work_number') && (
                              <span
                                className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                onClick={() => populateFieldWithExample('personal_info.work_number')}
                                 title={`Esempio: ${formData.personal_info.work_number}`}
                            >
                                ℹ️
                            </span>
                         )}
                     </label>
                     <input
                         type="text"
                         id="personal_info.work_number"
                         className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                         value={formData.personal_info?.work_number || ''}
                         onChange={handleTextChange}
                     />
                 </div>
                  <div className="mb-5">
                     <label htmlFor="personal_info.instagram" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                         Instagram
                          {formData.personal_info && formData.personal_info.hasOwnProperty('instagram') && (
                              <span
                                className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                onClick={() => populateFieldWithExample('personal_info.instagram')}
                                 title={`Esempio: ${formData.personal_info.instagram}`}
                            >
                                ℹ️
                            </span>
                         )}
                     </label>
                     <input
                         type="text"
                         id="personal_info.instagram"
                         className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                         value={formData.personal_info?.instagram || ''}
                         onChange={handleTextChange}
                     />
                 </div>
             </div>

               <div className="mb-5">
                <label htmlFor="skills_label" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Skills Label
                     {formData.hasOwnProperty('skills_label') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('skills_label')}
                             title={`Esempio: ${formData.skills_label}`}
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
                     {formData.hasOwnProperty('languages_label') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('languages_label')}
                             title={`Esempio: ${formData.languages_label}`}
                        >
                            ℹ️
                        </span>
                     )}
                </label>
                <input type="text" id="languages_label" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.languages_label || ''} onChange={handleTextChange} />
            </div>
               <div className="mb-5">
                <label htmlFor="personal_info_label" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Personal Info Label
                     {formData.hasOwnProperty('personal_info_label') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('personal_info_label')}
                             title={`Esempio: ${formData.personal_info_label}`}
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
                     {formData.hasOwnProperty('my_expertise_label') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('my_expertise_label')}
                             title={`Esempio: ${formData.my_expertise_label}`}
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
                     {formData.hasOwnProperty('education_label') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('education_label')}
                             title={`Esempio: ${formData.education_label}`}
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
                     {formData.hasOwnProperty('work_experience_label') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('work_experience_label')}
                             title={`Esempio: ${formData.work_experience_label}`}
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
                     {formData.hasOwnProperty('my_service_label') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('my_service_label')}
                             title={`Esempio: ${formData.my_service_label}`}
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
                     {formData.hasOwnProperty('contact_label') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('contact_label')}
                             title={`Esempio: ${formData.contact_label}`}
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
                     {formData.hasOwnProperty('pricing_packs_label') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('pricing_packs_label')}
                             title={`Esempio: ${formData.pricing_packs_label}`}
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
                     {formData.hasOwnProperty('freelancing_label') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('freelancing_label')}
                             title={`Esempio: ${formData.freelancing_label}`}
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
                     {formData.hasOwnProperty('hire_me_label') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('hire_me_label')}
                             title={`Esempio: ${formData.hire_me_label}`}
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
                     {formData.hasOwnProperty('my_portfolio_label') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('my_portfolio_label')}
                             title={`Esempio: ${formData.my_portfolio_label}`}
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
                     {formData.hasOwnProperty('latest_label') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('latest_label')}
                             title={`Esempio: ${formData.latest_label}`}
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
                     {formData.hasOwnProperty('news_label') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('news_label')}
                             title={`Esempio: ${formData.news_label}`}
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
                     {formData.hasOwnProperty('form_title') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('form_title')}
                             title={`Esempio: ${formData.form_title}`}
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
                     {formData.hasOwnProperty('form_placeholder_name') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('form_placeholder_name')}
                             title={`Esempio: ${formData.form_placeholder_name}`}
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
                     {formData.hasOwnProperty('form_placeholder_email') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('form_placeholder_email')}
                             title={`Esempio: ${formData.form_placeholder_email}`}
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
                     {formData.hasOwnProperty('form_placeholder_message') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('form_placeholder_message')}
                             title={`Esempio: ${formData.form_placeholder_message}`}
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
                     {formData.hasOwnProperty('form_button_text') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('form_button_text')}
                             title={`Esempio: ${formData.form_button_text}`}
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
                     {formData.hasOwnProperty('contact_title') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('contact_title')}
                             title={`Esempio: ${formData.contact_title}`}
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
                     {formData.hasOwnProperty('phone_label') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('phone_label')}
                             title={`Esempio: ${formData.phone_label}`}
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
                     {formData.hasOwnProperty('phone_number') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('phone_number')}
                             title={`Esempio: ${formData.phone_number}`}
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
                     {formData.hasOwnProperty('address_label') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('address_label')}
                             title={`Esempio: ${formData.address_label}`}
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
                     {formData.hasOwnProperty('address') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('address')}
                             title={`Esempio: ${formData.address}`}
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
                     {formData.hasOwnProperty('email_label') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('email_label')}
                             title={`Esempio: ${formData.email_label}`}
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
                     {formData.hasOwnProperty('email') && (
                         <span
                            className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                            onClick={() => populateFieldWithExample('email')}
                             title={`Esempio: ${formData.email}`}
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
             {(formData.portfolio_items || []).map((item, index) => (
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
                              {formData.portfolio_items && formData.portfolio_items[index] && formData.portfolio_items[index].hasOwnProperty('title') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('portfolio_items', 'title', index)}
                                      title={`Esempio: ${formData.portfolio_items[index].title}`}
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
                             {formData.portfolio_items && formData.portfolio_items[index] && formData.portfolio_items[index].hasOwnProperty('subtitle') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('portfolio_items', 'subtitle', index)}
                                      title={`Esempio: ${formData.portfolio_items[index].subtitle}`}
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
                              {formData.portfolio_items && formData.portfolio_items[index] && formData.portfolio_items[index].hasOwnProperty('alt') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('portfolio_items', 'alt', index)}
                                      title={`Esempio: ${formData.portfolio_items[index].alt}`}
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
             <Button type="button" onClick={addPortfolioItem}>Aggiungi Portfolio Item</Button>
          </div>


           {/* Sezione dinamica per Blog Posts - Aggiunta icona */}
          <div className="mb-5 mt-10 border-t pt-4">
             <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Blog Posts</h4>
              {(formData.blog_posts || []).map((item, index) => (
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
                             {formData.blog_posts && formData.blog_posts[index] && formData.blog_posts[index].hasOwnProperty('title') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('blog_posts', 'title', index)}
                                      title={`Esempio: ${formData.blog_posts[index].title}`}
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
                             {formData.blog_posts && formData.blog_posts[index] && formData.blog_posts[index].hasOwnProperty('author') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('blog_posts', 'author', index)}
                                      title={`Esempio: ${formData.blog_posts[index].author}`}
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
                             {formData.blog_posts && formData.blog_posts[index] && formData.blog_posts[index].hasOwnProperty('alt') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('blog_posts', 'alt', index)}
                                      title={`Esempio: ${formData.blog_posts[index].alt}`}
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
                             {formData.blog_posts && formData.blog_posts[index] && formData.blog_posts[index].hasOwnProperty('description') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('blog_posts', 'description', index)}
                                      title={`Esempio: ${formData.blog_posts[index].description}`}
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
                              {formData.blog_posts && formData.blog_posts[index] && formData.blog_posts[index].hasOwnProperty('full_description') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('blog_posts', 'full_description', index)}
                                      title={`Esempio: ${formData.blog_posts[index].full_description}`}
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
                             {formData.blog_posts && formData.blog_posts[index] && formData.blog_posts[index].hasOwnProperty('read_more_url') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('blog_posts', 'read_more_url', index)}
                                      title={`Esempio: ${formData.blog_posts[index].read_more_url}`}
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
                 </div>
             ))}
             <Button type="button" onClick={addBlogPost}>Aggiungi Blog Post</Button>
          </div>

           {/* Sezione dinamica per Skills */}
            <div className="mb-5 mt-10 border-t pt-4">
             <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Skills</h4>
             {(formData.skills || []).map((item, index) => (
                 <div key={index} className="mb-4 p-3 border rounded-lg dark:border-gray-700 relative flex items-center space-x-4">
                      <button
                         type="button"
                         onClick={() => removeSkill(index)}
                         className=" text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-700"
                     >
                        Rimuovi
                     </button>
                    <div className="flex-grow">
                         <label htmlFor={`skills_${index}_name`} className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
                             Skill Name
                              {formData.skills && formData.skills[index] && formData.skills[index].hasOwnProperty('name') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('skills', 'name', index)}
                                      title={`Esempio: ${formData.skills[index].name}`}
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
                              {formData.skills && formData.skills[index] && formData.skills[index].hasOwnProperty('level') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('skills', 'level', index)}
                                      title={`Esempio: ${formData.skills[index].level}`}
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
             <Button type="button" onClick={addSkill}>Aggiungi Skill</Button>
            </div>

            {/* Sezione dinamica per Education */}
            <div className="mb-5 mt-10 border-t pt-4">
             <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Education</h4>
             {(formData.education_list || []).map((item, index) => (
                 <div key={index} className="mb-4 p-3 border rounded-lg dark:border-gray-700 relative">
                      <button
                         type="button"
                         onClick={() => removeEducationItem(index)}
                         className="absolute top-2 right-2 text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-700"
                     >
                        Rimuovi
                     </button>
                    <h5 className="text-md font-medium text-gray-900 dark:text-white mb-3">Item #{index + 1}</h5>
                    <div className="mb-5">
                         <label htmlFor={`education_list_${index}_period`} className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
                             Period
                             {formData.education_list && formData.education_list[index] && formData.education_list[index].hasOwnProperty('period') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('education_list', 'period', index)}
                                      title={`Esempio: ${formData.education_list[index].period}`}
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
                             {formData.education_list && formData.education_list[index] && formData.education_list[index].hasOwnProperty('title') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('education_list', 'title', index)}
                                      title={`Esempio: ${formData.education_list[index].title}`}
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
                              {formData.education_list && formData.education_list[index] && formData.education_list[index].hasOwnProperty('subtitle') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('education_list', 'subtitle', index)}
                                      title={`Esempio: ${formData.education_list[index].subtitle}`}
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
             <Button type="button" onClick={addEducationItem}>Aggiungi Education Item</Button>
            </div>

            {/* Sezione dinamica per Work Experience */}
            <div className="mb-5 mt-10 border-t pt-4">
             <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Work Experience</h4>
             {(formData.work_experience_list || []).map((item, index) => (
                 <div key={index} className="mb-4 p-3 border rounded-lg dark:border-gray-700 relative">
                      <button
                         type="button"
                         onClick={() => removeWorkExperienceItem(index)}
                         className="absolute top-2 right-2 text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-700"
                     >
                        Rimuovi
                     </button>
                    <h5 className="text-md font-medium text-gray-900 dark:text-white mb-3">Item #{index + 1}</h5>
                    <div className="mb-5">
                         <label htmlFor={`work_experience_list_${index}_period`} className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
                             Period
                             {formData.work_experience_list && formData.work_experience_list[index] && formData.work_experience_list[index].hasOwnProperty('period') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('work_experience_list', 'period', index)}
                                      title={`Esempio: ${formData.work_experience_list[index].period}`}
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
                             {formData.work_experience_list && formData.work_experience_list[index] && formData.work_experience_list[index].hasOwnProperty('title') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('work_experience_list', 'title', index)}
                                      title={`Esempio: ${formData.work_experience_list[index].title}`}
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
                             {formData.work_experience_list && formData.work_experience_list[index] && formData.work_experience_list[index].hasOwnProperty('subtitle') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('work_experience_list', 'subtitle', index)}
                                      title={`Esempio: ${formData.work_experience_list[index].subtitle}`}
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
             <Button type="button" onClick={addWorkExperienceItem}>Aggiungi Work Experience Item</Button>
            </div>

             {/* Sezione dinamica per Languages */}
            <div className="mb-5 mt-10 border-t pt-4">
             <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Languages</h4>
             {(formData.languages || []).map((item, index) => (
                 <div key={index} className="mb-4 p-3 border rounded-lg dark:border-gray-700 relative flex items-center space-x-4">
                      <button
                         type="button"
                         onClick={() => removeLanguage(index)}
                         className=" text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-700"
                     >
                        Rimuovi
                     </button>
                    <div className="flex-grow">
                         <label htmlFor={`languages_${index}_name`} className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
                             Language Name
                              {formData.languages && formData.languages[index] && formData.languages[index].hasOwnProperty('name') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('languages', 'name', index)}
                                      title={`Esempio: ${formData.languages[index].name}`}
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
                             {formData.languages && formData.languages[index] && formData.languages[index].hasOwnProperty('level') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('languages', 'level', index)}
                                      title={`Esempio: ${formData.languages[index].level}`}
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
             <Button type="button" onClick={addLanguage}>Aggiungi Language</Button>
            </div>

             {/* Sezione dinamica per Expertise List */}
            <div className="mb-5 mt-10 border-t pt-4">
             <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Expertise List</h4>
             {(formData.expertise_list || []).map((item, index) => (
                 <div key={index} className="mb-4 p-3 border rounded-lg dark:border-gray-700 relative">
                      <button
                         type="button"
                         onClick={() => removeExpertiseItem(index)}
                         className="absolute top-2 right-2 text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-700"
                     >
                        Rimuovi
                     </button>
                    <h5 className="text-md font-medium text-gray-900 dark:text-white mb-3">Item #{index + 1}</h5>
                    <div className="mb-5">
                         <label htmlFor={`expertise_list_${index}_name`} className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
                             Name
                             {formData.expertise_list && formData.expertise_list[index] && formData.expertise_list[index].hasOwnProperty('name') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('expertise_list', 'name', index)}
                                      title={`Esempio: ${formData.expertise_list[index].name}`}
                                 >
                                     ℹ️
                                 </span>
                              )}
                         </label>
                         <input
                            type="text"
                            id={`expertise_list_${index}_name`}
                            className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={item.name || ''}
                            onChange={(e) => handleArrayItemTextChange('expertise_list', index, 'name', e.target.value)}
                         />
                     </div>
                      <div className="mb-5">
                         <label htmlFor={`expertise_list_${index}_icon_class`} className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
                             Icon Class
                              {formData.expertise_list && formData.expertise_list[index] && formData.expertise_list[index].hasOwnProperty('icon_class') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('expertise_list', 'icon_class', index)}
                                      title={`Esempio: ${formData.expertise_list[index].icon_class}`}
                                 >
                                     ℹ️
                                 </span>
                              )}
                         </label>
                         <input
                            type="text"
                            id={`expertise_list_${index}_icon_class`}
                            className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={item.icon_class || ''}
                            onChange={(e) => handleArrayItemTextChange('expertise_list', index, 'icon_class', e.target.value)}
                         />
                     </div>
                     <div className="mb-5">
                         <label htmlFor={`expertise_list_${index}_subtitle`} className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
                             Subtitle
                              {formData.expertise_list && formData.expertise_list[index] && formData.expertise_list[index].hasOwnProperty('subtitle') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('expertise_list', 'subtitle', index)}
                                      title={`Esempio: ${formData.expertise_list[index].subtitle}`}
                                 >
                                     ℹ️
                                 </span>
                              )}
                         </label>
                         <textarea
                            id={`expertise_list_${index}_subtitle`}
                            className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={item.subtitle || ''}
                            onChange={(e) => handleArrayItemTextChange('expertise_list', index, 'subtitle', e.target.value)}
                            rows={3}
                         ></textarea>
                     </div>
                 </div>
             ))}
             <Button type="button" onClick={addExpertiseItem}>Aggiungi Expertise Item</Button>
            </div>

             {/* Sezione dinamica per Services */}
             <div className="mb-5 mt-10 border-t pt-4">
             <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Services</h4>
             {(formData.services || []).map((item, index) => (
                 <div key={index} className="mb-4 p-3 border rounded-lg dark:border-gray-700 relative">
                      <button
                         type="button"
                         onClick={() => removeService(index)}
                         className="absolute top-2 right-2 text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-700"
                     >
                        Rimuovi
                     </button>
                    <h5 className="text-md font-medium text-gray-900 dark:text-white mb-3">Item #{index + 1}</h5>
                    <div className="mb-5">
                         <label htmlFor={`services_${index}_icon`} className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
                             Icon
                             {formData.services && formData.services[index] && formData.services[index].hasOwnProperty('icon') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('services', 'icon', index)}
                                      title={`Esempio: ${formData.services[index].icon}`}
                                 >
                                     ℹ️
                                 </span>
                              )}
                         </label>
                         <input
                            type="text"
                            id={`services_${index}_icon`}
                            className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={item.icon || ''}
                            onChange={(e) => handleArrayItemTextChange('services', index, 'icon', e.target.value)}
                         />
                     </div>
                      <div className="mb-5">
                         <label htmlFor={`services_${index}_icon_class`} className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
                             Icon Class
                              {formData.services && formData.services[index] && formData.services[index].hasOwnProperty('icon_class') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('services', 'icon_class', index)}
                                      title={`Esempio: ${formData.services[index].icon_class}`}
                                 >
                                     ℹ️
                                 </span>
                              )}
                         </label>
                         <input
                            type="text"
                            id={`services_${index}_icon_class`}
                            className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={item.icon_class || ''}
                            onChange={(e) => handleArrayItemTextChange('services', index, 'icon_class', e.target.value)}
                         />
                     </div>
                      <div className="mb-5">
                         <label htmlFor={`services_${index}_title`} className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
                             Title
                             {formData.services && formData.services[index] && formData.services[index].hasOwnProperty('title') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('services', 'title', index)}
                                      title={`Esempio: ${formData.services[index].title}`}
                                 >
                                     ℹ️
                                 </span>
                              )}
                         </label>
                         <input
                            type="text"
                            id={`services_${index}_title`}
                            className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={item.title || ''}
                            onChange={(e) => handleArrayItemTextChange('services', index, 'title', e.target.value)}
                         />
                     </div>
                     <div className="mb-5">
                         <label htmlFor={`services_${index}_description`} className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
                             Description
                              {formData.services && formData.services[index] && formData.services[index].hasOwnProperty('description') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('services', 'description', index)}
                                      title={`Esempio: ${formData.services[index].description}`}
                                 >
                                     ℹ️
                                 </span>
                              )}
                         </label>
                         <textarea
                            id={`services_${index}_description`}
                            className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={item.description || ''}
                            onChange={(e) => handleArrayItemTextChange('services', index, 'description', e.target.value)}
                            rows={3}
                         ></textarea>
                     </div>
                 </div>
             ))}
             <Button type="button" onClick={addService}>Aggiungi Service</Button>
            </div>

            {/* Sezione dinamica per Statistics */}
             <div className="mb-5 mt-10 border-t pt-4">
             <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Statistics</h4>
             {(formData.statistics || []).map((item, index) => (
                 <div key={index} className="mb-4 p-3 border rounded-lg dark:border-gray-700 relative">
                      <button
                         type="button"
                         onClick={() => removeStatistic(index)}
                         className="absolute top-2 right-2 text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-700"
                     >
                        Rimuovi
                     </button>
                    <h5 className="text-md font-medium text-gray-900 dark:text-white mb-3">Item #{index + 1}</h5>
                    <div className="mb-5">
                         <label htmlFor={`statistics_${index}_icon`} className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
                             Icon
                             {formData.statistics && formData.statistics[index] && formData.statistics[index].hasOwnProperty('icon') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('statistics', 'icon', index)}
                                      title={`Esempio: ${formData.statistics[index].icon}`}
                                 >
                                     ℹ️
                                 </span>
                              )}
                         </label>
                         <input
                            type="text"
                            id={`statistics_${index}_icon`}
                            className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={item.icon || ''}
                            onChange={(e) => handleArrayItemTextChange('statistics', index, 'icon', e.target.value)}
                         />
                     </div>
                      <div className="mb-5">
                         <label htmlFor={`statistics_${index}_count`} className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
                             Count
                              {formData.statistics && formData.statistics[index] && formData.statistics[index].hasOwnProperty('count') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('statistics', 'count', index)}
                                      title={`Esempio: ${formData.statistics[index].count}`}
                                 >
                                     ℹ️
                                 </span>
                              )}
                         </label>
                         <input
                            type="text"
                            id={`statistics_${index}_count`}
                            className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={item.count || ''}
                            onChange={(e) => handleArrayItemTextChange('statistics', index, 'count', e.target.value)}
                         />
                     </div>
                     <div className="mb-5">
                         <label htmlFor={`statistics_${index}_label`} className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
                             Label
                             {formData.statistics && formData.statistics[index] && formData.statistics[index].hasOwnProperty('label') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('statistics', 'label', index)}
                                      title={`Esempio: ${formData.statistics[index].label}`}
                                 >
                                     ℹ️
                                 </span>
                              )}
                         </label>
                         <input
                            type="text"
                            id={`statistics_${index}_label`}
                            className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={item.label || ''}
                            onChange={(e) => handleArrayItemTextChange('statistics', index, 'label', e.target.value)}
                         />
                     </div>
                      <div className="mb-5">
                         <label htmlFor={`statistics_${index}_icon_class`} className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
                             Icon Class
                             {formData.statistics && formData.statistics[index] && formData.statistics[index].hasOwnProperty('icon_class') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('statistics', 'icon_class', index)}
                                      title={`Esempio: ${formData.statistics[index].icon_class}`}
                                 >
                                     ℹ️
                                 </span>
                              )}
                         </label>
                         <input
                            type="text"
                            id={`statistics_${index}_icon_class`}
                            className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={item.icon_class || ''}
                            onChange={(e) => handleArrayItemTextChange('statistics', index, 'icon_class', e.target.value)}
                         />
                     </div>
                 </div>
             ))}
             <Button type="button" onClick={addStatistic}>Aggiungi Statistic</Button>
            </div>

            {/* Sezione dinamica per Pricing Packs */}
             <div className="mb-5 mt-10 border-t pt-4">
             <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pricing Packs</h4>
             {(formData.pricing_packs || []).map((item, index) => (
                 <div key={index} className="mb-4 p-3 border rounded-lg dark:border-gray-700 relative">
                      <button
                         type="button"
                         onClick={() => removePricingPack(index)}
                         className="absolute top-2 right-2 text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-700"
                     >
                        Rimuovi
                     </button>
                    <h5 className="text-md font-medium text-gray-900 dark:text-white mb-3">Item #{index + 1}</h5>
                    <div className="mb-5">
                         <label htmlFor={`pricing_packs_${index}_title`} className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
                             Title
                             {formData.pricing_packs && formData.pricing_packs[index] && formData.pricing_packs[index].hasOwnProperty('title') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('pricing_packs', 'title', index)}
                                      title={`Esempio: ${formData.pricing_packs[index].title}`}
                                 >
                                     ℹ️
                                 </span>
                              )}
                         </label>
                         <input
                            type="text"
                            id={`pricing_packs_${index}_title`}
                            className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={item.title || ''}
                            onChange={(e) => handleArrayItemTextChange('pricing_packs', index, 'title', e.target.value)}
                         />
                     </div>
                      <div className="mb-5">
                         <label htmlFor={`pricing_packs_${index}_cost`} className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
                             Cost
                              {formData.pricing_packs && formData.pricing_packs[index] && formData.pricing_packs[index].hasOwnProperty('cost') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('pricing_packs', 'cost', index)}
                                      title={`Esempio: ${formData.pricing_packs[index].cost}`}
                                 >
                                     ℹ️
                                 </span>
                              )}
                         </label>
                         <input
                            type="text"
                            id={`pricing_packs_${index}_cost`}
                            className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={item.cost || ''}
                            onChange={(e) => handleArrayItemTextChange('pricing_packs', index, 'cost', e.target.value)}
                         />
                     </div>
                      <div className="mb-5">
                         <label htmlFor={`pricing_packs_${index}_project`} className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
                             Project
                              {formData.pricing_packs && formData.pricing_packs[index] && formData.pricing_packs[index].hasOwnProperty('project') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('pricing_packs', 'project', index)}
                                      title={`Esempio: ${formData.pricing_packs[index].project}`}
                                 >
                                     ℹ️
                                 </span>
                              )}
                         </label>
                         <input
                            type="text"
                            id={`pricing_packs_${index}_project`}
                            className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={item.project || ''}
                            onChange={(e) => handleArrayItemTextChange('pricing_packs', index, 'project', e.target.value)}
                         />
                     </div>
                     <div className="mb-5">
                         <label htmlFor={`pricing_packs_${index}_storage`} className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
                             Storage
                              {formData.pricing_packs && formData.pricing_packs[index] && formData.pricing_packs[index].hasOwnProperty('storage') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('pricing_packs', 'storage', index)}
                                      title={`Esempio: ${formData.pricing_packs[index].storage}`}
                                 >
                                     ℹ️
                                 </span>
                              )}
                         </label>
                         <input
                            type="text"
                            id={`pricing_packs_${index}_storage`}
                            className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={item.storage || ''}
                            onChange={(e) => handleArrayItemTextChange('pricing_packs', index, 'storage', e.target.value)}
                         />
                     </div>
                      <div className="mb-5">
                         <label htmlFor={`pricing_packs_${index}_domain`} className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
                             Domain
                              {formData.pricing_packs && formData.pricing_packs[index] && formData.pricing_packs[index].hasOwnProperty('domain') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('pricing_packs', 'domain', index)}
                                      title={`Esempio: ${formData.pricing_packs[index].domain}`}
                                 >
                                     ℹ️
                                 </span>
                              )}
                         </label>
                         <input
                            type="text"
                            id={`pricing_packs_${index}_domain`}
                            className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={item.domain || ''}
                            onChange={(e) => handleArrayItemTextChange('pricing_packs', index, 'domain', e.target.value)}
                         />
                     </div>
                      <div className="mb-5">
                         <label htmlFor={`pricing_packs_${index}_users`} className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
                             Users
                             {formData.pricing_packs && formData.pricing_packs[index] && formData.pricing_packs[index].hasOwnProperty('users') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('pricing_packs', 'users', index)}
                                      title={`Esempio: ${formData.pricing_packs[index].users}`}
                                 >
                                     ℹ️
                                 </span>
                              )}
                         </label>
                         <input
                            type="text"
                            id={`pricing_packs_${index}_users`}
                            className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={item.users || ''}
                            onChange={(e) => handleArrayItemTextChange('pricing_packs', index, 'users', e.target.value)}
                         />
                     </div>
                      <div className="mb-5">
                         <label htmlFor={`pricing_packs_${index}_special_class`} className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
                             Special Class
                             {formData.pricing_packs && formData.pricing_packs[index] && formData.pricing_packs[index].hasOwnProperty('special_class') && (
                                 <span
                                     className="ml-2 text-gray-400 dark:text-gray-500 cursor-pointer"
                                     onClick={() => populateArrayItemFieldWithExample('pricing_packs', 'special_class', index)}
                                      title={`Esempio: ${formData.pricing_packs[index].special_class}`}
                                 >
                                     ℹ️
                                 </span>
                              )}
                         </label>
                         <input
                            type="text"
                            id={`pricing_packs_${index}_special_class`}
                            className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={item.special_class || ''}
                            onChange={(e) => handleArrayItemTextChange('pricing_packs', index, 'special_class', e.target.value)}
                         />
                     </div>
                 </div>
             ))}<Button type="button" onClick={addPricingPack}>Aggiungi Pricing Pack</Button>
            </div>


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