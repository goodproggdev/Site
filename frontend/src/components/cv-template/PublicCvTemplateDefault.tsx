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

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0] + parts[parts.length - 1]![0]).toUpperCase();
}

function NavAnchor({ href, label, navHover }: { href: string; label: string; navHover: string }) {
  return (
    <a href={href} className={`text-sm font-medium text-gray-600 transition-colors dark:text-gray-300 ${navHover}`}>
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

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-gray-200/70 bg-white/80 backdrop-blur dark:border-gray-800/70 dark:bg-gray-950/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <span className="truncate text-sm font-bold sm:text-base">{hero.name || "Il tuo CV"}</span>
          <nav className="hidden items-center gap-6 md:flex">
            <NavAnchor href="#chi-sono" label="Chi Sono" navHover={theme.navHover} />
            {hasResume ? <NavAnchor href="#resume" label="Resume" navHover={theme.navHover} /> : null}
            {portfolio.length > 0 ? <NavAnchor href="#portfolio" label="Portfolio" navHover={theme.navHover} /> : null}
            {hasContactInfo ? <NavAnchor href="#contatti" label="Contatti" navHover={theme.navHover} /> : null}
          </nav>
          <button
            type="button"
            onClick={() => window.print()}
            className={`hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white sm:flex ${theme.accentBg} ${theme.accentBgHover} transition-colors`}
          >
            <PrinterIcon className="size-3.5" />
            {hero.printResumeLabel}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section
        id="home"
        className={`relative overflow-hidden bg-gradient-to-br ${theme.heroGradient} px-4 py-16 text-white sm:px-6 sm:py-24`}
      >
        <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 size-96 rounded-full bg-black/10 blur-3xl" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-8 text-center sm:gap-10">
          <div className="flex size-24 shrink-0 items-center justify-center rounded-full bg-white/15 text-3xl font-bold ring-4 ring-white/30 backdrop-blur sm:size-32 sm:text-4xl">
            {initials(hero.name)}
          </div>
          <div>
            {hero.presentation ? (
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70 sm:text-sm">
                {hero.presentation}
              </p>
            ) : null}
            <h1 className="mt-2 text-3xl font-extrabold leading-tight sm:text-5xl">{hero.name || "Il Tuo Nome"}</h1>
            {hero.subtitle ? (
              <p className="mt-3 font-mono text-sm uppercase tracking-wide text-white/85 sm:text-base">{hero.subtitle}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              <PrinterIcon className="size-4" />
              {hero.printResumeLabel}
            </button>
            {contactEmail ? (
              <a
                href={`mailto:${contactEmail}`}
                className="inline-flex items-center gap-2 rounded-full border border-white/40 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <MailIcon className="size-4" />
                Contattami
              </a>
            ) : null}
          </div>
        </div>
      </section>

      {/* Chi Sono + Info personali */}
      {(hero.aboutWho || hero.aboutDetails || hasContactInfo) ? (
        <section id="chi-sono" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h2 className={`text-xs font-bold uppercase tracking-widest ${theme.accentText}`}>{hero.whoAmILabel}</h2>
              {hero.aboutWho ? (
                <p className="mt-3 text-xl font-semibold leading-snug text-gray-900 dark:text-white sm:text-2xl">
                  {hero.aboutWho}
                </p>
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
                {(social.linkedin || social.github || social.instagram || social.facebook || social.twitter) ? (
                  <div className="mt-5 flex gap-3 border-t border-gray-200/70 pt-4 dark:border-gray-700/70">
                    {social.linkedin ? (
                      <a href={social.linkedin} target="_blank" rel="noreferrer" className={`${theme.accentText} hover:opacity-70`}>
                        <LinkedinIcon className="size-5" />
                      </a>
                    ) : null}
                    {social.github ? (
                      <a href={social.github} target="_blank" rel="noreferrer" className={`${theme.accentText} hover:opacity-70`}>
                        <GithubIcon className="size-5" />
                      </a>
                    ) : null}
                    {social.instagram ? (
                      <a href={social.instagram} target="_blank" rel="noreferrer" className={`${theme.accentText} hover:opacity-70`}>
                        <InstagramIcon className="size-5" />
                      </a>
                    ) : null}
                    {social.facebook ? (
                      <a href={social.facebook} target="_blank" rel="noreferrer" className={`${theme.accentText} hover:opacity-70`}>
                        <FacebookIcon className="size-5" />
                      </a>
                    ) : null}
                    {social.twitter ? (
                      <a href={social.twitter} target="_blank" rel="noreferrer" className={`${theme.accentText} hover:opacity-70`}>
                        <TwitterIcon className="size-5" />
                      </a>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Statistiche */}
      {statistics.length > 0 ? (
        <section className={`${theme.accentSoftBg} px-4 py-12 sm:px-6`}>
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 sm:grid-cols-4">
            {statistics.map((stat, idx) => (
              <div key={`${stat.label}-${idx}`} className="text-center">
                <p className={`text-3xl font-extrabold sm:text-4xl ${theme.accentText}`}>
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
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <h2 className={`text-xs font-bold uppercase tracking-widest ${theme.accentText}`}>My Expertise</h2>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">Le Mie Competenze Chiave</p>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
        </section>
      ) : null}

      {/* Portfolio */}
      {portfolio.length > 0 ? (
        <section id="portfolio" className="bg-gray-50 px-4 py-14 dark:bg-gray-900/40 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className={`text-xs font-bold uppercase tracking-widest ${theme.accentText}`}>Portfolio</h2>
            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">My Portfolio</p>
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
        <section id="resume" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <h2 className={`text-xs font-bold uppercase tracking-widest ${theme.accentText}`}>Resume</h2>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">My Resume</p>
          <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2">
            {workExperience.length > 0 ? (
              <div>
                <h3 className="mb-5 text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Esperienze Lavorative
                </h3>
                <ol className="space-y-6 border-l-2 border-gray-200 pl-5 dark:border-gray-700">
                  {workExperience.map((item, idx) => (
                    <li key={idx} className="relative">
                      <span className={`absolute left-[-27px] top-1 size-3 rounded-full ${theme.accentBg}`} />
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
                <h3 className="mb-5 text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Formazione
                </h3>
                <ol className="space-y-6 border-l-2 border-gray-200 pl-5 dark:border-gray-700">
                  {education.map((item, idx) => (
                    <li key={idx} className="relative">
                      <span className={`absolute left-[-27px] top-1 size-3 rounded-full ${theme.accentBg}`} />
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
        </section>
      ) : null}

      {/* Skills + Lingue */}
      {hasSkillsOrLangs ? (
        <section className="bg-gray-50 px-4 py-14 dark:bg-gray-900/40 sm:px-6 sm:py-20">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 lg:grid-cols-2">
            {skills.length > 0 ? (
              <div>
                <h2 className={`text-xs font-bold uppercase tracking-widest ${theme.accentText}`}>Skills</h2>
                <p className="mt-2 text-xl font-bold text-gray-900 dark:text-white">Competenze</p>
                <div className="mt-5 flex flex-wrap gap-2">
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
                <h2 className={`text-xs font-bold uppercase tracking-widest ${theme.accentText}`}>Languages</h2>
                <p className="mt-2 text-xl font-bold text-gray-900 dark:text-white">Lingue</p>
                <div className="mt-5 flex flex-wrap gap-2">
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
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <h2 className={`text-xs font-bold uppercase tracking-widest ${theme.accentText}`}>Services</h2>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">My Services</p>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
        </section>
      ) : null}

      {/* Pricing */}
      {pricingPacks.length > 0 ? (
        <section className="bg-gray-50 px-4 py-14 dark:bg-gray-900/40 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className={`text-xs font-bold uppercase tracking-widest ${theme.accentText}`}>Pricing</h2>
            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">Tariffe</p>
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
                  {pack.cost ? <p className={`mt-3 text-2xl font-extrabold ${theme.accentText}`}>{pack.cost}</p> : null}
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
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <h2 className={`text-xs font-bold uppercase tracking-widest ${theme.accentText}`}>News</h2>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">Novità</p>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
        </section>
      ) : null}

      {/* Contatti / Footer */}
      <footer id="contatti" className={`${theme.accentSoftBg} px-4 py-12 text-center sm:px-6`}>
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
              <p className="text-lg font-bold text-gray-900 dark:text-white">{activePortfolio.title}</p>
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
