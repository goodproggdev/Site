import React, { useEffect, useState, Suspense, useRef } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import cvApi from "../api/cvApi";
import { getPublicCvTemplate } from "../components/cv-template/templateRegistry";
import { getRouteLangFromBrowser } from "../utils/localizedPath";
import { applyPublicCvMeta, clearPublicCvMeta, pickCvMetaFromPayload } from "../utils/publicCvMeta";
import { DEFAULT_DOCUMENT_TITLE } from "../config/site";

export type PublicCvErrorCode = "not_found" | "not_published" | "forbidden";

function parsePublicCvError(err: unknown): { code: PublicCvErrorCode; httpStatus: number; apiMessage?: string } {
  if (!axios.isAxiosError(err) || !err.response) {
    return { code: "not_found", httpStatus: 404 };
  }
  const httpStatus = err.response.status ?? 404;
  const data = err.response.data as { error?: string; code?: string } | undefined;
  const apiMessage = typeof data?.error === "string" ? data.error : undefined;
  const rawCode = data?.code;
  if (rawCode === "not_published" || rawCode === "forbidden" || rawCode === "not_found") {
    return { code: rawCode, httpStatus, apiMessage };
  }
  if (httpStatus === 403) {
    return { code: "forbidden", httpStatus, apiMessage };
  }
  return { code: "not_found", httpStatus, apiMessage };
}

function titleKeyForCode(code: PublicCvErrorCode): string {
  if (code === "not_published") return "publicCV.errorNotPublishedTitle";
  if (code === "forbidden") return "publicCV.errorForbiddenTitle";
  return "publicCV.errorNotFoundTitle";
}

function descriptionKeyForCode(code: PublicCvErrorCode): string {
  if (code === "not_published") return "publicCV.errorNotPublishedDescription";
  if (code === "forbidden") return "publicCV.errorForbiddenDescription";
  return "publicCV.errorNotFoundDescription";
}

const PublicCV: React.FC = () => {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const [cvData, setCvData] = useState<Record<string, unknown> | null>(null);
  const [fetchError, setFetchError] = useState<{
    code: PublicCvErrorCode;
    httpStatus: number;
    apiMessage?: string;
  } | null>(null);
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
    setFetchError(null);
    setCvData(null);

    const fetchCV = async () => {
      try {
        const response = await cvApi.get(`/api/v1/cv/public/${slug}/`);
        if (!cancelled) {
          setCvData(response.data);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setFetchError(parsePublicCvError(err));
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
  }, [slug]);

  useEffect(() => {
    if (loading) {
      return;
    }

    const restore = () => {
      clearPublicCvMeta(initialTitleRef.current ?? DEFAULT_DOCUMENT_TITLE);
    };

    if (fetchError || !cvData || !slug) {
      restore();
      if (fetchError && typeof document !== "undefined") {
        document.title = `${t(titleKeyForCode(fetchError.code))} | ${DEFAULT_DOCUMENT_TITLE}`;
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
  }, [cvData, fetchError, loading, slug, t]);

  if (loading)
    return <div className="min-h-screen flex items-center justify-center">{t("common.loading")}...</div>;
  if (fetchError) {
    const { code, httpStatus, apiMessage } = fetchError;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400" aria-hidden="true">
          {httpStatus === 403 ? "403" : "404"}
        </p>
        <h1 className="mt-1 text-center text-2xl font-bold text-gray-800 dark:text-gray-100">
          {t(titleKeyForCode(code))}
        </h1>
        <p className="mt-3 max-w-md text-center text-gray-600 dark:text-gray-400">{t(descriptionKeyForCode(code))}</p>
        {apiMessage ? (
          <p className="mt-2 max-w-md text-center text-xs text-gray-500 dark:text-gray-500">{apiMessage}</p>
        ) : null}
        <a
          href={`/${getRouteLangFromBrowser()}/`}
          className="mt-6 text-indigo-600 hover:underline dark:text-indigo-400 cursor-pointer rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        >
          {t("publicCV.backHome")}
        </a>
      </div>
    );
  }

  if (!cvData) {
    return null;
  }

  const Template = getPublicCvTemplate(String(cvData._template_slug ?? ""));

  return (
    <div className="public-cv-container">
      <Suspense fallback={<div>{t("common.loading")}...</div>}>
        <Template raw={cvData} />
      </Suspense>
    </div>
  );
};

export default PublicCV;
