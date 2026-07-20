import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const originalServiceWorker = navigator.serviceWorker;

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  vi.resetModules();
  Object.defineProperty(navigator, 'serviceWorker', {
    configurable: true,
    value: originalServiceWorker,
  });
  document.head
    .querySelectorAll('[data-lha-analytics],[data-lha-heatmap]')
    .forEach((x) => x.remove());
  delete window.gtag;
  delete window.clarity;
  delete window.ApplePaySession;
  delete window.PaymentRequest;
});

describe('analytics consent lifecycle', () => {
  beforeEach(() => vi.resetModules());

  it('loads analytics and heatmap only after consent, deduplicates, then revokes', async () => {
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', 'G-TEST');
    vi.stubEnv('VITE_CLARITY_PROJECT_ID', 'clarity-test');
    vi.stubEnv('VITE_ANALYTICS_DEBUG', 'true');
    vi.stubEnv('DEV', true);
    const debug = vi.spyOn(console, 'debug').mockImplementation(() => {});
    const mod = await import('../src/utils/analytics.js');

    mod.initAnalytics(true);
    mod.initAnalytics(true);
    mod.initHeatmap(true);
    mod.initHeatmap(true);
    expect(document.querySelectorAll('[data-lha-analytics]')).toHaveLength(1);
    expect(document.querySelectorAll('[data-lha-heatmap]')).toHaveLength(1);
    expect(typeof window.gtag).toBe('function');
    expect(typeof window.clarity).toBe('function');

    const gtag = vi.fn();
    const clarity = vi.fn();
    window.gtag = gtag;
    window.clarity = clarity;
    vi.spyOn(Date, 'now').mockReturnValue(1000);
    mod.trackEvent('search', { query: 'safe' });
    mod.trackEvent('search', { query: 'safe' });
    expect(gtag).toHaveBeenCalledTimes(1);
    expect(clarity).toHaveBeenCalledTimes(1);
    expect(debug).toHaveBeenCalled();

    mod.disableAnalytics();
    expect(window['ga-disable-G-TEST']).toBe(true);
    mod.revokeAnalyticsConsent();
    expect(document.querySelectorAll('[data-lha-analytics],[data-lha-heatmap]')).toHaveLength(0);
  });

  it('does nothing without consent or IDs and isolates provider failures', async () => {
    const mod = await import('../src/utils/analytics.js');
    mod.initAnalytics(false);
    mod.initHeatmap(false);
    expect(document.querySelectorAll('script')).toHaveLength(0);
    mod.initAnalytics(true);
    window.gtag = () => {
      throw new Error('provider');
    };
    mod.trackEvent('route', { path: '/' });
    expect(() => mod.trackPage('/')).not.toThrow();
  });
});

describe('payment browser abstraction', () => {
  it('detects wallets and creates a hosted session only when configured', async () => {
    vi.stubEnv('VITE_PAYMENTS_PROVIDER', 'hosted');
    vi.stubEnv('VITE_STRIPE_PUBLISHABLE_KEY', 'pk_test');
    vi.stubEnv('VITE_CHECKOUT_API_BASE', 'https://checkout.example.test/');
    window.ApplePaySession = { canMakePayments: vi.fn(() => true) };
    window.PaymentRequest = function PaymentRequest() {};
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue({ ok: true, json: async () => ({ url: 'https://hosted.example' }) });
    const mod = await import('../src/utils/payments.js');
    expect(mod.isPaymentsConfigured()).toBe(true);
    expect(mod.paymentProviderName()).toBe('hosted');
    expect(await mod.detectWallets()).toEqual(['apple_pay', 'google_pay']);
    await expect(mod.createCheckoutSession({ cart: [1] })).resolves.toEqual({
      url: 'https://hosted.example',
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://checkout.example.test/create-session',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('handles wallet detection exceptions and failed hosted sessions', async () => {
    vi.stubEnv('VITE_PAYMENTS_PROVIDER', 'hosted');
    vi.stubEnv('VITE_STRIPE_PUBLISHABLE_KEY', 'pk_test');
    vi.stubEnv('VITE_CHECKOUT_API_BASE', 'https://checkout.example.test');
    Object.defineProperty(window, 'ApplePaySession', {
      configurable: true,
      get() {
        throw new Error('blocked');
      },
    });
    Object.defineProperty(window, 'PaymentRequest', {
      configurable: true,
      get() {
        throw new Error('blocked');
      },
    });
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false });
    const mod = await import('../src/utils/payments.js');
    expect(await mod.detectWallets()).toEqual([]);
    await expect(mod.createCheckoutSession({})).rejects.toMatchObject({ code: 'session_failed' });
  });
});

