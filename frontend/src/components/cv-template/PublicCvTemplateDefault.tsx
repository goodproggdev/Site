import { useMemo, useState } from "react";
import {
  readWorkExperienceList,
  readEducationList,
  readSkillsList,
} from "../../utils/cvTemplateLists";
import {
  readExpertiseList,
  readLanguagesList,
  readStatistics,
  readPortfolioItems,
  readServices,
  readPricingPacks,
  readCvCategory,
  readShowPricing,
} from "../../utils/cvExtraSections";
import { readHero, readPersonalInfo, readSocialLinks, readBlogPosts } from "../../utils/cvPublicTemplateData";
import { getCategoryTheme } from "./categoryTheme";
import StatCounter from "./StatCounter";
import {
  MailIcon,
  PhoneIcon,
  PrinterIcon,
  CloseIcon,
  InstagramIcon,
  GithubIcon,
  LinkedinIcon,
  FacebookIcon,
  TwitterIcon,
} from "./icons";

export interface PublicCvTemplateDefaultProps {
  /** Payload della pagina pubblica (raw_json + `_category`/`_show_pricing`, vedi CVPublicView). */
  raw: Record<string, unknown>;
}

/**
 * Font in stile "biglietto da visita digitale" ispirato ai due esempi di riferimento
 * (Dosis per i titoli, Source Sans per il corpo del testo — entrambi Google Font
 * gratuiti, caricati globalmente in index.html). Diverso dal font del resto del
 * prodotto (Plus Jakarta Sans) di proposito: la pagina CV pubblica è la "vetrina"
 * della singola persona, non l'interfaccia della piattaforma.
 */
const HEADING_FONT = "font-['Dosis']";
const BODY_FONT = "font-['Source_Sans_3']";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0] + parts[parts.length - 1]![0]).toUpperCase();
}

function SectionTitle({
  eyebrow,
  title,
  accentText,
}: {
  eyebrow: string;
  title: string;
  accentText: string;
}) {
  return (
    <div className="mb-8">
      <p className={`text-xs font-bold uppercase tracking-[0.2em] ${accentText}`}>{eyebrow}</p>
      <h2 className={`${HEADING_FONT} mt-1 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl`}>{title}</h2>
    </div>
  );
}

function SidebarNavLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="block rounded-lg px-3 py-2 text-sm font-semibold uppercase tracking-wide text-white/80 transition-colors hover:bg-white/10 hover:text-white"
    >
      {label}
    </a>
  );
}

