import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ensureGa4ScriptForAcceptedUser, trackPageView } from "../analytics/ga4";

/** Invia `page_view` su ogni cambio route se GA4 è configurato e il consenso cookie è `accepted`. */
export function useGaPageViews(): void {
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
    void ensureGa4ScriptForAcceptedUser().then((ok) => {
      if (cancelled || !ok) return;
      trackPageView(location.pathname + location.search);
    });
    return () => {
      cancelled = true;
    };
  }, [location.pathname, location.search]);
}
