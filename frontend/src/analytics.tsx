import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
let lastTrackedPage: string | undefined;

type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

function initializeGoogleAnalytics() {
  if (!measurementId) return;
  if (window.gtag) return window.gtag;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);

  const dataLayer = (window.dataLayer ||= []);
  window.gtag = function gtag(...args: unknown[]) {
    dataLayer.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", measurementId, { send_page_view: false });

  return window.gtag;
}

export default function GoogleAnalytics() {
  const location = useLocation();

  useEffect(() => {
    if (!measurementId) return;

    const gtag = initializeGoogleAnalytics();

    const pagePath = `${location.pathname}${location.search}`;
    if (!gtag || pagePath === lastTrackedPage) return;

    lastTrackedPage = pagePath;
    gtag("event", "page_view", {
      page_location: window.location.href,
      page_path: pagePath,
      page_title: document.title,
    });
  }, [location.pathname, location.search]);

  return null;
}
