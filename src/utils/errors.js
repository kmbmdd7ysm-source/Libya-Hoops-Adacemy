const MAP = {
  auth_invalid: {
    en: 'Email or password is incorrect.',
    ar: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
  },
  auth_unverified: {
    en: 'Please verify your email before continuing.',
    ar: 'يرجى تأكيد بريدك الإلكتروني قبل المتابعة.',
  },
  session_expired: {
    en: 'Your session expired. Please sign in again.',
    ar: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مجددًا.',
  },
  offline: {
    en: 'You are offline. Changes are saved locally until connection returns.',
    ar: 'أنت غير متصل. حُفظت التغييرات محليًا حتى يعود الاتصال.',
  },
  sync_failed: {
    en: 'We could not sync your changes yet. They remain safely on this device.',
    ar: 'تعذر مزامنة تغييراتك الآن. ما زالت محفوظة بأمان على هذا الجهاز.',
  },
  address_failed: {
    en: 'We could not save the address. Please try again.',
    ar: 'تعذر حفظ العنوان. حاول مرة أخرى.',
  },
  generic: { en: 'Something went wrong. Please try again.', ar: 'حدث خطأ ما. حاول مرة أخرى.' },
};
export function mapError(error) {
  const text = String(error?.message || '').toLowerCase();
  let code = 'generic';
  if (text.includes('invalid login') || text.includes('invalid credentials')) code = 'auth_invalid';
  else if (text.includes('email not confirmed')) code = 'auth_unverified';
  else if (text.includes('jwt') || text.includes('session')) code = 'session_expired';
  else if (!globalThis.navigator?.onLine) code = 'offline';
  return {
    code,
    message: MAP[code],
    debug: import.meta?.env?.DEV ? String(error?.message || error) : undefined,
  };
}
export const errorText = (error, language = 'en') =>
  mapError(error).message[language] || mapError(error).message.en;
