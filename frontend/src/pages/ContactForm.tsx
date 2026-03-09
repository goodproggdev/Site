import { useState, useEffect } from "react";
import { Alert } from "flowbite-react";

interface ContactFormProps {
  planName: string;
  onFormSubmit: () => void;
}

const ContactForm: React.FC<ContactFormProps> = ({ planName, onFormSubmit }) => {
  const [formData, setFormData] = useState({
    email: "",
    subject: planName ? `Domanda sul piano: ${planName}` : "Richiesta informazioni",
    message: "",
    plan: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      subject: planName ? `Domanda sul piano: ${planName}` : "Richiesta informazioni",
      plan: planName || ""
    }));
  }, [planName]);

  useEffect(() => {
    let timer: any;
    if (status === "success" || status === "error") {
      timer = setTimeout(() => setStatus("idle"), 5000);
    }
    return () => clearTimeout(timer);
  }, [status]);

  const getCsrfToken = () => {
    return document.cookie
      .split("; ")
      .find(row => row.startsWith("csrftoken="))
      ?.split("=")[1] || "";
  };

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
      setFormData({ email: "", subject: "Richiesta informazioni", message: "", plan: "" });
      onFormSubmit();

    } catch (error) {
      setStatus("error");
      setErrorMessage("Errore durante l'invio del messaggio. Riprova più tardi.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  return (
    <section id="contact" className="relative py-24 mesh-gradient overflow-hidden">
      <div className="absolute inset-0 bg-indigo-900/10 dark:bg-black/30 pointer-events-none"></div>
      <div className="relative py-12 lg:py-16 px-4 mx-auto max-w-screen-md">
        <div className="glass-card p-6 lg:p-14 rounded-3xl shadow-2xl">
          <h2 className="mb-4 lg:mb-6 text-3xl tracking-tight font-extrabold text-center text-gray-900 dark:text-white lg:text-5xl leading-tight">
            Parlaci dei <span className="text-gradient">tuoi Obiettivi</span>
          </h2>
          <p className="mb-8 lg:mb-12 font-light text-center text-gray-600 dark:text-gray-400 text-base lg:text-xl leading-relaxed">
            Hai domande o desideri un piano personalizzato? Il nostro team è pronto ad aiutarti.
          </p>

          {status === "success" && (
            <Alert color="success" className="mb-6">
              <span>🎉 Messaggio inviato! Ti risponderemo al più presto.</span>
            </Alert>
          )}

          {status === "error" && (
            <Alert color="failure" className="mb-6">
              <span>❌ {errorMessage}</span>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              <div>
                <label htmlFor="email" className="block mb-2 text-[10px] lg:text-sm font-bold text-gray-900 dark:text-gray-300 uppercase tracking-wider">La tua Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="shadow-sm bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-2xl focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3 lg:p-4 dark:bg-gray-800 dark:border-gray-700 dark:placeholder-gray-400 dark:text-white transition-all transform focus:scale-[1.01]" 
                  placeholder="nome@azienda.it" 
                  required 
                />
              </div>
              <div>
                <label htmlFor="plan" className="block mb-2 text-[10px] lg:text-sm font-bold text-gray-900 dark:text-gray-300 uppercase tracking-wider">Interessato a</label>
                <input 
                  type="text" 
                  id="plan" 
                  name="plan"
                  value={formData.plan}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-2xl focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3 lg:p-4 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all transform focus:scale-[1.01]" 
                  placeholder="Esempio: Piano Premium" 
                />
              </div>
            </div>
            <div>
              <label htmlFor="subject" className="block mb-2 text-[10px] lg:text-sm font-bold text-gray-900 dark:text-gray-300 uppercase tracking-wider">Oggetto</label>
              <input 
                type="text" 
                id="subject" 
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="block p-3 lg:p-4 w-full text-sm text-gray-900 bg-gray-50 rounded-2xl border border-gray-200 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all transform focus:scale-[1.01]" 
                placeholder="Come possiamo aiutarti?" 
                required 
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="message" className="block mb-2 text-[10px] lg:text-sm font-bold text-gray-900 dark:text-gray-300 uppercase tracking-wider">Messaggio</label>
              <textarea 
                id="message" 
                name="message"
                rows={4} 
                value={formData.message}
                onChange={handleChange}
                className="block p-3 lg:p-4 w-full text-sm text-gray-900 bg-gray-50 rounded-2xl shadow-sm border border-gray-200 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all transform focus:scale-[1.01]" 
                placeholder="Scrivi qui i tuoi dubbi..."
              ></textarea>
            </div>
            <div className="flex justify-center pt-4">
              <button 
                type="submit" 
                disabled={status === "loading"}
                className="btn-primary-gradient w-full md:w-auto min-w-[200px] flex items-center justify-center gap-2 py-3 lg:py-4"
              >
                {status === "loading" ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Invio...
                  </>
                ) : 'Invia Messaggio'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
