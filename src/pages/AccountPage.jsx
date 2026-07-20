import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useUserData } from '../context/UserDataContext';
import { useCart } from '../context/CartContext';
import { useCompare } from '../context/CompareContext';
import { useCommerce } from '../context/CommerceContext';
import Seo from '../components/common/Seo';
import AddressesSection from '../components/account/AddressesSection';
import CurrencySelector from '../components/common/CurrencySelector';
import Avatar from '../components/common/Avatar';
import { errorText } from '../utils/errors';
import { validateProfileImage } from '../utils/profileImage';
import { getMyOrders } from '../services/orders';
import { safeInternalReturnPath } from '../utils/safeReturnPath';
import OrderCard from '../components/account/OrderCard';

const ACCOUNT_SECTIONS = [
  'overview',
  'orders',
  'profile',
  'saved',
  'addresses',
  'preferences',
  'security',
];
const clean = (s) =>
  String(s || '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, 100);
export default function AccountPage() {
  const { pick, lang } = useLanguage(),
    auth = useAuth(),
    data = useUserData(),
    cart = useCart(),
    compare = useCompare(),
    commerce = useCommerce();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const returnTo = safeInternalReturnPath(params.get('returnTo'), '');
  const requestedSection = params.get('section');
  const initialSection = ACCOUNT_SECTIONS.includes(requestedSection)
    ? requestedSection
    : 'overview';
  const [mode, setMode] = useState(
      params.get('mode') === 'reset-password' ? 'reset-password' : 'signin',
    ),
    [section, setSection] = useState(initialSection),
    [email, setEmail] = useState(''),
    [password, setPassword] = useState(''),
    [fullName, setFullName] = useState(''),
    [confirmPassword, setConfirmPassword] = useState(''),
    [photoPreview, setPhotoPreview] = useState(''),
    [show, setShow] = useState(false),
    [busy, setBusy] = useState(false),
    [msg, setMsg] = useState(''),
    [ordersState, setOrdersState] = useState({ state: 'idle', orders: [], error: null }),
    [profile, setProfile] = useState(() => ({
      firstName: data?.profile?.first_name || data?.profile?.firstName || '',
      lastName: data?.profile?.last_name || data?.profile?.lastName || '',
      displayName: data?.profile?.display_name || data?.profile?.displayName || '',
      preferredLanguage: data?.profile?.preferred_language || lang,
      preferredSize: data?.profile?.preferred_size || '',
      preferredColors: data?.profile?.preferred_colors || [],
      marketingConsent: Boolean(data?.profile?.marketing_consent),
    }));
  const nameRef = useRef(null),
    emailRef = useRef(null),
    passwordRef = useRef(null),
    confirmRef = useRef(null),
    photoRef = useRef(null);
  const focusField = (ref) =>
    requestAnimationFrame(() => {
      const node = ref?.current;
      if (!node) return;
      node.focus();
      const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      node.scrollIntoView?.({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
    });
  useEffect(() => {
    const nextSection = ACCOUNT_SECTIONS.includes(params.get('section'))
      ? params.get('section')
      : 'overview';
    setSection(nextSection);
  }, [params]);
  const selectSection = (nextSection) => {
    setSection(nextSection);
    const nextParams = new URLSearchParams(params);
    if (nextSection === 'overview') nextParams.delete('section');
    else nextParams.set('section', nextSection);
    setParams(nextParams, { replace: true });
  };
  useEffect(
    () => () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    },
    [photoPreview],
  );
  const loadOrders = async () => {
    if (!auth.user?.id) return;
    setOrdersState((current) => ({
      ...current,
      state: current.orders.length ? 'retrying' : 'loading',
    }));
    setOrdersState(await getMyOrders(auth.user.id));
  };
  useEffect(() => {
    loadOrders();
  }, [auth.user?.id]);
  const clearPhotoPreview = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview('');
  };
  const t = useMemo(
    () => ({
      overview: pick({ en: 'Overview', ar: 'نظرة عامة' }),
      profile: pick({ en: 'Profile', ar: 'الملف الشخصي' }),
      saved: pick({ en: 'Saved items', ar: 'العناصر المحفوظة' }),
      security: pick({ en: 'Security', ar: 'الأمان' }),
      addresses: pick({ en: 'Addresses', ar: 'العناوين' }),
      preferences: pick({ en: 'Preferences', ar: 'التفضيلات' }),
      orders: pick({ en: 'Orders', ar: 'الطلبات' }),
    }),
    [pick],
  );
  if (auth.loading)
    return (
      <div className="section container" role="status">
        {pick({ en: 'Restoring your session…', ar: 'جارٍ استعادة جلستك…' })}
      </div>
    );
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const fail = (message, ref) => {
        const error = new Error(message);
        error.fieldRef = ref;
        throw error;
      };
      if (mode === 'signup' && !clean(fullName))
        fail(pick({ en: 'Enter your full name.', ar: 'أدخل الاسم الكامل.' }), nameRef);
      if (mode !== 'reset-password' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail))
        fail(
          pick({ en: 'Enter a valid email address.', ar: 'أدخل عنوان بريد إلكتروني صالحًا.' }),
          emailRef,
        );
      if (mode !== 'reset' && password.length < 8)
        fail(
          pick({
            en: 'Password must be at least 8 characters.',
            ar: 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.',
          }),
          passwordRef,
        );
      if (mode === 'signup' && password !== confirmPassword)
        fail(
          pick({ en: 'Passwords do not match.', ar: 'كلمتا المرور غير متطابقتين.' }),
          confirmRef,
        );
      let r;
      if (mode === 'signup')
        r = await auth.signUp(normalizedEmail, password, {
          fullName: clean(fullName),
        });
      else if (mode === 'reset') r = await auth.reset(normalizedEmail);
      else if (mode === 'reset-password') r = await auth.updatePassword(password);
      else r = await auth.signIn(normalizedEmail, password);
      if (r?.error) throw r.error;
      setMsg(
        pick({
          en:
            mode === 'reset'
              ? 'Check your email for a secure reset link.'
              : mode === 'signup'
                ? auth.cloudConfigured
                  ? 'Check your email to verify your account.'
                  : 'Account created successfully on this device.'
                : mode === 'reset-password'
                  ? 'Password updated.'
                  : 'Signed in successfully.',
          ar:
            mode === 'reset'
              ? 'راجع بريدك الإلكتروني لرابط إعادة التعيين الآمن.'
              : mode === 'signup'
                ? auth.cloudConfigured
                  ? 'راجع بريدك لتأكيد الحساب.'
                  : 'تم إنشاء الحساب بنجاح على هذا الجهاز.'
                : mode === 'reset-password'
                  ? 'تم تحديث كلمة المرور.'
                  : 'تم تسجيل الدخول بنجاح.',
        }),
      );
      if (returnTo && mode === 'signin') navigate(returnTo, { replace: true });
      if (returnTo && mode === 'signup' && r?.data?.session) navigate(returnTo, { replace: true });
    } catch (x) {
      setMsg(errorText(x, lang));
      focusField(x.fieldRef);
    } finally {
      setBusy(false);
    }
  };
  if (!auth.user)
    return (
      <>
        <Seo title="Account" path="/account" />
        <section className="section">
          <form className="container account-panel auth-form" onSubmit={submit} noValidate>
            <p className="section-label">LHA ACCOUNT</p>
            <h1>
              {pick({
                en:
                  mode === 'signup'
                    ? 'Create account'
                    : mode === 'reset'
                      ? 'Reset password'
                      : mode === 'reset-password'
                        ? 'Choose a new password'
                        : 'Sign in',
                ar:
                  mode === 'signup'
                    ? 'إنشاء حساب'
                    : mode === 'reset'
                      ? 'إعادة تعيين كلمة المرور'
                      : mode === 'reset-password'
                        ? 'اختر كلمة مرور جديدة'
                        : 'تسجيل الدخول',
              })}
            </h1>
            {!auth.configured && (
              <p className="form-notice">
                {pick({
                  en: 'Cloud accounts require Supabase configuration. Guest shopping remains available.',
                  ar: 'تحتاج الحسابات السحابية إلى إعداد Supabase. يظل التسوق كضيف متاحًا.',
                })}
              </p>
            )}
            {mode === 'signup' && (
              <>
                <label>
                  {pick({ en: 'Full name', ar: 'الاسم الكامل' })}
                  <input
                    ref={nameRef}
                    autoComplete="name"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </label>
                <label>
                  {pick({ en: 'Profile photo (optional)', ar: 'الصورة الشخصية (اختيارية)' })}
                  <input
                    ref={photoRef}
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const result = await validateProfileImage(f);
                      if (!result.valid) {
                        const message =
                          result.reason === 'signature'
                            ? pick({
                                en: 'This file is not a valid image.',
                                ar: 'هذا الملف ليس صورة صالحة.',
                              })
                            : pick({
                                en: 'Choose a JPG, PNG, or WebP image.',
                                ar: 'اختر صورة بصيغة JPG أو PNG أو WebP.',
                              });
                        setMsg(message);
                        e.target.value = '';
                        focusField(photoRef);
                        return;
                      }
                      if (photoPreview) URL.revokeObjectURL(photoPreview);
                      setPhotoPreview(URL.createObjectURL(f));
                      setMsg('');
                    }}
                  />
                </label>
                {photoPreview && (
                  <div className="profile-photo-preview">
                    <img
                      src={photoPreview}
                      alt={pick({ en: 'Profile preview', ar: 'معاينة الصورة الشخصية' })}
                    />
                    <button type="button" onClick={clearPhotoPreview}>
                      {pick({ en: 'Remove', ar: 'إزالة' })}
                    </button>
                  </div>
                )}
              </>
            )}
            {mode !== 'reset-password' && (
              <label>
                {pick({ en: 'Email', ar: 'البريد الإلكتروني' })}
                <input
                  ref={emailRef}
                  type="email"
                  dir="ltr"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
            )}
            {mode !== 'reset' && (
              <label>
                {pick({ en: 'Password', ar: 'كلمة المرور' })}
                <span className="password-field">
                  <input
                    ref={passwordRef}
                    type={show ? 'text' : 'password'}
                    dir="ltr"
                    minLength="8"
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShow((v) => !v)}
                    aria-label={pick(
                      show
                        ? { en: 'Hide password', ar: 'إخفاء كلمة المرور' }
                        : { en: 'Show password', ar: 'إظهار كلمة المرور' },
                    )}
                  >
                    {pick(show ? { en: 'Hide', ar: 'إخفاء' } : { en: 'Show', ar: 'إظهار' })}
                  </button>
                </span>
              </label>
            )}
            {mode === 'signup' && (
              <label>
                {pick({ en: 'Confirm new password', ar: 'تأكيد كلمة المرور الجديدة' })}
                <input
                  ref={confirmRef}
                  type={show ? 'text' : 'password'}
                  dir="ltr"
                  autoComplete="new-password"
                  required
                  minLength="8"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </label>
            )}
            <button className="btn-primary" type="submit" disabled={busy || !auth.configured}>
              {busy
                ? pick({ en: 'Please wait…', ar: 'يرجى الانتظار…' })
                : pick(
                    mode === 'signup'
                      ? { en: 'Create Account', ar: 'إنشاء الحساب' }
                      : { en: 'Continue', ar: 'متابعة' },
                  )}
            </button>
            {msg && (
              <p id="account-error-summary" role="alert" aria-live="assertive">
                {msg}
              </p>
            )}
            <div className="account-switch">
              {mode !== 'signin' && (
                <button type="button" onClick={() => setMode('signin')}>
                  {pick({ en: 'Sign in', ar: 'تسجيل الدخول' })}
                </button>
              )}
              {mode !== 'signup' && (
                <button type="button" onClick={() => setMode('signup')}>
                  {pick({ en: 'Create account', ar: 'إنشاء حساب' })}
                </button>
              )}
              {mode === 'signin' && (
                <button type="button" onClick={() => setMode('reset')}>
                  {pick({ en: 'Forgot password?', ar: 'نسيت كلمة المرور؟' })}
                </button>
              )}
            </div>
          </form>
        </section>
      </>
    );
  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await data.saveProfile({
        ...profile,
        firstName: clean(profile.firstName),
        lastName: clean(profile.lastName),
        displayName: clean(profile.displayName),
      });
      setMsg(pick({ en: 'Profile saved.', ar: 'تم حفظ الملف الشخصي.' }));
    } catch (x) {
      setMsg(errorText(x, lang));
      focusField(x.fieldRef);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <Seo title="Account" path="/account" />
      <section className="section account-page">
        <div className="container">
          <div className="account-heading">
            <Avatar
              name={
                profile.displayName || `${profile.firstName} ${profile.lastName}` || auth.user.email
              }
              src={data?.profile?.avatar_url || data?.profile?.avatarUrl || ''}
              size="large"
            />
            <div>
              <p className="section-label">LHA ACCOUNT</p>
              <h1>{pick({ en: 'Your account', ar: 'حسابك' })}</h1>
              <p>
                {auth.user.email} · {data.status}
              </p>
            </div>
            <button
              className="btn-secondary"
              onClick={async () => {
                try {
                  await data.flush?.();
                } catch {}
                data.clearAuthenticatedState?.();
                await auth.signOut();
              }}
            >
              {pick({ en: 'Sign out', ar: 'تسجيل الخروج' })}
            </button>
          </div>
          <div className="account-layout">
            <nav
              className="account-nav"
              aria-label={pick({ en: 'Account sections', ar: 'أقسام الحساب' })}
            >
              {Object.entries(t).map(([k, v]) => (
                <button
                  key={k}
                  className={section === k ? 'active' : ''}
                  aria-current={section === k ? 'page' : undefined}
                  onClick={() => selectSection(k)}
                >
                  {v}
                </button>
              ))}
            </nav>
            <div className="account-content">
              {section === 'overview' && (
                <div className="account-grid">
                  <article>
                    <h2>{pick({ en: 'Cart', ar: 'السلة' })}</h2>
                    <strong>{cart.count}</strong>
                  </article>
                  <article>
                    <h2>{pick({ en: 'Wishlist', ar: 'المفضلة' })}</h2>
                    <strong>{data.wishlist.length}</strong>
                  </article>
                  <article>
                    <h2>{pick({ en: 'Comparisons', ar: 'المقارنات' })}</h2>
                    <strong>{compare.count}</strong>
                  </article>
                  <article>
                    <h2>{pick({ en: 'Orders', ar: 'الطلبات' })}</h2>
                    <strong>{ordersState.orders.length}</strong>
                    <Link to="/order-tracking">
                      {pick({ en: 'View My Orders', ar: 'عرض طلباتي' })}
                    </Link>
                  </article>
                </div>
              )}
              {section === 'orders' && (
                <section aria-labelledby="account-orders-title">
                  <div className="section-heading-row">
                    <h2 id="account-orders-title">
                      {pick({ en: 'Recent Orders', ar: 'الطلبات الأخيرة' })}
                    </h2>
                    {['error', 'partial'].includes(ordersState.state) && (
                      <button
                        className="btn-secondary"
                        onClick={loadOrders}
                        disabled={ordersState.state === 'retrying'}
                      >
                        {ordersState.state === 'retrying'
                          ? pick({ en: 'Retrying…', ar: 'جارٍ إعادة المحاولة…' })
                          : pick({ en: 'Retry', ar: 'إعادة المحاولة' })}
                      </button>
                    )}
                  </div>
                  {ordersState.state === 'loading' && (
                    <p role="status">
                      {pick({ en: 'Loading orders…', ar: 'جاري تحميل الطلبات…' })}
                    </p>
                  )}
                  {ordersState.state === 'partial' && (
                    <div className="notice notice--info" role="status">
                      {pick({
                        en: 'Cloud synchronization is temporarily unavailable. Local orders are shown.',
                        ar: 'المزامنة السحابية غير متاحة مؤقتاً. يتم عرض الطلبات المحلية.',
                      })}
                    </div>
                  )}
                  {ordersState.state === 'error' && (
                    <div className="notice notice--info" role="alert">
                      {pick({ en: 'We could not load your orders.', ar: 'تعذر تحميل طلباتك.' })}
                    </div>
                  )}
                  {!['loading', 'error'].includes(ordersState.state) &&
                    (ordersState.orders.length ? (
                      <div className="orders-list">
                        {ordersState.orders.slice(0, 5).map((order) => (
                          <OrderCard key={order.id} order={order} compact />
                        ))}
                      </div>
                    ) : (
                      <div className="notice notice--muted">
                        {pick({ en: 'No orders yet.', ar: 'لا توجد طلبات حتى الآن.' })}
                      </div>
                    ))}
                  <Link className="btn-secondary" to="/order-tracking">
                    {pick({ en: 'View All Orders', ar: 'عرض كل الطلبات' })}
                  </Link>
                </section>
              )}
              {section === 'profile' && (
                <form onSubmit={save} className="account-form">
                  <label>
                    {pick({ en: 'First name', ar: 'الاسم الأول' })}
                    <input
                      value={profile.firstName}
                      onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    />
                  </label>
                  <label>
                    {pick({ en: 'Last name', ar: 'اسم العائلة' })}
                    <input
                      value={profile.lastName}
                      onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    />
                  </label>
                  <label>
                    {pick({ en: 'Display name', ar: 'الاسم الظاهر' })}
                    <input
                      value={profile.displayName}
                      onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                    />
                  </label>
                  <button className="btn-primary" disabled={busy}>
                    {pick({ en: 'Save profile', ar: 'حفظ الملف الشخصي' })}
                  </button>
                </form>
              )}
              {section === 'saved' && (
                <div>
                  <h2>{pick({ en: 'Saved activity', ar: 'النشاط المحفوظ' })}</h2>
                  <p>
                    {pick({
                      en: `${data.wishlist.length} wishlist items, ${data.recentlyViewed.length} recently viewed, ${compare.count} compared.`,
                      ar: `${data.wishlist.length} في المفضلة، ${data.recentlyViewed.length} شوهدت مؤخرًا، ${compare.count} في المقارنة.`,
                    })}
                  </p>
                </div>
              )}
              {section === 'addresses' && (
                <AddressesSection userId={auth.user.id} pick={pick} language={lang} />
              )}{' '}
              {section === 'preferences' && (
                <form onSubmit={save} className="account-form">
                  <div className="account-preference-row">
                    <div>
                      <strong>{pick({ en: 'Display currency', ar: 'عملة العرض' })}</strong>
                      <p>
                        {pick({
                          en: 'Saved locally and synchronized with your account when online.',
                          ar: 'تُحفظ محليًا وتتم مزامنتها مع حسابك عند توفر الاتصال.',
                        })}
                      </p>
                    </div>
                    <CurrencySelector />
                    <span role="status" aria-live="polite">
                      {commerce.preferenceStatus === 'synced'
                        ? pick({ en: 'Synced', ar: 'تمت المزامنة' })
                        : commerce.preferenceStatus === 'syncing'
                          ? pick({ en: 'Synchronizing…', ar: 'جارٍ المزامنة…' })
                          : commerce.preferenceStatus === 'offline'
                            ? pick({ en: 'Saved locally — offline', ar: 'محفوظ محليًا — غير متصل' })
                            : commerce.preferenceStatus === 'error'
                              ? pick({
                                  en: 'Saved locally — sync pending',
                                  ar: 'محفوظ محليًا — المزامنة معلقة',
                                })
                              : pick({ en: 'Saved locally', ar: 'محفوظ محليًا' })}
                    </span>
                  </div>
                  <label>
                    {pick({ en: 'Preferred size', ar: 'المقاس المفضل' })}
                    <input
                      value={profile.preferredSize}
                      onChange={(e) => setProfile({ ...profile, preferredSize: e.target.value })}
                    />
                  </label>
                  <label className="check-row">
                    <input
                      type="checkbox"
                      checked={profile.marketingConsent}
                      onChange={(e) =>
                        setProfile({ ...profile, marketingConsent: e.target.checked })
                      }
                    />
                    {pick({
                      en: 'Receive academy and product updates',
                      ar: 'استلام تحديثات الأكاديمية والمنتجات',
                    })}
                  </label>
                  <button className="btn-primary">
                    {pick({ en: 'Save preferences', ar: 'حفظ التفضيلات' })}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={data.clearPersonalization}
                  >
                    {pick({ en: 'Clear personalization history', ar: 'مسح سجل التخصيص' })}
                  </button>
                </form>
              )}
              {section === 'security' && <Security auth={auth} pick={pick} lang={lang} />}{' '}
              {msg && (
                <p role="status" aria-live="polite">
                  {msg}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
function Security({ auth, pick, lang }) {
  const [p, setP] = useState(''),
    [busy, setBusy] = useState(false),
    [msg, setMsg] = useState('');
  const change = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await auth.updatePassword(p);
      setP('');
      setMsg(pick({ en: 'Password changed.', ar: 'تم تغيير كلمة المرور.' }));
    } catch (x) {
      setMsg(errorText(x, lang));
    } finally {
      setBusy(false);
    }
  };
  const remove = async () => {
    if (!confirm(pick({ en: 'Permanently delete this account?', ar: 'حذف هذا الحساب نهائيًا؟' })))
      return;
    try {
      await auth.deleteAccount();
    } catch (x) {
      setMsg(x.message);
    }
  };
  return (
    <div className="security-stack">
      <form onSubmit={change}>
        <h2>{pick({ en: 'Change password', ar: 'تغيير كلمة المرور' })}</h2>
        <input
          type="password"
          minLength="8"
          autoComplete="new-password"
          value={p}
          onChange={(e) => setP(e.target.value)}
          required
        />
        <button className="btn-primary" disabled={busy}>
          {pick({ en: 'Update password', ar: 'تحديث كلمة المرور' })}
        </button>
      </form>
      <button className="btn-secondary" onClick={() => auth.signOut('global')}>
        {pick({ en: 'Sign out all devices', ar: 'تسجيل الخروج من جميع الأجهزة' })}
      </button>
      <button className="danger-button" onClick={remove}>
        {pick({ en: 'Delete account', ar: 'حذف الحساب' })}
      </button>
      {msg && <p role="status">{msg}</p>}
    </div>
  );
}
