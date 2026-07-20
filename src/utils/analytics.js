let gaLoaded = false,
  clarityLoaded = false,
  allowed = false;
const seen = new Map();
const getId = () => import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();
const sanitizeString = (v) =>
  String(v)
    .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, '[email]')
    .replace(/(?:\+?\d[\d\s().-]{7,}\d)/g, '[phone]')
    .slice(0, 100);
export function sanitizePayload(params = {}) {
  const clean = {};
  for (const [k, v] of Object.entries(params)) {
    if (/password|address|email|phone|token|secret/i.test(k)) continue;
    if (v == null) continue;
    clean[k] =
      typeof v === 'string'
        ? sanitizeString(v)
        : typeof v === 'number' || typeof v === 'boolean'
          ? v
          : Array.isArray(v)
            ? v.slice(0, 10).map(sanitizeString)
            : undefined;
  }
  return clean;
}
export function initAnalytics(ok) {
  allowed = Boolean(ok);
  const id = getId();
  if (!allowed || !id || gaLoaded) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function () {
      window.dataLayer.push(arguments);
    };
  window.gtag('js', new Date());
  window.gtag('config', id, {
    send_page_view: false,
    anonymize_ip: true,
    allow_google_signals: false,
  });
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  s.dataset.lhaAnalytics = 'true';
  document.head.appendChild(s);
  gaLoaded = true;
}
export function initHeatmap(ok) {
  const id = import.meta.env.VITE_CLARITY_PROJECT_ID?.trim();
  if (!ok || !id || clarityLoaded) return;
  window.clarity =
    window.clarity ||
    function () {
      (window.clarity.q = window.clarity.q || []).push(arguments);
    };
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.clarity.ms/tag/${encodeURIComponent(id)}`;
  s.dataset.lhaHeatmap = 'true';
  document.head.appendChild(s);
  clarityLoaded = true;
  window.clarity('consent', true);
  window.clarity('set', 'mask-inputs', 'true');
}
export function disableAnalytics() {
  allowed = false;
  const id = getId();
  if (id) window[`ga-disable-${id}`] = true;
}
export function revokeAnalyticsConsent() {
  disableAnalytics();
  if (typeof window.clarity === 'function') window.clarity('consent', false);
  document.querySelectorAll('[data-lha-analytics],[data-lha-heatmap]').forEach((x) => x.remove());
  gaLoaded = false;
  clarityLoaded = false;
}
export function trackEvent(name, params = {}) {
  if (!allowed) return;
  const payload = sanitizePayload(params),
    key = `${name}:${JSON.stringify(payload)}`,
    now = Date.now();
  if (now - (seen.get(key) || 0) < 350) return;
  seen.set(key, now);
  if (import.meta.env.DEV && import.meta.env.VITE_ANALYTICS_DEBUG === 'true')
    console.debug('[analytics]', name, payload);
  try {
    window.gtag?.('event', name, payload);
    window.clarity?.('event', name);
  } catch {}
}
export const safeTrack = trackEvent;
export function trackPage(path) {
  trackEvent('page_view', { page_path: path, page_title: document.title });
}
