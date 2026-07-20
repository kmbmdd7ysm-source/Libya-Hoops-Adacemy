export const FORMSPREE_ENDPOINT =
  import.meta.env.VITE_FORM_ENDPOINT?.trim() || 'https://formspree.io/f/mqerbqvd';

export async function sendFormspree(payload, subject = 'Libya Hoops Academy website message') {
  const response = await fetch(FORMSPREE_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ _subject: subject, ...payload }),
  });
  if (!response.ok) throw new Error('formspree_delivery_failed');
  return response;
}
