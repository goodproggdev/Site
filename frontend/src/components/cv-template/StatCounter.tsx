import { useEffect, useState } from "react";

/**
 * Numero animato "count up" all'apertura della pagina (non legato allo scroll:
 * niente IntersectionObserver, per evitare dipendenze da comportamenti di
 * scroll/viewport che possono variare tra browser/dispositivi).
 */
export default function StatCounter({ value, className }: { value: string | number; className?: string }) {
  const numeric = typeof value === "number" ? value : Number(String(value).replace(/[^\d.-]/g, ""));
  const isAnimatable = typeof value === "number" || (Number.isFinite(numeric) && String(value).trim() === String(numeric));
  const [display, setDisplay] = useState<string>(isAnimatable ? "0" : String(value));

  useEffect(() => {
    if (!isAnimatable) {
      setDisplay(String(value));
      return;
    }
    const duration = 1200;
    const startTime = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - (1 - progress) * (1 - progress);
      setDisplay(String(Math.round(numeric * eased)));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numeric, isAnimatable, value]);

  return <span className={className}>{display}</span>;
}
