import { Money, convertPrice } from '../services/money';

/** Single production source of truth for delivery pricing and eligibility. */
export const shippingConfig = Object.freeze({
  freeShipping: Object.freeze({
    countryCode: 'LY',
    threshold: Object.freeze({ amount: 70, currency: 'USD' }),
    reason: 'libya_free_shipping_threshold',
  }),
  countryRates: Object.freeze({
    LY: Object.freeze({ amount: 20, currency: 'LYD', enabled: true, region: 'Libya' }),
  }),
  fallback: Object.freeze({ status: 'quote_required' }),
});

function canonicalSubtotalMoney(value) {
  try {
    const subtotal = Money.fromMajor(value ?? 0, 'USD');
    return subtotal.minorUnits < 0 ? Money.fromMajor(0, 'USD') : subtotal;
  } catch {
    return Money.fromMajor(0, 'USD');
  }
}

export function getLibyaFreeShippingProgress(subtotalUsd) {
  const subtotal = canonicalSubtotalMoney(subtotalUsd);
  const threshold = Money.fromMajor(
    shippingConfig.freeShipping.threshold.amount,
    shippingConfig.freeShipping.threshold.currency,
  );
  const remainingMinor = Math.max(0, threshold.minorUnits - subtotal.minorUnits);
  return Object.freeze({
    eligible: subtotal.minorUnits >= threshold.minorUnits,
    subtotalUsd: subtotal.toMajor(),
    thresholdUsd: threshold.toMajor(),
    remainingUsd: new Money(remainingMinor, 'USD').toMajor(),
    progressPercent: Math.min(100, (subtotal.minorUnits / threshold.minorUnits) * 100),
  });
}

export function resolveShipping(
  countryCode,
  { hasPhysical = true, subtotalUsd = 0, usdToLydRate = null } = {},
) {
  if (!hasPhysical) {
    return Object.freeze({
      status: 'no_physical_shipping',
      amount: 0,
      currency: null,
      canonicalAmount: 0,
      reason: 'no_physical_shipping',
    });
  }

  const code = String(countryCode || '')
    .trim()
    .toUpperCase();
  const rate = shippingConfig.countryRates[code];
  if (!rate?.enabled) {
    return Object.freeze({
      status: shippingConfig.fallback.status,
      countryCode: code,
      amount: null,
      currency: null,
      canonicalAmount: null,
      freeShippingEligible: false,
    });
  }

  const progress = getLibyaFreeShippingProgress(subtotalUsd);
  if (code === shippingConfig.freeShipping.countryCode && progress.eligible) {
    return Object.freeze({
      status: 'physical_free',
      countryCode: code,
      amount: 0,
      currency: rate.currency,
      canonicalAmount: 0,
      originalRate: rate,
      discountReason: shippingConfig.freeShipping.reason,
      freeShippingEligible: true,
    });
  }

  return Object.freeze({
    status: 'physical_paid',
    countryCode: code,
    amount: rate.amount,
    currency: rate.currency,
    canonicalAmount: convertPrice(rate.amount, rate.currency, 'USD', usdToLydRate),
    originalRate: rate,
    freeShippingEligible: false,
  });
}

export const SHIPPING_MESSAGES = Object.freeze({
  announcement: Object.freeze({
    en: 'Free delivery in Libya on orders of $70 or more.',
    ar: 'توصيل مجاني داخل ليبيا للطلبات بقيمة 70 دولاراً أو أكثر.',
  }),
  progress: Object.freeze({
    en: 'away from free delivery in Libya',
    ar: 'تفصلك عن التوصيل المجاني داخل ليبيا',
  }),
  unlocked: Object.freeze({
    en: 'You have unlocked free delivery in Libya!',
    ar: 'لقد حصلت على توصيل مجاني داخل ليبيا!',
  }),
  digitalDelivery: Object.freeze({
    en: 'Digital delivery by email',
    ar: 'توصيل رقمي عبر البريد الإلكتروني',
  }),
  digitalDeliveryFree: Object.freeze({
    en: 'Digital delivery — Free',
    ar: 'توصيل رقمي — مجاني',
  }),
  configured: Object.freeze({
    en: 'Libya delivery: 20 LYD',
    ar: 'التوصيل داخل ليبيا: 20 د.ل',
  }),
  quoteRequired: Object.freeze({
    en: 'Shipping price is not configured for this country yet. Please contact us before completing your order.',
    ar: 'سعر الشحن غير محدد لهذه الدولة حالياً. يرجى التواصل معنا قبل إكمال الطلب.',
  }),
});
