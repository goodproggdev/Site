import { useState, useEffect } from "react";
import { Alert } from "flowbite-react";
import { useTranslation } from "react-i18next";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000";

interface ContactFormProps {
  planName: string;
  onFormSubmit: () => void;
}

const ContactForm: React.FC<ContactFormProps> = ({ planName, onFormSubmit }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: "",
    subject: planName ? t('contact.form.subjectPlaceholder') : t('contact.form.subjectPlaceholder'),
    message: "",
    plan: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      subject: planName ? `${t('contact.form.subjectPlaceholder')}: ${planName}` : t('contact.form.subjectPlaceholder'),
      plan: planName || ""
    }));
  }, [planName, t]);

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
      const response = await fetch(`${API_BASE}/api/v1/contact/`, {
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
        throw new Error(data.error || t('contact.form.httpError', { status: response.status }));
      }

      setStatus("success");
      setFormData({ email: "", subject: t('contact.form.subjectPlaceholder'), message: "", plan: "" });
      onFormSubmit();

    } catch (error) {
      setStatus("error");
      setErrorMessage(t('contact.form.error'));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  return (
    <section id="contact" className="scroll-mt-24 section-y bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-screen-md container-padding">
        <div className="card-elevated p-8 lg:p-12">
          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="heading-md mb-3 dark:text-white">
              {t('contact.title')}
            </h2>
            <p className="text-body">
              {t('contact.subtitle')}
            </p>
          </div>

          {/* Alerts */}
          {status === "success" && (
            <Alert color="success" className="mb-6 rounded-lg">
              <span className="flex items-center gap-2">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {t('contact.form.success')}
              </span>
            </Alert>
          )}

          {status === "error" && (
            <Alert color="failure" className="mb-6 rounded-lg">
              <span className="flex items-center gap-2">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {errorMessage}
              </span>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="form-label">
                  {t('contact.form.email')}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-base"
                  placeholder={t('contact.form.emailPlaceholder')}
                  required
                />
              </div>

              <div>
                <label htmlFor="plan" className="form-label">
                  {t('contact.form.plan')}
                </label>
                <input
                  type="text"
                  id="plan"
                  name="plan"
                  value={formData.plan}
                  onChange={handleChange}
                  className="input-base"
                  placeholder={t('contact.form.planPlaceholder')}
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="form-label">
                {t('contact.form.subject')}
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="input-base"
                placeholder={t('contact.form.subjectPlaceholder')}
                required
              />
            </div>

            <div>
              <label htmlFor="message" className="form-label">
                {t('contact.form.message')}
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                value={formData.message}
                onChange={handleChange}
                className="input-base resize-none"
                placeholder={t('contact.form.messagePlaceholder')}
              />
            </div>

            <div className="flex justify-center pt-2">
              <button
                type="submit"
                disabled={status === "loading"}
                className="btn-primary btn-lg w-full md:w-auto min-w-[200px]"
              >
                {status === "loading" ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {t('contact.form.sending')}
                  </>
                ) : (
                  <>
                    {t('contact.form.submit')}
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;