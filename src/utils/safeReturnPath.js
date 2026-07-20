const ALLOWED_PREFIXES = [
  '/',
  '/checkout',
  '/cart',
  '/shop',
  '/products/',
  '/account',
  '/favorites',
  '/compare',
  '/help',
  '/order-tracking',
  '/programs',
  '/events',
  '/coaches',
  '/online-training',
];
export function safeInternalReturnPath(value, fallback = '') {
  if (typeof value !== 'string') return fallback;
  let decoded;
  if (value !== value.trim()) return fallback;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return fallback;
  }
  if (
    !decoded.startsWith('/') ||
    decoded.startsWith('//') ||
    decoded.includes('\\') ||
    [...decoded].some((character) => character.charCodeAt(0) < 32)
  )
    return fallback;
  try {
    const url = new URL(decoded, 'https://lha.internal');
    if (url.origin !== 'https://lha.internal' || url.username || url.password) return fallback;
    const path = `${url.pathname}${url.search}${url.hash}`;
    const allowed = ALLOWED_PREFIXES.some((prefix) =>
      prefix === '/'
        ? path === '/'
        : path === prefix ||
          path.startsWith(`${prefix}/`) ||
          path.startsWith(`${prefix}?`) ||
          (prefix.endsWith('/') && path.startsWith(prefix)),
    );
    return allowed ? path : fallback;
  } catch {
    return fallback;
  }
}
