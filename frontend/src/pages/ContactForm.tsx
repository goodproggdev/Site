import { useState, useEffect } from "react";
import { Alert } from "flowbite-react";

interface ContactFormProps {
  planName: string;
  onFormSubmit: () => void;
}

const ContactForm: React.FC<ContactFormProps> = ({ planName, onFormSubmit }) => {
  const [formData, setFormData] = useState({
    email: "",
    subject: planName ? `Richiesta per: ${planName}` : "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Aggiorna il subject quando cambia il piano selezionato
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      subject: planName ? `Richiesta per: ${planName}` : ""
    }));
  }, [planName]);

  // Reset automatico degli alert
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === "success" || status === "error") {
      timer = setTimeout(() => setStatus("idle"), 5000);
    }
    return () => clearTimeout(timer);
  }, [status]);

  // Gestione CSRF token
  const getCsrfToken = () => {
    return document.cookie
      .split("; ")
      .find(row => row.startsWith("csrftoken="))
      ?.split("=")[1] || "";
  };

  // Setup iniziale CSRF
  useEffect(() => {
    fetch('http://localhost:8000/api/contact/', {
      method: 'GET',
      credentials: 'include'
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("http://localhost:8000/api/contact/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCsrfToken(),
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Errore ${response.status}`);
      }

      setStatus("success");
      setFormData({ email: "", subject: "", message: "" });
      onFormSubmit();

    } catch (error) {
      setStatus("error");
      if (error instanceof Error) {
        setErrorMessage(
          error.message.includes('SMTP') || error.message.includes('internet') 
            ? error.message 
            : "Errore durante l'invio del messaggio"
        );
      }
      console.error('Errore:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const alertMessages: { [key: string]: string } = {
    "Formato email non valido": "Inserisci un indirizzo email valido",
    "Tutti i campi sono obbligatori": "Compila tutti i campi richiesti",
    "Errore 400": "Richiesta malformata",
    "Errore 500": "Errore interno del server",
    "Errore SMTP": "Problema nell'invio della mail"
  };

  return (
    <section className="bg-white dark:bg-gray-900" id="contact">
      <div className="py-8 lg:py-16 px-4 mx-auto max-w-screen-md">
        <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-center text-gray-900 dark:text-white">
          Contattami
        </h2>
        <p className="mb-8 lg:mb-16 font-light text-center text-gray-500 dark:text-gray-400 sm:text-xl">
          Hai un progetto in mente? Vuoi maggiori informazioni? Compila il form e ti risponderò al più presto!
        </p>

        {status === "success" && (
          <Alert color="success" className="mb-4">
            <span>🎉 Messaggio inviato con successo!</span>
          </Alert>
        )}

        {status === "error" && (
          <Alert color="failure" className="mb-4">
            <span>❌ {alertMessages[errorMessage] || errorMessage}</span>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
              La tua email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 dark:shadow-sm-light"
              placeholder="nome@esempio.com"
              required
              disabled={status === "loading"}
            />
          </div>

          <div>
            <label htmlFor="subject" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
              Oggetto
            </label>
            <input
              type="text"
              id="subject"
              value={formData.subject}
              onChange={handleChange}
              className="block p-3 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 dark:shadow-sm-light"
              placeholder="Descrivi brevemente la tua richiesta"
              required
              disabled={status === "loading"}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">
              Il tuo messaggio
            </label>
            <textarea
              id="message"
              rows={6}
              value={formData.message}
              onChange={handleChange}
              className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg shadow-sm border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              placeholder="Scrivi qui il tuo messaggio..."
              required
              disabled={status === "loading"}
            />
          </div>

          <button
            type="submit"
            className={`py-3 px-5 text-sm font-medium text-center rounded-lg sm:w-fit focus:ring-4 focus:outline-none transition-colors ${
              status === "loading" 
                ? "bg-gray-400 text-gray-100 cursor-not-allowed" 
                : "text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
            }`}
            disabled={status === "loading"}
          >
            {status === "loading" ? (
              <span className="flex items-center">
                <svg aria-hidden="true" role="status" className="inline w-4 h-4 me-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB"/>
                  <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
                </svg>
                Invio in corso...
              </span>
            ) : "Invia messaggio"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default ContactForm;