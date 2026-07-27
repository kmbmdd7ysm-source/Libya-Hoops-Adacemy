import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { commerceConfig, isSupportedDisplayCurrency } from '../config/commerce';
import { fetchUsdToLydRate } from '../services/commerceSettings';
import { isSupportedCountryCode, normalizeCountryCode } from '../data/countries';
import { convertPrice, formatMoney } from '../services/money';
import {
  clearPendingCommercePreference,
  hasCountryPreference,
  hasCurrencyPreference,
  normalizeCurrency,
  readCountryPreference,
  readCurrencyPreference,
  readPendingCommercePreference,
  writeCountryPreference,
  writeCurrencyPreference,
  writePendingCommercePreference,
} from '../services/commercePreferences';
import { fetchProfile, upsertProfile } from '../services/sync/cloudState';
import { createChannel } from '../services/sync/storage';
import { trackEvent } from '../utils/analytics';
import { useAuth } from './AuthContext';

const CommerceContext = createContext(null);
const CLOUD_DEBOUNCE_MS = 800;
const SAFE_USD_TO_LYD_FALLBACK = 9;

function validProfileCurrency(profile) {
  const value = profile?.preferred_currency || profile?.preferredCurrency;
  return isSupportedDisplayCurrency(value) ? value : null;
}

function validProfileCountry(profile) {
  const value = profile?.preferred_country || profile?.preferredCountry;
  return isSupportedCountryCode(value) ? String(value).toUpperCase() : null;
}

