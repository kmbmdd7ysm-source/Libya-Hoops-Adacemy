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
export const PROFILE_IMAGE_MAX_BYTES = 8 * 1024 * 1024;

export async function validateProfileImage(file) {
  if (!file || !String(file.type || '').startsWith('image/'))
    return { valid: false, reason: 'type' };
  if (file.size > PROFILE_IMAGE_MAX_BYTES) return { valid: false, reason: 'size' };
  if (!PROFILE_IMAGE_TYPES.includes(file.type)) return { valid: true };
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const signatureValid =
    (file.type === 'image/jpeg' && SIGNATURES.jpeg(bytes)) ||
    (file.type === 'image/png' && SIGNATURES.png(bytes)) ||
    (file.type === 'image/webp' && SIGNATURES.webp(bytes));
  return signatureValid ? { valid: true } : { valid: false, reason: 'signature' };
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('invalid_profile_image'));
    };
    image.src = url;
  });
}

export async function createProfileImageDataUrl(file, maxSide = 256, quality = 0.72) {
  const image = await loadImage(file);
  const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) throw new Error('profile_image_processing_unavailable');
  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', quality);
}
