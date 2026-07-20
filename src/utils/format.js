import { SITE } from '../config';
import { formatMoney } from '../services/money';

// Backward-compatible canonical formatter. Interactive price UI should prefer useCommerce().format.
export function formatPrice(amount, lang = 'en', currency = SITE.currency) {
  return formatMoney(amount, currency, lang);
}

export function formatDate(iso, lang = 'en') {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat(SITE.locale[lang] || 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
