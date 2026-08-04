import { useEffect, useRef, useState } from "react";

/** Numero animato "count up" quando entra in viewport (nessuna dipendenza esterna). */
export default function StatCounter({ value, className }: { value: string | number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState<string>(typeof value === "number" ? "0" : String(value));
  const numeric = typeof value === "number" ? value : Number(String(value).replace(/[^\d.-]/g, ""));
  const isAnimatable = typeof value === "number" || (Number.isFinite(numeric) && String(value).trim() === String(numeric));

  useEffect(() => {
    if (!isAnimatable || !ref.current) {
      setDisplay(String(value));
      return;
    }
    const el = ref.current;
    let started = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !started) {
          started = true;
          const duration = 1200;
          const startTime = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - (1 - progress) * (1 - progress);
            setDisplay(String(Math.round(numeric * eased)));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numeric, isAnimatable]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