describe('PWA registration lifecycle', () => {
  it('registers, emits install/update/controller events, prompts and applies updates', async () => {
    vi.stubEnv('DEV', false);
    const waiting = { postMessage: vi.fn() };
    let updateFound;
    let stateChange;
    const installing = {
      state: 'installing',
      addEventListener: vi.fn((name, fn) => {
        if (name === 'statechange') stateChange = fn;
      }),
    };
    const registration = {
      waiting,
      installing,
      addEventListener: vi.fn((name, fn) => {
        if (name === 'updatefound') updateFound = fn;
      }),
    };
    let controllerChange;
    const sw = {
      controller: {},
      register: vi.fn().mockResolvedValue(registration),
      addEventListener: vi.fn((name, fn) => {
        if (name === 'controllerchange') controllerChange = fn;
      }),
    };
    Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: sw });
    const events = new Map();
    vi.stubGlobal(
      'addEventListener',
      vi.fn((name, fn) => events.set(name, fn)),
    );
    const mod = await import('../src/utils/registerPwa.js');
    const received = [];
    const unsubscribe = mod.onPwaEvent((event) => received.push(event.type));
    mod.registerPwa();
    await vi.waitFor(() => expect(sw.register).toHaveBeenCalled());
    expect(received).toContain('update-ready');

    const prompt = vi.fn();
    events.get('beforeinstallprompt')({
      preventDefault: vi.fn(),
      prompt,
      userChoice: Promise.resolve({ outcome: 'accepted' }),
    });
    expect(await mod.promptInstall()).toBe(true);
    expect(prompt).toHaveBeenCalled();
    events.get('appinstalled')();
    updateFound();
    installing.state = 'installed';
    stateChange();
    controllerChange();
    expect(received).toContain('installed');
    expect(received).toContain('controller-changed');
    mod.applyPwaUpdate();
    expect(waiting.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
    unsubscribe();
  });

  it('warns on registration failure and supports dismissed install/standalone fallback', async () => {
    vi.stubEnv('DEV', false);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const sw = { register: vi.fn().mockRejectedValue(new Error('no sw')) };
    Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: sw });
    const events = new Map();
    vi.stubGlobal(
      'addEventListener',
      vi.fn((name, fn) => events.set(name, fn)),
    );
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: false })),
    );
    Object.defineProperty(navigator, 'standalone', { configurable: true, value: false });
    const mod = await import('../src/utils/registerPwa.js');
    mod.registerPwa();
    await vi.waitFor(() => expect(warn).toHaveBeenCalled());
    events.get('beforeinstallprompt')({
      preventDefault() {},
      prompt: vi.fn(),
      userChoice: Promise.resolve({ outcome: 'dismissed' }),
    });
    expect(await mod.promptInstall()).toBe(false);
    expect(mod.isStandalone()).toBe(false);
  });
});

describe('PWA defensive branches', () => {
  it('skips registration in development and without service worker, and handles empty actions', async () => {
    vi.stubEnv('DEV', true);
    Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: undefined });
    const mod = await import('../src/utils/registerPwa.js?defensive=1');
    expect(mod.registerPwa()).toBeUndefined();
    expect(await mod.promptInstall()).toBe(false);
    expect(mod.applyPwaUpdate()).toBeUndefined();
  });

  it('covers installed worker without controller and standalone true branches', async () => {
    vi.stubEnv('DEV', false);
    let stateChange;
    const installing = {
      state: 'installing',
      addEventListener: vi.fn((_, fn) => {
        stateChange = fn;
      }),
    };
    const registration = { waiting: null, installing, addEventListener: vi.fn((_, fn) => fn()) };
    const sw = {
      controller: null,
      register: vi.fn().mockResolvedValue(registration),
      addEventListener: vi.fn(),
    };
    Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: sw });
    vi.stubGlobal('addEventListener', vi.fn());
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: true })),
    );
    const mod = await import('../src/utils/registerPwa.js?defensive=2');
    mod.registerPwa();
    await vi.waitFor(() => expect(sw.register).toHaveBeenCalled());
    installing.state = 'installed';
    stateChange();
    expect(mod.isStandalone()).toBe(true);
  });
});
