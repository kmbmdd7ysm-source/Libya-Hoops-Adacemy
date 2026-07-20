const SIGNATURES = {
  jpeg: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  png: (b) =>
    b[0] === 0x89 &&
    b[1] === 0x50 &&
    b[2] === 0x4e &&
    b[3] === 0x47 &&
    b[4] === 0x0d &&
    b[5] === 0x0a &&
    b[6] === 0x1a &&
    b[7] === 0x0a,
  webp: (b) =>
    String.fromCharCode(...b.slice(0, 4)) === 'RIFF' &&
    String.fromCharCode(...b.slice(8, 12)) === 'WEBP',
};

export const PROFILE_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const PROFILE_IMAGE_MAX_BYTES = Number.POSITIVE_INFINITY;

export async function validateProfileImage(file) {
  if (!file || !String(file.type || '').startsWith('image/')) {
    return { valid: false, reason: 'type' };
  }

  // Validate signatures for the formats we know. Other browser-recognized image
  // formats (for example HEIC/HEIF on mobile devices) are accepted for preview.
  if (!PROFILE_IMAGE_TYPES.includes(file.type)) return { valid: true };

  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const signatureValid =
    (file.type === 'image/jpeg' && SIGNATURES.jpeg(bytes)) ||
    (file.type === 'image/png' && SIGNATURES.png(bytes)) ||
    (file.type === 'image/webp' && SIGNATURES.webp(bytes));
  return signatureValid ? { valid: true } : { valid: false, reason: 'signature' };
}
