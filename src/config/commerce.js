/** Public currency metadata. Runtime USD to LYD calculations use the trusted backend rate. */
export const commerceConfig = Object.freeze({
  baseCurrency: 'USD',
  defaultDisplayCurrency: 'USD',
  defaultCountryCode: 'LY',
  supportedDisplayCurrencies: Object.freeze(['USD', 'LYD']),
});
export function isSupportedDisplayCurrency(value) {
  return commerceConfig.supportedDisplayCurrencies.includes(value);
}
