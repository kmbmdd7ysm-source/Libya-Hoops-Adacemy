import { commerceConfig, isSupportedDisplayCurrency } from '../config/commerce';

const MINOR_SCALE = 100;
const BIDI_ISOLATE_START = '\u2068';
const BIDI_ISOLATE_END = '\u2069';

function assertCurrency(currency) {
  if (!isSupportedDisplayCurrency(currency)) throw new TypeError('Unsupported currency');
}

export class Money {
  constructor(minorUnits, currency = commerceConfig.baseCurrency) {
    if (!Number.isSafeInteger(minorUnits)) {
      throw new TypeError('Money minorUnits must be a safe integer');
    }
    assertCurrency(currency);
    this.minorUnits = minorUnits;
    this.currency = currency;
    Object.freeze(this);
  }

  static fromMajor(amount, currency = commerceConfig.baseCurrency) {
    const value = Number(amount);
    if (!Number.isFinite(value)) throw new TypeError('Invalid monetary amount');
    const minorUnits = Math.round(value * MINOR_SCALE);
    if (!Number.isSafeInteger(minorUnits)) throw new RangeError('Monetary amount is too large');
    return new Money(minorUnits, currency);
  }

  toMajor() {
    return this.minorUnits / MINOR_SCALE;
  }

  add(other) {
    if (!(other instanceof Money) || other.currency !== this.currency) {
      throw new TypeError('Cannot add money with different currencies');
    }
    return new Money(this.minorUnits + other.minorUnits, this.currency);
  }

  multiply(quantity) {
    const value = Number(quantity);
    if (!Number.isFinite(value)) throw new TypeError('Invalid quantity');
    return new Money(Math.round(this.minorUnits * value), this.currency);
  }

  percent(percentValue) {
    const value = Number(percentValue);
    if (!Number.isFinite(value)) throw new TypeError('Invalid percentage');
    return new Money(Math.round((this.minorUnits * value) / 100), this.currency);
  }

  convert(targetCurrency, rate) {
    assertCurrency(targetCurrency);
    if (targetCurrency === this.currency) return this;
    const validRate = Number(rate);
    if (!Number.isFinite(validRate) || validRate <= 0)
      throw new TypeError('Valid exchange rate required');
    const sourceMajor = this.toMajor();
    const converted = this.currency === 'USD' ? sourceMajor * validRate : sourceMajor / validRate;
    return Money.fromMajor(converted, targetCurrency);
  }
}

export function convertPrice(amount, fromCurrency, toCurrency, rate) {
  return Money.fromMajor(amount, fromCurrency).convert(toCurrency, rate).toMajor();
}

export function sumMoney(values, currency = commerceConfig.baseCurrency) {
  assertCurrency(currency);
  return values.reduce(
    (total, value) => total.add(value instanceof Money ? value : Money.fromMajor(value, currency)),
    new Money(0, currency),
  );
}

export function formatMoney(amount, currency, lang = 'en') {
  const value = Number(amount);
  if (!Number.isFinite(value) || !isSupportedDisplayCurrency(currency)) {
    return lang === 'ar' ? 'السعر غير متاح' : 'Price unavailable';
  }

  const locale = lang === 'ar' ? 'ar-LY-u-nu-latn' : 'en-US';
  const number = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  }).format(value);

  if (currency === 'LYD') {
    const label = lang === 'ar' ? 'د.ل' : 'LYD';
    return `${BIDI_ISOLATE_START}${number} ${label}${BIDI_ISOLATE_END}`;
  }

  const rendered = `$${number}`;
  return lang === 'ar' ? `${BIDI_ISOLATE_START}${rendered} USD${BIDI_ISOLATE_END}` : rendered;
}

export function getAccessibleMoneyLabel(amount, currency, lang = 'en') {
  const value = Number(amount);
  if (!Number.isFinite(value)) return lang === 'ar' ? 'السعر غير متاح' : 'Price unavailable';
  const formatted = new Intl.NumberFormat(lang === 'ar' ? 'ar-LY-u-nu-latn' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  if (lang === 'ar') {
    return currency === 'LYD' ? `${formatted} دينار ليبي` : `${formatted} دولار أمريكي`;
  }
  return currency === 'LYD' ? `${formatted} Libyan dinars` : `${formatted} US dollars`;
}
