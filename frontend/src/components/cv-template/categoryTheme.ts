/**
 * Temi visivi per la pagina pubblica del CV, uno per categoria professionale.
 * Le classi Tailwind sono scritte per intero (niente interpolazione di
 * colore in stringa) perché il JIT di Tailwind le trova solo se compaiono
 * letteralmente nel sorgente.
 */
export interface CategoryTheme {
  heroGradient: string;
  accentText: string;
  accentBg: string;
  accentBgHover: string;
  accentSoftBg: string;
  chipBg: string;
  ring: string;
  border: string;
  navHover: string;
}

const THEMES: Record<string, CategoryTheme> = {
  "digitale-it": {
    heroGradient: "from-indigo-700 via-indigo-600 to-purple-700",
    accentText: "text-indigo-600 dark:text-indigo-400",
    accentBg: "bg-indigo-600",
    accentBgHover: "hover:bg-indigo-700",
    accentSoftBg: "bg-indigo-50 dark:bg-indigo-900/20",
    chipBg: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
    ring: "ring-indigo-500",
    border: "border-indigo-200 dark:border-indigo-900/50",
    navHover: "hover:text-indigo-600 dark:hover:text-indigo-400",
  },
  "ingegneri-tecnici": {
    heroGradient: "from-slate-700 via-slate-600 to-blue-700",
    accentText: "text-blue-600 dark:text-blue-400",
    accentBg: "bg-blue-600",
    accentBgHover: "hover:bg-blue-700",
    accentSoftBg: "bg-blue-50 dark:bg-blue-900/20",
    chipBg: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    ring: "ring-blue-500",
    border: "border-blue-200 dark:border-blue-900/50",
    navHover: "hover:text-blue-600 dark:hover:text-blue-400",
  },
  "sanitari-assistenziali": {
    heroGradient: "from-teal-700 via-teal-600 to-emerald-700",
    accentText: "text-teal-600 dark:text-teal-400",
    accentBg: "bg-teal-600",
    accentBgHover: "hover:bg-teal-700",
    accentSoftBg: "bg-teal-50 dark:bg-teal-900/20",
    chipBg: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
    ring: "ring-teal-500",
    border: "border-teal-200 dark:border-teal-900/50",
    navHover: "hover:text-teal-600 dark:hover:text-teal-400",
  },
  "commerciale-vendita": {
    heroGradient: "from-amber-600 via-orange-600 to-rose-600",
    accentText: "text-orange-600 dark:text-orange-400",
    accentBg: "bg-orange-600",
    accentBgHover: "hover:bg-orange-700",
    accentSoftBg: "bg-orange-50 dark:bg-orange-900/20",
    chipBg: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    ring: "ring-orange-500",
    border: "border-orange-200 dark:border-orange-900/50",
    navHover: "hover:text-orange-600 dark:hover:text-orange-400",
  },
  "amministrative-finanziarie": {
    heroGradient: "from-blue-700 via-cyan-700 to-cyan-600",
    accentText: "text-cyan-600 dark:text-cyan-400",
    accentBg: "bg-cyan-600",
    accentBgHover: "hover:bg-cyan-700",
    accentSoftBg: "bg-cyan-50 dark:bg-cyan-900/20",
    chipBg: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
    ring: "ring-cyan-500",
    border: "border-cyan-200 dark:border-cyan-900/50",
    navHover: "hover:text-cyan-600 dark:hover:text-cyan-400",
  },
  logistica: {
    heroGradient: "from-orange-700 via-red-600 to-red-700",
    accentText: "text-red-600 dark:text-red-400",
    accentBg: "bg-red-600",
    accentBgHover: "hover:bg-red-700",
    accentSoftBg: "bg-red-50 dark:bg-red-900/20",
    chipBg: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    ring: "ring-red-500",
    border: "border-red-200 dark:border-red-900/50",
    navHover: "hover:text-red-600 dark:hover:text-red-400",
  },
  default: {
    heroGradient: "from-indigo-700 via-violet-700 to-purple-700",
    accentText: "text-indigo-600 dark:text-indigo-400",
    accentBg: "bg-indigo-600",
    accentBgHover: "hover:bg-indigo-700",
    accentSoftBg: "bg-indigo-50 dark:bg-indigo-900/20",
    chipBg: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
    ring: "ring-indigo-500",
    border: "border-indigo-200 dark:border-indigo-900/50",
    navHover: "hover:text-indigo-600 dark:hover:text-indigo-400",
  },
};

export function getCategoryTheme(category: string | null | undefined): CategoryTheme {
  if (category && THEMES[category]) return THEMES[category];
  return THEMES.default;
}
