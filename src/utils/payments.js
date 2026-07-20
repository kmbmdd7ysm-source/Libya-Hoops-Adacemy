// ============================================================================
// PAYMENT PROVIDER ABSTRACTION
// ----------------------------------------------------------------------------
// This module NEVER contains secret keys and NEVER simulates a successful
// payment. It only prepares the front end to talk to a real, server-side
// checkout endpoint (see README → "How to configure payment provider").
//
// Flow when configured:
//   1. Front end POSTs the cart to `${VITE_CHECKOUT_API_BASE}/create-session`.
//   2. Your serverless function re-validates prices/totals SERVER-SIDE using a
//      secret key, then returns a hosted-checkout URL (e.g. Stripe Checkout).
//   3. Front end redirects the browser to that secure hosted URL.
//   4. Provider redirects back to /checkout/success or /checkout/cancelled.
// ============================================================================

const PROVIDER = import.meta.env.VITE_PAYMENTS_PROVIDER?.trim() || '';
const PUBLISHABLE = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.trim() || '';
const API_BASE = import.meta.env.VITE_CHECKOUT_API_BASE?.trim() || '';

// True only when a provider, publishable key and checkout API are all present.
export function isPaymentsConfigured() {
  return Boolean(PROVIDER && PUBLISHABLE && API_BASE);
}

export function paymentProviderName() {
  return PROVIDER;
}

// Best-effort detection of express wallets actually available in this browser.
// Returns an array like ['apple_pay'] — empty when none are available.
export async function detectWallets() {
  if (!isPaymentsConfigured()) return [];
  const wallets = [];
  try {
    // Apple Pay — only on supported Apple browsers with an active card.
    if (window.ApplePaySession && typeof window.ApplePaySession.canMakePayments === 'function') {
      if (window.ApplePaySession.canMakePayments()) wallets.push('apple_pay');
    }
  } catch {
    /* ignore */
  }
  try {
    // Google Pay / Samsung Pay availability is confirmed by the provider's SDK
    // during hosted checkout. We surface Google Pay as available on Chromium
    // secure contexts; the hosted checkout makes the final decision.
    if (window.PaymentRequest) wallets.push('google_pay');
  } catch {
    /* ignore */
  }
  return wallets;
}

// Ask the server to create a secure checkout session. Throws when not configured.
export async function createCheckoutSession(payload) {
  if (!isPaymentsConfigured()) {
    const err = new Error('PAYMENTS_NOT_CONFIGURED');
    err.code = 'not_configured';
    throw err;
  }
  const res = await fetch(`${API_BASE.replace(/\/$/, '')}/create-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = new Error('CHECKOUT_SESSION_FAILED');
    err.code = 'session_failed';
    throw err;
  }
  return res.json(); // expected: { url: 'https://checkout...' }
}
