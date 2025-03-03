import i18n from "i18next"
import { initReactI18next } from "react-i18next"

const resources = {
	en: {
		translation: {
			"title": "Payments tool for software companies",
			"description": "From checkout to global sales tax compliance...",
			"get_started": "Get started",
			"upload_cv": "Upload CV"
		}
	},
	it: {
		translation: {
			"title": "Strumento di pagamento per aziende software",
			"description": "Dal checkout alla conformità fiscale globale...",
			"get_started": "Inizia ora",
			"upload_cv": "Carica CV"
		}
	}
}

i18n.use(initReactI18next).init({
	resources,
	lng: localStorage.getItem("language") || "en", 
	fallbackLng: "en",
	interpolation: { escapeValue: false }
})

export default i18n