export function CommerceProvider({ children }) {
  const auth = useAuth();
  const userId = auth.user?.id || null;
  const [currency, setCurrencyState] = useState(() => readCurrencyPreference(null));
  const [countryCode, setCountryState] = useState(() => readCountryPreference(null));
  const [preferenceStatus, setPreferenceStatus] = useState('local');
  // A safe public fallback is available immediately so selecting LYD can never
  // merely relabel an unconverted USD amount while the cloud setting loads.
  const [usdToLydRate, setUsdToLydRate] = useState(SAFE_USD_TO_LYD_FALLBACK);
  const [rateStatus, setRateStatus] = useState('fallback');
  const channel = useRef(null);
  const cloudTimer = useRef();
  const generation = useRef(0);
  const explicitCurrency = useRef(false);
  const explicitCountry = useRef(false);

  useEffect(() => {
    let active = true;
    setRateStatus('loading');
    fetchUsdToLydRate()
      .then((rate) => {
        if (!active) return;
        setUsdToLydRate(rate);
        setRateStatus('ready');
      })
      .catch(() => {
        if (!active) return;
        setUsdToLydRate(SAFE_USD_TO_LYD_FALLBACK);
        setRateStatus('fallback');
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    channel.current = createChannel('lha-commerce', (message) => {
      if (message.scope !== (userId || 'guest')) return;
      if (message.type === 'currency') setCurrencyState(normalizeCurrency(message.payload));
      if (message.type === 'country') setCountryState(normalizeCountryCode(message.payload));
    });
    return () => channel.current?.close();
  }, [userId]);

  useEffect(() => {
    const currentGeneration = ++generation.current;
    clearTimeout(cloudTimer.current);
    explicitCurrency.current = false;
    explicitCountry.current = false;

    if (!userId) {
      setCurrencyState(readCurrencyPreference(null));
      setCountryState(readCountryPreference(null));
      setPreferenceStatus('local');
      return;
    }

    setCurrencyState(readCurrencyPreference(userId));
    setCountryState(readCountryPreference(userId));
    setPreferenceStatus('syncing');
    fetchProfile(userId)
      .then((profile) => {
        if (generation.current !== currentGeneration || !profile) return;
        const cloudCurrency = validProfileCurrency(profile);
        const cloudCountry = validProfileCountry(profile);
        if (cloudCurrency && !explicitCurrency.current) {
          setCurrencyState(cloudCurrency);
          writeCurrencyPreference(userId, cloudCurrency);
        }
        if (cloudCountry && !explicitCountry.current) {
          setCountryState(cloudCountry);
          writeCountryPreference(userId, cloudCountry);
        }
        setPreferenceStatus('synced');
      })
      .catch(() => {
        if (generation.current === currentGeneration) {
          setPreferenceStatus(globalThis.navigator?.onLine === false ? 'offline' : 'error');
        }
      });
  }, [userId]);

  useEffect(() => {
    // Geo defaults apply only before the visitor has made an explicit choice.
    if (hasCountryPreference(userId) || hasCurrencyPreference(userId)) return;
    let active = true;
    const controller = new AbortController();
    fetch('/api/geo', { cache: 'no-store', signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((geo) => {
        if (!active || geo?.country !== 'LY' || explicitCurrency.current || explicitCountry.current) return;
        setCountryState('LY');
        setCurrencyState('LYD');
        writeCountryPreference(userId, 'LY');
        writeCurrencyPreference(userId, 'LYD');
      })
      .catch(() => {});
    return () => { active = false; controller.abort(); };
  }, [userId]);

  const persistCloud = useCallback(
    (patch) => {
      if (!userId) return;
      clearTimeout(cloudTimer.current);
      if (globalThis.navigator?.onLine === false) {
        writePendingCommercePreference(userId, patch);
        setPreferenceStatus('offline');
        return;
      }
      setPreferenceStatus('syncing');
      cloudTimer.current = setTimeout(async () => {
        try {
          const existing = (await fetchProfile(userId)) || {};
          await upsertProfile(userId, { ...existing, ...patch });
          clearPendingCommercePreference(userId);
          setPreferenceStatus('synced');
        } catch {
          setPreferenceStatus(globalThis.navigator?.onLine === false ? 'offline' : 'error');
        }
      }, CLOUD_DEBOUNCE_MS);
    },
    [userId],
  );

  useEffect(() => () => clearTimeout(cloudTimer.current), []);
  useEffect(() => {
    const onOnline = () => {
      if (userId && (preferenceStatus === 'offline' || preferenceStatus === 'error')) {
        const pending = readPendingCommercePreference(userId);
        persistCloud(pending || { preferredCurrency: currency, preferredCountry: countryCode });
      }
    };
    globalThis.addEventListener?.('online', onOnline);
    return () => globalThis.removeEventListener?.('online', onOnline);
  }, [userId, preferenceStatus, currency, countryCode, persistCloud]);

  const setCurrency = useCallback(
    (next) => {
      const valid = normalizeCurrency(next);
      explicitCurrency.current = true;
      setCurrencyState(valid);
      writeCurrencyPreference(userId, valid);
      channel.current?.post('currency', valid, { scope: userId || 'guest', version: Date.now() });
      persistCloud({ preferredCurrency: valid, preferredCountry: countryCode });
      trackEvent('currency_changed', { currency: valid });
    },
    [userId, countryCode, persistCloud],
  );

  const setCountryCode = useCallback(
    (next) => {
      const valid = normalizeCountryCode(next);
      explicitCountry.current = true;
      setCountryState(valid);
      writeCountryPreference(userId, valid);
      channel.current?.post('country', valid, { scope: userId || 'guest', version: Date.now() });
      persistCloud({ preferredCurrency: currency, preferredCountry: valid });
      trackEvent('country_changed', { country_code: valid });
    },
    [userId, currency, persistCloud],
  );

  const convert = useCallback(
    (amount, sourceCurrency = commerceConfig.baseCurrency) => {
      if (sourceCurrency !== currency && !usdToLydRate) return null;
      return convertPrice(amount, sourceCurrency, currency, usdToLydRate);
    },
    [currency, usdToLydRate],
  );
  const format = useCallback(
    (amount, lang = 'en', sourceCurrency = commerceConfig.baseCurrency) => {
      if (sourceCurrency !== currency && !usdToLydRate)
        return lang === 'ar' ? 'السعر غير متاح' : 'Price unavailable';
      return formatMoney(
        convertPrice(amount, sourceCurrency, currency, usdToLydRate),
        currency,
        lang,
      );
    },
    [currency, usdToLydRate],
  );

  const value = useMemo(
    () => ({
      currency,
      setCurrency,
      countryCode,
      setCountryCode,
      preferenceStatus,
      convert,
      format,
      config: commerceConfig,
      usdToLydRate,
      rateStatus,
      rateReady: rateStatus === 'ready' || rateStatus === 'fallback',
    }),
    [
      currency,
      setCurrency,
      countryCode,
      setCountryCode,
      preferenceStatus,
      convert,
      format,
      usdToLydRate,
      rateStatus,
    ],
  );
  return <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>;
}

export function useCommerce() {
  const value = useContext(CommerceContext);
  if (!value) throw new Error('useCommerce must be used inside CommerceProvider');
  return value;
}
