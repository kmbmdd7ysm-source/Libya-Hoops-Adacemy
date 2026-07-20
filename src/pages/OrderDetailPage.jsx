import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useCommerce } from '../context/CommerceContext';
import { convertPrice, formatMoney } from '../services/money';
import { getOrderDetails } from '../services/orders';
import { presentOrderStatus } from '../services/orderStatus';
import Seo from '../components/common/Seo';
import Breadcrumbs from '../components/common/Breadcrumbs';

export default function OrderDetailPage() {
  const { orderNumber = '' } = useParams();
  const location = useLocation();
  const auth = useAuth();
  const { currency, usdToLydRate } = useCommerce();
  const { pick, lang } = useLanguage();
  const [email, setEmail] = useState(
    location.state?.verifiedEmail ||
      sessionStorage.getItem(`lha-order-verification:${orderNumber}`) ||
      '',
  );
  const [state, setState] = useState({ state: 'loading', order: null, error: null });
  const load = async (verifiedEmail = email) => {
    setState((current) => ({ ...current, state: 'loading' }));
    setState(await getOrderDetails({ orderNumber, userId: auth.user?.id, email: verifiedEmail }));
  };
  useEffect(() => {
    if (!auth.loading) load();
  }, [auth.loading, auth.user?.id, orderNumber]);
  const order = state.order;
  const payment = order ? presentOrderStatus('payment', order.paymentStatus, lang) : null;
  const status = order ? presentOrderStatus('order', order.orderStatus, lang) : null;
  const fulfillment = order
    ? presentOrderStatus('fulfillment', order.fulfillmentStatus, lang)
    : null;
  const displayAmount = (amount) =>
    formatMoney(
      convertPrice(Number(amount) || 0, order?.currency || 'USD', currency, usdToLydRate),
      currency,
      lang,
    );
  return (
    <>
      <Seo
        title={pick({ en: 'Order Details', ar: 'تفاصيل الطلب' })}
        path={`/order-tracking/${encodeURIComponent(orderNumber)}`}
        noindex
      />
      <section className="section">
        <div className="container narrow">
          <Breadcrumbs
            items={[
              { label: pick({ en: 'Order Tracking', ar: 'تتبع الطلب' }), to: '/order-tracking' },
              { label: pick({ en: 'Order Details', ar: 'تفاصيل الطلب' }) },
            ]}
          />
          <h1>{pick({ en: 'Order Details', ar: 'تفاصيل الطلب' })}</h1>
          {state.state === 'loading' && (
            <p role="status">{pick({ en: 'Loading order…', ar: 'جارٍ تحميل الطلب…' })}</p>
          )}
          {state.state === 'verification-required' && (
            <form
              className="track-form"
              onSubmit={(event) => {
                event.preventDefault();
                sessionStorage.setItem(
                  `lha-order-verification:${orderNumber}`,
                  email.trim().toLowerCase(),
                );
                load(email);
              }}
            >
              <p>
                {pick({
                  en: 'Enter the checkout email to verify this guest order.',
                  ar: 'أدخل البريد المستخدم عند الدفع للتحقق من طلب الضيف.',
                })}
              </p>
              <label className="field">
                <span>{pick({ en: 'Order email', ar: 'بريد الطلب' })}</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>
              <button className="btn-primary" type="submit">
                {pick({ en: 'Verify Order', ar: 'التحقق من الطلب' })}
              </button>
            </form>
          )}
          {['not-found', 'error'].includes(state.state) && (
            <div className="notice notice--info" role="alert">
              <p>
                {state.state === 'not-found'
                  ? pick({
                      en: 'This order was not found or you do not have permission to view it.',
                      ar: 'لم يتم العثور على هذا الطلب أو لا تملك صلاحية عرضه.',
                    })
                  : pick({
                      en: 'Order details are temporarily unavailable.',
                      ar: 'تفاصيل الطلب غير متاحة مؤقتاً.',
                    })}
              </p>
              <button className="btn-secondary" onClick={() => load()}>
                {pick({ en: 'Retry', ar: 'إعادة المحاولة' })}
              </button>
            </div>
          )}
          {order && (
            <article className="order-detail">
              <div className="order-detail-head">
                <div>
                  <p className="section-label">{pick({ en: 'Order number', ar: 'رقم الطلب' })}</p>
                  <h2>{order.orderNumber}</h2>
                  <time dateTime={order.createdAt}>
                    {new Intl.DateTimeFormat(lang === 'ar' ? 'ar' : 'en', {
                      dateStyle: 'long',
                    }).format(new Date(order.createdAt))}
                  </time>
                </div>
                {order.syncState === 'local-only' && (
                  <div className="notice notice--muted">
                    {pick({
                      en: 'This cash order is stored on this device and may not appear on another device until cloud synchronization is available.',
                      ar: 'طلب الدفع النقدي هذا محفوظ على هذا الجهاز وقد لا يظهر على جهاز آخر حتى تتوفر المزامنة السحابية.',
                    })}
                  </div>
                )}
              </div>
              <dl className="order-detail-status">
                <div>
                  <dt>{pick({ en: 'Order status', ar: 'حالة الطلب' })}</dt>
                  <dd>{status.label}</dd>
                </div>
                <div>
                  <dt>{pick({ en: 'Payment status', ar: 'حالة الدفع' })}</dt>
                  <dd>{payment.label}</dd>
                </div>
                <div>
                  <dt>{pick({ en: 'Fulfillment status', ar: 'حالة التنفيذ' })}</dt>
                  <dd>{fulfillment.label}</dd>
                </div>
                <div>
                  <dt>{pick({ en: 'Payment method', ar: 'طريقة الدفع' })}</dt>
                  <dd>
                    {order.paymentMethod === 'cash_on_delivery'
                      ? pick({ en: 'Cash on Delivery', ar: 'الدفع عند الاستلام' })
                      : pick({ en: 'Online payment', ar: 'الدفع الإلكتروني' })}
                  </dd>
                </div>
              </dl>
              <h2>{pick({ en: 'Items', ar: 'العناصر' })}</h2>
              <ul className="order-detail-items">
                {order.items.map((item, index) => (
                  <li key={`${item.id || item.sku}-${index}`}>
                    <div>
                      <strong>{item.name}</strong>
                      {item.variant && (
                        <small>
                          {typeof item.variant === 'string'
                            ? item.variant
                            : JSON.stringify(item.variant)}
                        </small>
                      )}
                    </div>
                    <span>
                      {item.quantity} × {displayAmount(item.unitPrice)}
                    </span>
                    <strong>{displayAmount(item.lineTotal)}</strong>
                  </li>
                ))}
              </ul>
              <dl className="order-totals">
                <div>
                  <dt>{pick({ en: 'Subtotal', ar: 'المجموع الفرعي' })}</dt>
                  <dd>{displayAmount(order.subtotal)}</dd>
                </div>
                <div>
                  <dt>{pick({ en: 'Shipping', ar: 'الشحن' })}</dt>
                  <dd>{displayAmount(order.shippingTotal)}</dd>
                </div>
                <div>
                  <dt>{pick({ en: 'Total', ar: 'الإجمالي' })}</dt>
                  <dd>{displayAmount(order.total)}</dd>
                </div>
              </dl>
            </article>
          )}
          <Link className="link-btn" to="/order-tracking">
            {pick({ en: 'Back to Order Tracking', ar: 'العودة إلى تتبع الطلب' })}
          </Link>
        </div>
      </section>
    </>
  );
}
