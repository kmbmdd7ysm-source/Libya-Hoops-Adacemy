const listeners = new Set();
let registration = null,
  deferredPrompt = null;
export const onPwaEvent = (fn) => (listeners.add(fn), () => listeners.delete(fn));
const emit = (type, detail = {}) => listeners.forEach((fn) => fn({ type, ...detail }));
export function registerPwa() {
  if (!('serviceWorker' in navigator) || import.meta.env.DEV) return;
  addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    emit('install-available');
  });
  addEventListener('appinstalled', () => {
    deferredPrompt = null;
    emit('installed');
  });
  navigator.serviceWorker
    .register('/sw.js', { scope: '/', updateViaCache: 'none' })
    .then((reg) => {
      registration = reg;
      reg.update().catch(() => {});
      if (reg.waiting) {
        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        emit('update-ready', { registration: reg });
      }
      reg.addEventListener('updatefound', () => {
        const w = reg.installing;
        w?.addEventListener('statechange', () => {
          if (w.state === 'installed' && navigator.serviceWorker.controller) {
            w.postMessage({ type: 'SKIP_WAITING' });
            emit('update-ready', { registration: reg });
          }
        });
      });
      navigator.serviceWorker.addEventListener('controllerchange', () =>
        emit('controller-changed'),
      );
    })
    .catch((e) => console.warn('PWA registration failed', e));
}
export async function promptInstall() {
  if (!deferredPrompt) return false;
  await deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  return outcome === 'accepted';
}
export function applyPwaUpdate() {
  const w = registration?.waiting;
  if (w) w.postMessage({ type: 'SKIP_WAITING' });
}
export const isStandalone = () =>
  matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
