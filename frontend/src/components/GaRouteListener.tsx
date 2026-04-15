import { useGaPageViews } from "../hooks/useGaPageViews";

/** Deve essere montato dentro `BrowserRouter`. */
export default function GaRouteListener() {
  useGaPageViews();
  return null;
}
