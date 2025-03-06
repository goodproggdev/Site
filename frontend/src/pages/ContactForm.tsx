import { useState, useEffect } from "react";
import { Alert } from "flowbite-react";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
  
    if (status === "success" || status === "error") {
      timer = setTimeout(() => {
        setStatus("idle");
      }, 5000);
    }
  
    return () => clearTimeout(timer);
  }, [status]);
  

  const getCsrfToken = () => {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrftoken="))
      ?.split("=")[1] || "";
  };

  useEffect(() => {
    fetch('http://localhost:8000/api/contact/', {
      method: 'GET',
      credentials: 'include'
    });
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
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
  
    } catch (error) {
      setStatus("error");
      if (error instanceof Error) {
        if (error.message.includes('internet') || error.message.includes('SMTP')) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("Errore durante l'invio del messaggio");
        }
      }
      console.error('Errore:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const getAlertMessage = () => {
    const messages: { [key: string]: string } = {
      "Formato email non valido": "Inserisci un indirizzo email valido",
      "Tutti i campi sono obbligatori": "Compila tutti i campi richiesti",
      "Formato JSON non valido": "Errore nel formato dei dati inviati",
      "Content-Type deve essere application/json": "Errore di configurazione",
      "Errore 400": "Richiesta malformata",
      "Errore 500": "Errore interno del server"
    };
  
    return messages[errorMessage] || errorMessage;
  };

  return (
    <section className="bg-white dark:bg-gray-900" id="contact">
      <div className="py-8 lg:py-16 px-4 mx-auto max-w-screen-md">
        <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-center text-gray-900 dark:text-white">
          Contact Us
        </h2>
        <p className="mb-8 lg:mb-16 font-light text-center text-gray-500 dark:text-gray-400 sm:text-xl">
          Got a technical issue? Want to send feedback about a beta feature? Need details about our Business plan? Let us know.
        </p>

        {status === "success" && (
          <Alert color="success" className="mb-4">
            <span>Messaggio inviato con successo!</span>
          </Alert>
        )}

        {status === "error" && (
          <Alert color="failure" className="mb-4">
            <span>{getAlertMessage()}</span>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
              Your email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 dark:shadow-sm-light"
              placeholder="example@gmail.com"
              required
              disabled={status === "loading"}
            />
          </div>

          <div>
            <label htmlFor="subject" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              value={formData.subject}
              onChange={handleChange}
              className="block p-3 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 dark:shadow-sm-light"
              placeholder="Let us know how we can help you"
              required
              disabled={status === "loading"}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">
              Your message
            </label>
            <textarea
              id="message"
              rows={6}
              value={formData.message}
              onChange={handleChange}
              className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg shadow-sm border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              placeholder="Leave a comment..."
              required
              disabled={status === "loading"}
            ></textarea>
          </div>

          <button
            type="submit"
            className={`py-3 px-5 text-sm font-medium text-center dark:text-white rounded-lg transition-colors sm:w-fit focus:ring-4 focus:outline-none ${
              status === "loading"
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary-700 hover:bg-primary-800 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
            }`}
            disabled={status === "loading"}
          >
            {status === "loading" ? "Invio in corso..." : "Invia messaggio"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default ContactForm;