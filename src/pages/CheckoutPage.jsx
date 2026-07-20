import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createIdempotencyKey, createOrder } from '../services/orders';
import { SITE } from '../config';
import { resolveShipping, SHIPPING_MESSAGES } from '../config/shipping';
import { useCommerce } from '../context/CommerceContext';
import CountrySelect from '../components/common/CountrySelect';
import Icon from '../components/icons/Icon';
import {
  getAddressRequirements,
  isCashEligibleCountry,
  isSupportedCountryCode,
  normalizeCountryCode,
} from '../data/countries';
import { isPaymentsConfigured, detectWallets, createCheckoutSession } from '../utils/payments';
import { trackEvent } from '../utils/analytics';
import Seo from '../components/common/Seo';
import PageHero from '../components/common/PageHero';
import SmartImage from '../components/common/SmartImage';
import EmptyState from '../components/common/EmptyState';
import { sendFormspree } from '../services/formspree';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const configured = isPaymentsConfigured();

export default function CheckoutPage() {
  const { t, pick, lang } = useLanguage();
  const { items, subtotal, digitalOnly, hasPhysical, clearCart } = useCart();
  const { currency, countryCode, setCountryCode, format, usdToLydRate, rateReady } = useCommerce();
  const auth = useAuth();
  const _navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    country: countryCode,
    address: '',
    apartment: '',
    city: '',
    state: '',
    postal: '',
    phone: '',
  });
  const [agree, setAgree] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(
    isCashEligibleCountry(countryCode) ? 'cash' : 'online',
  );
  const [eligibilityNotice, setEligibilityNotice] = useState('');
  const [orderConfirmed, setOrderConfirmed] = useState('');
  const [errors, setErrors] = useState({});
  const [wallets, setWallets] = useState([]);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState('');
  const [checkoutMode, setCheckoutMode] = useState(auth.user ? 'account' : '');
  const idempotencyRef = useRef(
    sessionStorage.getItem('lha-checkout-idempotency') || createIdempotencyKey(),
  );
  useEffect(() => {
    sessionStorage.setItem('lha-checkout-idempotency', idempotencyRef.current);
  }, []);

  useEffect(() => {
    detectWallets().then(setWallets);
  }, []);
  useEffect(() => {
    if (auth.user?.email) {
      setForm((current) => ({ ...current, email: current.email || auth.user.email }));
      setCheckoutMode('account');
    }
  }, [auth.user?.id]);
  useEffect(() => {
    if (items.length)
      trackEvent('begin_checkout', {
        value: subtotal,
        currency: SITE.currency,
        display_currency: currency,
        items: items.length,
      });
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const shippingCountryCode = isSupportedCountryCode(form.country)
    ? String(form.country).toUpperCase()
    : '';
  const addressRequirements = getAddressRequirements(shippingCountryCode);
  const isLibyaAddress = shippingCountryCode === 'LY';

  const changeCountry = (nextCode) => {
    const normalized = normalizeCountryCode(nextCode);
    setForm((current) => ({ ...current, country: normalized }));
    setCountryCode(normalized);
    setErrors((current) => ({
      ...current,
      country: undefined,
      postal: undefined,
      state: undefined,
    }));
    if (isCashEligibleCountry(normalized)) {
      setPaymentMethod('cash');
      setEligibilityNotice('');
    } else {
      if (paymentMethod === 'cash') {
        setEligibilityNotice(
          lang === 'ar'
            ? 'تمت إزالة الدفع النقدي لأن عنوان التوصيل خارج ليبيا.'
            : 'Cash payment was removed because the delivery country is outside Libya.',
        );
      } else {
        setEligibilityNotice('');
      }
      setPaymentMethod('online');
    }
  };

  const shipping = useMemo(
    () =>
      resolveShipping(shippingCountryCode, { hasPhysical, subtotalUsd: subtotal, usdToLydRate }),
    [shippingCountryCode, hasPhysical, subtotal, usdToLydRate],
  );
  const shippingEstimate = shipping.canonicalAmount ?? 0;
  const shippingQuoteRequired = shipping.status === 'quote_required';
  const total = subtotal + shippingEstimate;

  if (items.length === 0) {
    return (
      <>
        <Seo title={t.checkout.title} description={t.checkout.title} path="/checkout" noindex />
        <PageHero label={t.nav.cart} title={t.checkout.title} />
        {orderConfirmed && (
          <section className="section">
            <div className="container">
              <div className="order-confirmed">
                <span>
                  <Icon name="check" size={18} />
                </span>
                <h2>{lang === 'ar' ? 'تم استلام طلبك' : 'Order received'}</h2>
                <p>
                  {lang === 'ar' ? 'رقم الطلب' : 'Order number'}: <strong>{orderConfirmed}</strong>
                </p>
                <p>
                  {lang === 'ar'
                    ? 'الدفع نقداً عند الاستلام. سنتواصل معك لتأكيد الطلب.'
                    : 'Cash on delivery selected. We will contact you to confirm the order.'}
                </p>
                <div className="button-row">
                  <Link to="/order-tracking" className="btn-primary">
                    {auth.user
                      ? pick({ en: 'My Orders', ar: 'طلباتي' })
                      : pick({ en: 'Track Order', ar: 'تتبع الطلب' })}
                  </Link>
                  <Link to="/shop" className="btn-secondary">
                    {t.cart.continue}
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}
        {!orderConfirmed && (
          <section className="section">
            <div className="container">
              <EmptyState
                message={t.checkout.emptyCart}
                action={{ label: t.cart.startShopping, to: '/shop' }}
              />
            </div>
          </section>
        )}
      </>
    );
  }

  const validate = () => {
    const e = {};
    if (!EMAIL_RE.test(form.email)) e.email = t.checkout.emailError;
    if (!digitalOnly) {
      ['firstName', 'lastName', 'country', 'address', 'city'].forEach((k) => {
        if (!form[k].trim()) e[k] = t.checkout.requiredError;
      });
      if (!addressRequirements)
        e.country = lang === 'ar' ? 'الدولة غير صالحة.' : 'Invalid country.';
      if (addressRequirements?.regionRequired && !form.state.trim())
        e.state = t.checkout.requiredError;
      if (addressRequirements?.postalCodeRequired && !form.postal.trim())
        e.postal = t.checkout.requiredError;
    }
    if (paymentMethod === 'cash' && !isCashEligibleCountry(shippingCountryCode)) {
      e.payment =
        lang === 'ar'
          ? 'الدفع النقدي متاح فقط للتوصيل داخل ليبيا.'
          : 'Cash payment is available only for deliveries in Libya.';
    }
    if (!rateReady && (currency === 'LYD' || hasPhysical)) {
      e.shipping =
        lang === 'ar'
          ? 'تعذر تحميل سعر الصرف الموثوق. حاول مرة أخرى.'
          : 'Trusted exchange rate is unavailable. Please try again.';
    }
    if (shippingQuoteRequired) {
      e.shipping = pick(SHIPPING_MESSAGES.quoteRequired);
    }
    if (!agree) e.agree = t.checkout.termsError;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    setFailed('');
    if (!validate()) return;
    setBusy(true);
    try {
      const payload = {
        currency: SITE.currency,
        displayCurrency: currency,
        locale: lang,
        customer: {
          email: form.email,
          name: `${form.firstName} ${form.lastName}`.trim(),
          phone: form.phone,
        },
        shipping: digitalOnly
          ? null
          : {
              firstName: form.firstName,
              lastName: form.lastName,
              line1: form.address,
              country: shippingCountryCode,
              address: form.address,
              apartment: form.apartment,
              city: form.city,
              state: form.state,
              postal: form.postal,
            },
        items: items.map((i) => ({
          id: i.id,
          type: i.type,
          sku: i.sku,
          name: pick(i.name),
          quantity: i.quantity,
          unitPrice: i.price,
          lineTotal: i.price * i.quantity,
          fulfillmentType: i.fulfillmentType,
          registrationId: i.registrationId || null,
        })),
      };
      if (paymentMethod === 'cash') {
        if (!isCashEligibleCountry(shippingCountryCode)) {
          setFailed(
            lang === 'ar'
              ? 'الدفع النقدي متاح فقط للتوصيل داخل ليبيا.'
              : 'Cash payment is available only for deliveries in Libya.',
          );
          return;
        }
        const orderNumber = `LHA-${Date.now().toString(36).toUpperCase()}-${idempotencyRef.current.slice(0, 6).toUpperCase()}`;
        const result = await createOrder(
          {
            ...payload,
            email: form.email,
            userId: auth.user?.id || null,
            total,
            canonicalCurrency: SITE.currency,
            displayCurrency: currency,
            paymentMethod: 'cash_on_delivery',
            paymentStatus: 'pending',
            orderStatus: 'received',
            fulfillmentStatus: 'unfulfilled',
            orderNumber,
            createdAt: new Date().toISOString(),
            idempotencyKey: idempotencyRef.current,
            subtotal,
            shippingTotal: shippingEstimate,
            shippingRate: {
              countryCode: shipping.countryCode,
              amount: shipping.amount,
              currency: shipping.currency,
              originalAmount: shipping.originalRate?.amount ?? shipping.amount,
              originalCurrency: shipping.originalRate?.currency ?? shipping.currency,
              discountReason: shipping.discountReason || null,
            },
            taxTotal: 0,
            discountTotal: 0,
          },
          { idempotencyKey: idempotencyRef.current },
        );
        const confirmedNumber = result?.order?.orderNumber || orderNumber;
        try {
          await sendFormspree(
            {
              formType: 'order',
              email: payload.customer.email,
              orderNumber: confirmedNumber,
              paymentMethod: 'Cash on Delivery',
              paymentStatus: 'Pending',
              customerName: payload.customer.name,
              customerEmail: payload.customer.email,
              customerPhone: payload.customer.phone,
              shippingAddress: payload.shipping,
              items: payload.items,
              subtotal,
              shippingTotal: shippingEstimate,
              total,
              currency: SITE.currency,
              displayCurrency: currency,
              language: lang,
              createdAt: new Date().toISOString(),
            },
            `New LHA order ${confirmedNumber}`,
          );
        } catch (notificationError) {
          console.warn('Order saved but email notification failed', notificationError);
        }
        setOrderConfirmed(confirmedNumber);
        clearCart();
        sessionStorage.removeItem('lha-checkout-idempotency');
        return;
      }
      const session = await createCheckoutSession(payload);
      if (session?.url) {
        window.location.href = session.url;
        return;
      }
      setFailed(t.checkout.notConfigured);
    } catch (err) {
      // Never fake success — surface a clear message instead.
      setFailed(
        paymentMethod === 'cash'
          ? lang === 'ar'
            ? 'تعذر حفظ طلب الدفع عند الاستلام. تحقق من البيانات وحاول مرة أخرى.'
            : 'We could not save your cash-on-delivery order. Check your details and try again.'
          : err.code === 'not_configured'
            ? t.checkout.notConfigured
            : t.checkout.notConfigured,
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Seo title={t.checkout.title} description={t.checkout.title} path="/checkout" noindex />
      <PageHero label={t.nav.cart} title={t.checkout.title} />

      {orderConfirmed && (
        <section className="section">
          <div className="container">
            <div className="order-confirmed">
              <span>
                <Icon name="check" size={18} />
              </span>
              <h2>{lang === 'ar' ? 'تم استلام طلبك' : 'Order received'}</h2>
              <p>
                {lang === 'ar' ? 'رقم الطلب' : 'Order number'}: <strong>{orderConfirmed}</strong>
              </p>
              <p>
                {lang === 'ar'
                  ? 'الدفع نقداً عند الاستلام. سنتواصل معك لتأكيد الطلب.'
                  : 'Cash on delivery selected. We will contact you to confirm the order.'}
              </p>
              <Link to="/shop" className="btn-primary">
                {t.cart.continue}
              </Link>
            </div>
          </div>
        </section>
      )}
      {!orderConfirmed && (
        <section className="section">
          <div className="container checkout-grid">
            <div className="checkout-main">
              {!auth.user && !checkoutMode && (
                <section className="checkout-entry" aria-labelledby="checkout-entry-title">
                  <h2 id="checkout-entry-title">
                    {pick({ en: 'How would you like to checkout?', ar: 'كيف تريد إكمال الدفع؟' })}
                  </h2>
                  <div className="checkout-entry-actions">
                    <button
                      className="btn-primary"
                      onClick={() => {
                        setCheckoutMode('guest');
                        trackEvent('guest_checkout_selected');
                      }}
                    >
                      {pick({ en: 'Checkout as Guest', ar: 'الدفع كضيف' })}
                    </button>
                    <Link
                      className="btn-secondary"
                      to="/account?returnTo=%2Fcheckout"
                      onClick={() => trackEvent('sign_in_from_checkout')}
                    >
                      {pick({ en: 'Sign In', ar: 'تسجيل الدخول' })}
                    </Link>
                    <Link
                      className="btn-secondary"
                      to="/account?mode=signup&returnTo=%2Fcheckout"
                      onClick={() => trackEvent('account_create_from_checkout')}
                    >
                      {pick({ en: 'Create Account', ar: 'إنشاء حساب' })}
                    </Link>
                  </div>
                </section>
              )}
              {(auth.user || checkoutMode) && (
                <>
                  {!configured && paymentMethod === 'online' && (
                    <div className="notice notice--info" role="status">
                      <h2>{t.checkout.notConfiguredTitle}</h2>
                      <p>{t.checkout.notConfigured}</p>
                      <Link to="/contact" className="btn-primary block">
                        {t.checkout.contactToOrder}
                      </Link>
                    </div>
                  )}

                  {configured && wallets.length > 0 && (
                    <div className="wallets">
                      <p className="wallets-label">{t.checkout.wallets}</p>
                      <div className="wallets-row">
                        {wallets.includes('apple_pay') && (
                          <span className="pay-badge">Apple&nbsp;Pay</span>
                        )}
                        {wallets.includes('google_pay') && (
                          <span className="pay-badge">Google&nbsp;Pay</span>
                        )}
                      </div>
                      <p className="express-note">{t.product.expressNote}</p>
                      <div className="or-divider">
                        <span>{t.checkout.orDivider}</span>
                      </div>
                    </div>
                  )}

                  <form
                    className="checkout-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      submit();
                    }}
                    noValidate
                  >
                    <fieldset className="form-block">
                      <legend>{t.checkout.contact}</legend>
                      <label className="field">
                        <span>{t.checkout.email}</span>
                        <input
                          type="email"
                          value={form.email}
                          onChange={set('email')}
                          autoComplete="email"
                          aria-invalid={!!errors.email}
                        />
                        {errors.email && <span className="form-error">{errors.email}</span>}
                      </label>
                      <label className="field">
                        <span>{t.checkout.phone}</span>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={set('phone')}
                          autoComplete="tel"
                        />
                      </label>
                    </fieldset>

                    {digitalOnly ? (
                      <div className="notice notice--muted">
                        {items.some((i) => i.type === 'training') && (
                          <p>
                            {lang === 'ar'
                              ? 'توصيل رقمي عبر البريد الإلكتروني.'
                              : 'Digital delivery by email.'}
                          </p>
                        )}
                        {items.some((i) => i.type === 'event') && (
                          <p>
                            {lang === 'ar'
                              ? 'سيصلك تأكيد التسجيل في الفعالية عبر البريد الإلكتروني.'
                              : 'Event registration confirmation by email.'}
                          </p>
                        )}
                      </div>
                    ) : (
                      <fieldset className="form-block">
                        <legend>{t.checkout.delivery}</legend>
                        {hasPhysical && !digitalOnly && items.some((i) => i.type !== 'product') && (
                          <p className="notice notice--muted">{t.checkout.mixedNote}</p>
                        )}
                        <div className="field-row">
                          <label className="field">
                            <span>{t.checkout.firstName}</span>
                            <input
                              value={form.firstName}
                              onChange={set('firstName')}
                              autoComplete="given-name"
                              aria-invalid={!!errors.firstName}
                            />
                            {errors.firstName && (
                              <span className="form-error">{errors.firstName}</span>
                            )}
                          </label>
                          <label className="field">
                            <span>{t.checkout.lastName}</span>
                            <input
                              value={form.lastName}
                              onChange={set('lastName')}
                              autoComplete="family-name"
                              aria-invalid={!!errors.lastName}
                            />
                            {errors.lastName && (
                              <span className="form-error">{errors.lastName}</span>
                            )}
                          </label>
                        </div>
                        <label className="field">
                          <span>{t.checkout.country}</span>
                          <CountrySelect
                            value={form.country}
                            onChange={changeCountry}
                            required
                            aria-describedby={errors.country ? 'checkout-country-error' : undefined}
                          />
                          {errors.country && (
                            <span id="checkout-country-error" className="form-error">
                              {errors.country}
                            </span>
                          )}
                        </label>
                        <label className="field">
                          <span>{t.checkout.address}</span>
                          <input
                            value={form.address}
                            onChange={set('address')}
                            autoComplete="address-line1"
                            aria-invalid={!!errors.address}
                          />
                          {errors.address && <span className="form-error">{errors.address}</span>}
                        </label>
                        {!isLibyaAddress && (
                          <label className="field">
                            <span>{t.checkout.apartment}</span>
                            <input
                              value={form.apartment}
                              onChange={set('apartment')}
                              autoComplete="address-line2"
                            />
                          </label>
                        )}
                        <div className="field-row">
                          <label className="field">
                            <span>{t.checkout.city}</span>
                            <input
                              value={form.city}
                              onChange={set('city')}
                              autoComplete="address-level2"
                              aria-invalid={!!errors.city}
                            />
                            {errors.city && <span className="form-error">{errors.city}</span>}
                          </label>
                          {!isLibyaAddress && (
                            <>
                              <label className="field">
                                <span>{t.checkout.state}</span>
                                <input
                                  value={form.state}
                                  onChange={set('state')}
                                  autoComplete="address-level1"
                                  aria-invalid={!!errors.state}
                                  required={addressRequirements?.regionRequired}
                                />
                                {errors.state && <span className="form-error">{errors.state}</span>}
                              </label>
                              <label className="field">
                                <span>{t.checkout.postal}</span>
                                <input
                                  value={form.postal}
                                  onChange={set('postal')}
                                  autoComplete="postal-code"
                                  inputMode="text"
                                  aria-invalid={!!errors.postal}
                                  required={addressRequirements?.postalCodeRequired}
                                />
                                {errors.postal && (
                                  <span className="form-error">{errors.postal}</span>
                                )}
                              </label>
                            </>
                          )}
                        </div>
                      </fieldset>
                    )}

                    <fieldset className="form-block payment-methods">
                      <legend>{lang === 'ar' ? 'طريقة الدفع' : 'Payment method'}</legend>
                      {isCashEligibleCountry(shippingCountryCode) ? (
                        <label
                          className={`payment-choice ${paymentMethod === 'cash' ? 'active' : ''}`}
                        >
                          <input
                            type="radio"
                            checked={paymentMethod === 'cash'}
                            onChange={() => setPaymentMethod('cash')}
                          />
                          <span>
                            <strong>
                              {lang === 'ar' ? 'الدفع نقداً عند الاستلام' : 'Cash on Delivery'}
                            </strong>
                            <small>
                              {lang === 'ar'
                                ? 'متاح لعناوين التوصيل داخل ليبيا فقط'
                                : 'Available for delivery addresses in Libya only'}
                            </small>
                          </span>
                        </label>
                      ) : (
                        <p className="notice notice--muted" role="status">
                          {lang === 'ar'
                            ? 'الدفع النقدي متاح فقط للتوصيل داخل ليبيا.'
                            : 'Cash payment is available only for deliveries in Libya.'}
                        </p>
                      )}
                      <label
                        className={`payment-choice ${paymentMethod === 'online' ? 'active' : ''}`}
                      >
                        <input
                          type="radio"
                          checked={paymentMethod === 'online'}
                          onChange={() => setPaymentMethod('online')}
                        />
                        <span>
                          <strong>{lang === 'ar' ? 'الدفع الإلكتروني' : 'Online payment'}</strong>
                          <small>
                            {lang === 'ar' ? 'بطاقات ومحافظ رقمية' : 'Cards and digital wallets'}
                          </small>
                        </span>
                      </label>
                    </fieldset>

                    {eligibilityNotice && (
                      <div className="notice notice--info" role="status">
                        {eligibilityNotice}
                      </div>
                    )}
                    {errors.payment && (
                      <div className="form-error" role="alert">
                        {errors.payment}
                      </div>
                    )}

                    <label className="field-check">
                      <input
                        type="checkbox"
                        checked={agree}
                        onChange={(e) => setAgree(e.target.checked)}
                        aria-invalid={!!errors.agree}
                      />
                      <span>
                        {t.checkout.terms}{' '}
                        <Link to="/terms" className="inline-link">
                          {t.nav.terms}
                        </Link>
                      </span>
                    </label>
                    {errors.agree && <span className="form-error">{errors.agree}</span>}

                    {shippingQuoteRequired && (
                      <div className="notice notice--info" role="status">
                        <p>{pick(SHIPPING_MESSAGES.quoteRequired)}</p>
                        <Link to="/contact" className="btn-secondary block">
                          {t.checkout.contactToOrder}
                        </Link>
                      </div>
                    )}

                    {failed && (
                      <div className="notice notice--info" role="alert">
                        <p>{failed}</p>
                        <Link to="/contact" className="btn-secondary block">
                          {t.checkout.contactToOrder}
                        </Link>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="btn-primary block"
                      disabled={
                        busy ||
                        !rateReady ||
                        shippingQuoteRequired ||
                        (paymentMethod === 'online' && !configured)
                      }
                    >
                      {busy
                        ? t.checkout.processing
                        : paymentMethod === 'cash'
                          ? `${lang === 'ar' ? 'تأكيد الطلب نقداً' : 'Place Cash Order'} · ${format(total, lang)}`
                          : configured
                            ? `${t.checkout.pay} · ${format(total, lang)}`
                            : t.checkout.placeOrder}
                    </button>
                    <p className="summary-note">{t.checkout.secureNote}</p>
                    <Link to="/cart" className="link-btn">
                      <Icon name="back" size={18} /> {t.checkout.backToCart}
                    </Link>
                  </form>
                </>
              )}
            </div>

            {/* Order summary */}
            <aside className="checkout-summary">
              <h2 className="summary-title">{t.checkout.summary}</h2>
              <ul className="summary-items">
                {items.map((i) => (
                  <li key={i.key} className="summary-item">
                    <div className="summary-item-media">
                      <SmartImage src={i.image} alt={pick(i.name)} />
                      <span className="summary-item-qty">{i.quantity}</span>
                    </div>
                    <div className="summary-item-name">
                      <span>{pick(i.name)}</span>
                      {i.type === 'product' && i.size && i.size !== 'OS' && <small>{i.size}</small>}
                    </div>
                    <span className="summary-item-price">{format(i.price * i.quantity, lang)}</span>
                  </li>
                ))}
              </ul>
              <div className="summary-row">
                <span>{t.cart.subtotal}</span>
                <span>{format(subtotal, lang)}</span>
              </div>
              <div className="summary-row">
                <span>{t.cart.shipping}</span>
                <span>
                  {shipping.status === 'no_physical_shipping'
                    ? lang === 'ar'
                      ? 'لا يوجد شحن مادي — مجاني'
                      : 'No physical shipping — Free'
                    : shippingQuoteRequired
                      ? pick(SHIPPING_MESSAGES.quoteRequired)
                      : shipping.status === 'physical_paid'
                        ? format(shipping.amount, lang, shipping.currency)
                        : t.common.free}
                </span>
              </div>
              <div className="summary-row total">
                <span>{t.cart.total}</span>
                <span>{format(total, lang)}</span>
              </div>
            </aside>
          </div>
        </section>
      )}
    </>
  );
}