export default function PublicCvTemplateDefault({ raw }: PublicCvTemplateDefaultProps) {
  const hero = useMemo(() => readHero(raw), [raw]);
  const personalInfo = useMemo(() => readPersonalInfo(raw), [raw]);
  const social = useMemo(() => readSocialLinks(raw), [raw]);
  const category = useMemo(() => readCvCategory(raw), [raw]);
  const showPricing = useMemo(() => readShowPricing(raw), [raw]);
  const theme = useMemo(() => getCategoryTheme(category), [category]);

  const workExperience = useMemo(() => readWorkExperienceList(raw).filter((i) => i.period || i.title || i.subtitle), [raw]);
  const education = useMemo(() => readEducationList(raw).filter((i) => i.period || i.title || i.subtitle), [raw]);
  const skills = useMemo(() => readSkillsList(raw), [raw]);
  const expertise = useMemo(() => readExpertiseList(raw), [raw]);
  const languages = useMemo(() => readLanguagesList(raw), [raw]);
  const statistics = useMemo(() => readStatistics(raw), [raw]);
  const portfolio = useMemo(() => readPortfolioItems(raw), [raw]);
  const services = useMemo(() => readServices(raw), [raw]);
  const pricingPacks = useMemo(() => (showPricing ? readPricingPacks(raw) : []), [raw, showPricing]);
  const blogPosts = useMemo(() => readBlogPosts(raw), [raw]);

  const [activePortfolioIdx, setActivePortfolioIdx] = useState<number | null>(null);
  const activePortfolio = activePortfolioIdx !== null ? portfolio[activePortfolioIdx] : null;

  const hasResume = workExperience.length > 0 || education.length > 0;
  const hasSkillsOrLangs = skills.length > 0 || languages.length > 0;
  const hasContactInfo =
    !!personalInfo.workEmail || !!personalInfo.personalEmail || !!personalInfo.workNumber ||
    !!social.linkedin || !!social.github || !!social.instagram || !!social.facebook || !!social.twitter;
  const contactEmail = personalInfo.workEmail || personalInfo.personalEmail;
  const hasSocial = !!(social.linkedin || social.github || social.instagram || social.facebook || social.twitter);

  return (
    <div className={`min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100 ${BODY_FONT}`}>
      <div className="lg:flex">
        {/* Sidebar: avatar, nome, ruolo, nav e social — fissa su desktop, in cima alla pagina su mobile. */}
        <aside
          id="home"
          className={`relative overflow-hidden bg-gradient-to-b ${theme.heroGradient} px-6 py-10 text-white sm:px-10 lg:fixed lg:inset-y-0 lg:left-0 lg:w-80 lg:overflow-y-auto lg:px-8 lg:py-12`}
        >
          <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 size-64 rounded-full bg-black/10 blur-3xl" />
          <div className="relative mx-auto flex max-w-xs flex-col items-center text-center lg:mx-0 lg:items-start lg:text-left">
            {hero.presentation ? (
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/70">{hero.presentation}</p>
            ) : null}
            <div className="mt-4 flex size-24 items-center justify-center rounded-full bg-white/15 text-2xl font-bold ring-4 ring-white/25 backdrop-blur">
              {initials(hero.name)}
            </div>
            <h1 className={`${HEADING_FONT} mt-4 text-2xl font-bold leading-tight sm:text-3xl`}>
              {hero.name || "Il Tuo Nome"}
            </h1>
            {hero.subtitle ? (
              <p className="mt-2 font-mono text-xs uppercase tracking-wide text-white/85">{hero.subtitle}</p>
            ) : null}

            <button
              type="button"
              onClick={() => window.print()}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl lg:w-auto"
            >
              <PrinterIcon className="size-4" />
              {hero.printResumeLabel}
            </button>

            <nav className="mt-8 w-full space-y-0.5">
              <SidebarNavLink href="#home" label="Home" />
              <SidebarNavLink href="#chi-sono" label="Chi Sono" />
              {hasResume ? <SidebarNavLink href="#resume" label="Resume" /> : null}
              {portfolio.length > 0 ? <SidebarNavLink href="#portfolio" label="Portfolio" /> : null}
              {hasContactInfo ? <SidebarNavLink href="#contatti" label="Contatti" /> : null}
            </nav>

            {hasSocial ? (
              <div className="mt-8 flex w-full items-center justify-center gap-4 border-t border-white/20 pt-6 lg:justify-start">
                {social.linkedin ? (
                  <a href={social.linkedin} target="_blank" rel="noreferrer" className="text-white/80 hover:text-white">
                    <LinkedinIcon className="size-5" />
                  </a>
                ) : null}
                {social.github ? (
                  <a href={social.github} target="_blank" rel="noreferrer" className="text-white/80 hover:text-white">
                    <GithubIcon className="size-5" />
                  </a>
                ) : null}
                {social.instagram ? (
                  <a href={social.instagram} target="_blank" rel="noreferrer" className="text-white/80 hover:text-white">
                    <InstagramIcon className="size-5" />
                  </a>
                ) : null}
                {social.facebook ? (
                  <a href={social.facebook} target="_blank" rel="noreferrer" className="text-white/80 hover:text-white">
                    <FacebookIcon className="size-5" />
                  </a>
                ) : null}
                {social.twitter ? (
                  <a href={social.twitter} target="_blank" rel="noreferrer" className="text-white/80 hover:text-white">
                    <TwitterIcon className="size-5" />
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
        </aside>

        {/* Contenuto principale */}
        <main className="min-w-0 flex-1 lg:ml-80">
          {/* Chi Sono + Info personali */}
          {(hero.aboutWho || hero.aboutDetails || hasContactInfo) ? (
            <section id="chi-sono" className="px-6 py-16 sm:px-10 sm:py-24">
              <div className="mx-auto max-w-4xl">
                <SectionTitle eyebrow="About" title={hero.whoAmILabel} accentText={theme.accentText} />
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    {hero.aboutWho ? (
                      <p className="text-xl font-semibold leading-snug text-gray-900 dark:text-white">{hero.aboutWho}</p>
                    ) : null}
                    {hero.aboutDetails ? (
                      <p className="mt-4 text-base leading-relaxed text-gray-600 dark:text-gray-300">{hero.aboutDetails}</p>
                    ) : null}
                  </div>
                  {hasContactInfo ? (
                    <div className={`rounded-2xl border ${theme.border} ${theme.accentSoftBg} p-6`}>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                        Info Personali
                      </h3>
                      <dl className="mt-4 space-y-3 text-sm">
                        {personalInfo.birthdate ? (
                          <div className="flex justify-between gap-3">
                            <dt className="text-gray-500 dark:text-gray-400">Data di nascita</dt>
                            <dd className="font-medium text-gray-900 dark:text-white">{personalInfo.birthdate}</dd>
                          </div>
                        ) : null}
                        {contactEmail ? (
                          <div className="flex items-center justify-between gap-3">
                            <dt className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                              <MailIcon className="size-3.5" /> Email
                            </dt>
                            <dd className="truncate font-medium text-gray-900 dark:text-white">
                              <a href={`mailto:${contactEmail}`} className="hover:underline">
                                {contactEmail}
                              </a>
                            </dd>
                          </div>
                        ) : null}
                        {personalInfo.workNumber ? (
                          <div className="flex items-center justify-between gap-3">
                            <dt className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                              <PhoneIcon className="size-3.5" /> Telefono
                            </dt>
                            <dd className="font-medium text-gray-900 dark:text-white">
                              <a href={`tel:${personalInfo.workNumber}`} className="hover:underline">
                                {personalInfo.workNumber}
                              </a>
                            </dd>
                          </div>
                        ) : null}
                      </dl>
                    </div>
                  ) : null}
                </div>
              </div>
            </section>
          ) : null}

          {/* Statistiche */}
          {statistics.length > 0 ? (
            <section className={`${theme.accentSoftBg} px-6 py-12 sm:px-10`}>
              <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 sm:grid-cols-4">
                {statistics.map((stat, idx) => (
                  <div key={`${stat.label}-${idx}`} className="text-center">
                    <p className={`${HEADING_FONT} text-3xl font-extrabold sm:text-4xl ${theme.accentText}`}>
                      <StatCounter value={stat.count} />
                    </p>
                    <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 sm:text-sm">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {/* My Expertise */}
          {expertise.length > 0 ? (
            <section className="px-6 py-16 sm:px-10 sm:py-24">
              <div className="mx-auto max-w-4xl">
                <SectionTitle eyebrow="My Expertise" title="Le Mie Competenze Chiave" accentText={theme.accentText} />
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {expertise.map((item, idx) => (
                    <div
                      key={`${item.name}-${idx}`}
                      className={`rounded-2xl border ${theme.border} p-6 transition-shadow hover:shadow-lg`}
                    >
                      <div className={`mb-3 inline-flex size-10 items-center justify-center rounded-lg ${theme.accentSoftBg} ${theme.accentText} text-lg font-bold`}>
                        {idx + 1}
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white">{item.name}</p>
                      {item.subtitle ? (
                        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{item.subtitle}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {/* Portfolio */}
          {portfolio.length > 0 ? (
            <section id="portfolio" className="bg-gray-50 px-6 py-16 dark:bg-gray-900/40 sm:px-10 sm:py-24">
              <div className="mx-auto max-w-4xl">
                <SectionTitle eyebrow="Portfolio" title="My Portfolio" accentText={theme.accentText} />
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {portfolio.map((item, idx) => {
                    const validImage = /^https?:\/\//.test(item.image);
                    return (
                      <button
                        key={`${item.title}-${idx}`}
                        type="button"
                        onClick={() => setActivePortfolioIdx(idx)}
                        className="group overflow-hidden rounded-2xl border border-gray-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-gray-700 dark:bg-gray-900"
                      >
                        <div
                          className={`flex h-40 items-center justify-center ${validImage ? "" : `bg-gradient-to-br ${theme.heroGradient}`}`}
                        >
                          {validImage ? (
                            <img src={item.image} alt={item.alt || item.title} className="size-full object-cover" />
                          ) : (
                            <span className="px-4 text-center text-sm font-semibold text-white/90">{item.title}</span>
                          )}
                        </div>
                        <div className="p-4">
                          <p className="font-semibold text-gray-900 dark:text-white">{item.title}</p>
                          {item.subtitle ? <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{item.subtitle}</p> : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          ) : null}

          {/* Resume */}
          {hasResume ? (
            <section id="resume" className="px-6 py-16 sm:px-10 sm:py-24">
              <div className="mx-auto max-w-4xl">
                <SectionTitle eyebrow="Resume" title="My Resume" accentText={theme.accentText} />
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
                  {workExperience.length > 0 ? (
                    <div>
                      <h3 className={`${HEADING_FONT} mb-5 text-lg font-bold text-gray-800 dark:text-gray-200`}>
                        Esperienze Lavorative
                      </h3>
                      <ol className="space-y-6 border-l-2 border-gray-200 pl-5 dark:border-gray-700">
                        {workExperience.map((item, idx) => (
                          <li key={idx} className="relative">
                            <span className={`absolute size-3 rounded-full ${theme.accentBg} left-[-27px] top-1`} />
                            {item.period ? (
                              <p className={`text-xs font-semibold uppercase tracking-wide ${theme.accentText}`}>{item.period}</p>
                            ) : null}
                            {item.title ? <p className="mt-1 font-semibold text-gray-900 dark:text-white">{item.title}</p> : null}
                            {item.subtitle ? (
                              <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{item.subtitle}</p>
                            ) : null}
                          </li>
                        ))}
                      </ol>
                    </div>
                  ) : null}
                  {education.length > 0 ? (
                    <div>
                      <h3 className={`${HEADING_FONT} mb-5 text-lg font-bold text-gray-800 dark:text-gray-200`}>
                        Formazione
                      </h3>
                      <ol className="space-y-6 border-l-2 border-gray-200 pl-5 dark:border-gray-700">
                        {education.map((item, idx) => (
                          <li key={idx} className="relative">
                            <span className={`absolute size-3 rounded-full ${theme.accentBg} left-[-27px] top-1`} />
                            {item.period ? (
                              <p className={`text-xs font-semibold uppercase tracking-wide ${theme.accentText}`}>{item.period}</p>
                            ) : null}
                            {item.title ? <p className="mt-1 font-semibold text-gray-900 dark:text-white">{item.title}</p> : null}
                            {item.subtitle ? (
                              <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{item.subtitle}</p>
                            ) : null}
                          </li>
                        ))}
                      </ol>
                    </div>
                  ) : null}
                </div>
              </div>
            </section>
          ) : null}

          {/* Skills + Lingue */}
          {hasSkillsOrLangs ? (
            <section className="bg-gray-50 px-6 py-16 dark:bg-gray-900/40 sm:px-10 sm:py-24">
              <div className="mx-auto grid max-w-4xl grid-cols-1 gap-10 lg:grid-cols-2">
                {skills.length > 0 ? (
                  <div>
                    <SectionTitle eyebrow="Skills" title="Competenze" accentText={theme.accentText} />
                    <div className="-mt-4 flex flex-wrap gap-2">
                      {skills.map((s, idx) => (
                        <span key={`${s.name}-${idx}`} className={`rounded-full px-3 py-1.5 text-sm font-medium ${theme.chipBg}`}>
                          {s.name}
                          {s.level && s.level !== "N/A" ? <span className="ml-1.5 opacity-70">· {s.level}</span> : null}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
                {languages.length > 0 ? (
                  <div>
                    <SectionTitle eyebrow="Languages" title="Lingue" accentText={theme.accentText} />
                    <div className="-mt-4 flex flex-wrap gap-2">
                      {languages.map((l, idx) => (
                        <span key={`${l.name}-${idx}`} className={`rounded-full px-3 py-1.5 text-sm font-medium ${theme.chipBg}`}>
                          {l.name}
                          {l.level ? <span className="ml-1.5 opacity-70">· {l.level}</span> : null}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}

          {/* Services */}
          {services.length > 0 ? (
            <section className="px-6 py-16 sm:px-10 sm:py-24">
              <div className="mx-auto max-w-4xl">
                <SectionTitle eyebrow="Services" title="My Services" accentText={theme.accentText} />
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {services.map((item, idx) => (
                    <div key={`${item.title}-${idx}`} className={`rounded-2xl border ${theme.border} p-6`}>
                      <p className="font-semibold text-gray-900 dark:text-white">{item.title}</p>
                      {item.description ? (
                        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{item.description}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
                {contactEmail ? (
                  <div className={`mt-10 rounded-2xl bg-gradient-to-r ${theme.heroGradient} p-8 text-center text-white`}>
                    <p className="text-lg font-semibold sm:text-xl">Disponibile per nuovi progetti.</p>
                    <a
                      href={`mailto:${contactEmail}`}
                      className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 shadow-lg transition hover:-translate-y-0.5"
                    >
                      <MailIcon className="size-4" />
                      Contattami
                    </a>
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}

          {/* Pricing */}
          {pricingPacks.length > 0 ? (
            <section className="bg-gray-50 px-6 py-16 dark:bg-gray-900/40 sm:px-10 sm:py-24">
              <div className="mx-auto max-w-4xl">
                <SectionTitle eyebrow="Pricing" title="Tariffe" accentText={theme.accentText} />
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {pricingPacks.map((pack, idx) => (
                    <div
                      key={`${pack.title}-${idx}`}
                      className={`flex flex-col rounded-2xl border p-6 text-center ${
                        pack.specialClass
                          ? `${theme.border} ${theme.accentSoftBg} ring-2 ${theme.ring}`
                          : "border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <p className="font-semibold text-gray-900 dark:text-white">{pack.title}</p>
                      {pack.cost ? <p className={`${HEADING_FONT} mt-3 text-2xl font-extrabold ${theme.accentText}`}>{pack.cost}</p> : null}
                      <ul className="mt-4 flex-1 space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
                        {pack.project ? <li>{pack.project}</li> : null}
                        {pack.storage && pack.storage !== "-" ? <li>{pack.storage}</li> : null}
                        {pack.users && pack.users !== "-" ? <li>{pack.users}</li> : null}
                      </ul>
                      {contactEmail ? (
                        <a
                          href={`mailto:${contactEmail}?subject=${encodeURIComponent(pack.title)}`}
                          className={`mt-5 inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-semibold text-white ${theme.accentBg} ${theme.accentBgHover}`}
                        >
                          Parliamone
                        </a>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {/* Blog / Novità (opzionale, solo se presente) */}
          {blogPosts.length > 0 ? (
            <section className="px-6 py-16 sm:px-10 sm:py-24">
              <div className="mx-auto max-w-4xl">
                <SectionTitle eyebrow="News" title="Novità" accentText={theme.accentText} />
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {blogPosts.map((post, idx) => (
                    <div key={`${post.title}-${idx}`} className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700">
                      {/^https?:\/\//.test(post.image) ? (
                        <img src={post.image} alt={post.alt || post.title} className="h-32 w-full object-cover" />
                      ) : null}
                      <div className="p-4">
                        <p className="font-semibold text-gray-900 dark:text-white">{post.title}</p>
                        {post.description ? (
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{post.description}</p>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {/* Contatti / Footer */}
          <footer id="contatti" className={`${theme.accentSoftBg} px-6 py-12 text-center sm:px-10`}>
            {contactEmail ? (
              <a
                href={`mailto:${contactEmail}`}
                className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white ${theme.accentBg} ${theme.accentBgHover}`}
              >
                <MailIcon className="size-4" />
                Contattami
              </a>
            ) : null}
            <p className="mt-6 text-xs text-gray-500 dark:text-gray-400">
              Pagina generata con Nordevit — {hero.name || "CV Digitale"}
            </p>
          </footer>
        </main>
      </div>

      {/* Modal Portfolio */}
      {activePortfolio ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setActivePortfolioIdx(null)}
        >
          <div
            className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActivePortfolioIdx(null)}
              className="absolute right-3 top-3 z-10 rounded-full bg-black/40 p-1.5 text-white hover:bg-black/60"
            >
              <CloseIcon className="size-4" />
            </button>
            {/^https?:\/\//.test(activePortfolio.image) ? (
              <img src={activePortfolio.image} alt={activePortfolio.alt || activePortfolio.title} className="h-48 w-full object-cover" />
            ) : (
              <div className={`flex h-32 items-center justify-center bg-gradient-to-br ${theme.heroGradient}`}>
                <span className="px-4 text-center text-lg font-semibold text-white/90">{activePortfolio.title}</span>
              </div>
            )}
            <div className="p-6">
              <p className={`${HEADING_FONT} text-lg font-bold text-gray-900 dark:text-white`}>{activePortfolio.title}</p>
              {activePortfolio.subtitle ? (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{activePortfolio.subtitle}</p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
