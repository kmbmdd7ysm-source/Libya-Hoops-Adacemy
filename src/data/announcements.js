// ============================================================================
// ANNOUNCEMENT BAR  —  EDIT HERE. Set `enabled: false` to hide the bar.
// Multiple messages rotate. `link` is optional.
// ============================================================================

export const announcementBar = {
  enabled: true,
  rotateMs: 5000,
  messages: [
    {
      en: 'Registration is now open — join Libya Hoops Academy.',
      ar: 'التسجيل مفتوح الآن — انضم إلى أكاديمية ليبيا هوبس.',
      link: '/programs',
    },
    {
      en: 'New academy collection available.',
      ar: 'مجموعة الأكاديمية الجديدة متوفرة.',
      link: '/shop?filter=new',
    },
    {
      en: 'Upcoming camp registration is live.',
      ar: 'تسجيل المعسكر القادم متاح الآن.',
      link: '/events',
    },
    {
      type: 'free-shipping',
      en: 'Free shipping threshold available.',
      ar: 'حد الشحن المجاني متاح.',
      link: '/shop',
    },
  ],
};
