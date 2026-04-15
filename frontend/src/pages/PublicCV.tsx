import React, { useEffect, useState, Suspense, useRef } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import cvApi from "../api/cvApi";
import Home from "./Home";
import { getRouteLangFromBrowser } from "../utils/localizedPath";
import { applyPublicCvMeta, clearPublicCvMeta, pickCvMetaFromPayload } from "../utils/publicCvMeta";
import { DEFAULT_DOCUMENT_TITLE } from "../config/site";

const PublicCV: React.FC = () => {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const [cvData, setCvData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const initialTitleRef = useRef<string | null>(null);

  useEffect(() => {
    if (initialTitleRef.current === null && typeof document !== "undefined") {
      initialTitleRef.current = document.title;
    }
  }, []);

  useEffect(() => {
    if (!slug) {
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    setCvData(null);

    const fetchCV = async () => {
      try {
        const response = await cvApi.get(`/api/v1/cv/public/${slug}/`);
        if (!cancelled) {
          setCvData(response.data);
        }
      } catch (err: unknown) {
        const msg =
          err && typeof err === "object" && "response" in err
            ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
            : undefined;
        if (!cancelled) {
          setError(msg || t("publicCV.notFound"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchCV();
    return () => {
      cancelled = true;
    };
  }, [slug, t]);

  useEffect(() => {
    if (loading) {
      return;
    }

    const restore = () => {
      clearPublicCvMeta(initialTitleRef.current ?? DEFAULT_DOCUMENT_TITLE);
    };

    if (error || !cvData || !slug) {
      restore();
      if (error && typeof document !== "undefined") {
        document.title = `${t("errors.notFound")} | ${DEFAULT_DOCUMENT_TITLE}`;
      }
      return;
    }

    const { name, description } = pickCvMetaFromPayload(cvData, slug);
    const pageUrl = typeof window !== "undefined" ? window.location.href : "";
    applyPublicCvMeta({
      title: t("publicCV.pageTitle", { name }),
      description: description || t("publicCV.metaDescriptionFallback", { name }),
      pageUrl,
    });

    return restore;
  }, [cvData, error, loading, slug, t]);

  if (loading)
    return <div className="min-h-screen flex items-center justify-center">{t("common.loading")}...</div>;
  if (error)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          404 - {t("errors.notFound")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{error}</p>
        <a
          href={`/${getRouteLangFromBrowser()}/`}
          className="mt-4 text-indigo-600 hover:underline dark:text-indigo-400 cursor-pointer rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        >
          {t("publicCV.backHome")}
        </a>
      </div>
    );

  return (
    <div className="public-cv-container">
      <Suspense fallback={<div>{t("common.loading")}...</div>}>
        <Home initialData={cvData ?? undefined} isPublicView={true} />
      </Suspense>
    </div>
  );
};

export default PublicCV;
