// ============================================================================
// EVENTS  —  EDITABLE DEMO DATA.
// `status`: 'open' | 'closed' | 'full' | 'ended'  (registration allowed only
// when 'open' AND remaining > 0 AND the deadline has not passed).
// Dates are ISO (YYYY-MM-DD). `price: 0` = free registration.
// ============================================================================

export const events = [
  {
    id: 'ev01',
    slug: 'summer-elite-camp-2026',
    status: 'open',
    featured: true,
    category: 'camps',
    title: { en: 'Summer Elite Camp 2026', ar: 'معسكر الصيف للنخبة 2026' },
    description: {
      en: 'A five-day intensive camp packed with skill development, competition and athletic training for committed players. Limited spots.',
      ar: 'معسكر مكثّف لخمسة أيام مليء بتطوير المهارات والمنافسة والتدريب البدني للاعبين الملتزمين. أماكن محدودة.',
    },
    coverImage: '/images/events/summer-camp.jpg',
    gallery: [],
    startDate: '2026-08-10',
    endDate: '2026-08-14',
    startTime: '09:00',
    endTime: '13:00',
    timezone: 'Africa/Tripoli',
    venue: { en: 'LHA Academy Court', ar: 'ملعب أكاديمية LHA' },
    address: { en: 'Address to be confirmed', ar: 'العنوان سيتم تأكيده' },
    mapLink: '',
    ageGroup: { en: 'Ages 12–17', ar: 'الأعمار 12–17' },
    level: { en: 'Intermediate–Advanced', ar: 'متوسط–متقدم' },
    gender: { en: 'Open', ar: 'مفتوح' },
    capacity: 40,
    remaining: 12,
    price: 120,
    registrationDeadline: '2026-08-05',
    included: {
      en: ['Daily coaching', 'Camp jersey', 'Competition day', 'Certificate'],
      ar: ['تدريب يومي', 'قميص المعسكر', 'يوم المنافسة', 'شهادة'],
    },
    bring: {
      en: ['Basketball shoes', 'Water bottle', 'Training kit'],
      ar: ['حذاء كرة سلة', 'زجاجة ماء', 'ملابس تدريب'],
    },
    organizer: null,
    related: ['ev02', 'ev04'],
  },
  {
    id: 'ev02',
    slug: 'shooting-clinic-august',
    status: 'open',
    featured: true,
    category: 'clinics',
    title: { en: 'Shooting Clinic', ar: 'ورشة التسديد' },
    description: {
      en: 'A focused half-day clinic dedicated to shooting mechanics, range and confidence. All levels welcome.',
      ar: 'ورشة نصف يوم مخصّصة لميكانيكا التسديد والمدى والثقة. جميع المستويات مرحّب بها.',
    },
    coverImage: '/images/events/shooting-clinic.jpg',
    gallery: [],
    startDate: '2026-08-23',
    endDate: '2026-08-23',
    startTime: '10:00',
    endTime: '13:00',
    timezone: 'Africa/Tripoli',
    venue: { en: 'LHA Academy Court', ar: 'ملعب أكاديمية LHA' },
    address: { en: 'Address to be confirmed', ar: 'العنوان سيتم تأكيده' },
    mapLink: '',
    ageGroup: { en: 'Ages 10+', ar: 'الأعمار 10+' },
    level: { en: 'All levels', ar: 'جميع المستويات' },
    gender: { en: 'Open', ar: 'مفتوح' },
    capacity: 30,
    remaining: 18,
    price: 40,
    registrationDeadline: '2026-08-21',
    included: {
      en: ['Shooting coaching', 'Shot-tracking sheet'],
      ar: ['تدريب التسديد', 'ورقة تتبع التسديد'],
    },
    bring: { en: ['Basketball shoes', 'Water bottle'], ar: ['حذاء كرة سلة', 'زجاجة ماء'] },
    organizer: null,
    related: ['ev01'],
  },
  {
    id: 'ev03',
    slug: 'academy-tryouts-september',
    status: 'full',
    category: 'tryouts',
    title: { en: 'Academy Tryouts', ar: 'اختبارات الأكاديمية' },
    description: {
      en: 'Open tryouts for placement into the academy development pathway. (Demo: currently full.)',
      ar: 'اختبارات مفتوحة للانضمام إلى مسار تطوير الأكاديمية. (تجريبي: مكتمل حالياً.)',
    },
    coverImage: '/images/events/tryouts.jpg',
    gallery: [],
    startDate: '2026-09-06',
    endDate: '2026-09-06',
    startTime: '09:00',
    endTime: '12:00',
    timezone: 'Africa/Tripoli',
    venue: { en: 'LHA Academy Court', ar: 'ملعب أكاديمية LHA' },
    address: { en: 'Address to be confirmed', ar: 'العنوان سيتم تأكيده' },
    mapLink: '',
    ageGroup: { en: 'Ages 12–18', ar: 'الأعمار 12–18' },
    level: { en: 'All levels', ar: 'جميع المستويات' },
    gender: { en: 'Open', ar: 'مفتوح' },
    capacity: 50,
    remaining: 0,
    price: 0,
    registrationDeadline: '2026-09-03',
    included: { en: ['Assessment', 'Placement feedback'], ar: ['تقييم', 'ملاحظات التصنيف'] },
    bring: { en: ['Basketball shoes', 'Water bottle'], ar: ['حذاء كرة سلة', 'زجاجة ماء'] },
    organizer: null,
    related: ['ev01'],
  },
  {
    id: 'ev04',
    slug: '3x3-open-run',
    status: 'open',
    category: 'open-runs',
    title: { en: '3x3 Open Run', ar: 'جري مفتوح 3×3' },
    description: {
      en: 'Competitive 3x3 open run. Bring your game — teams formed on the day. Casual, competitive, fun.',
      ar: 'جري مفتوح تنافسي 3×3. أحضر مستواك — تُشكّل الفرق في نفس اليوم. ودّي وتنافسي وممتع.',
    },
    coverImage: '/images/events/open-run.jpg',
    gallery: [],
    startDate: '2026-09-20',
    endDate: '2026-09-20',
    startTime: '17:00',
    endTime: '20:00',
    timezone: 'Africa/Tripoli',
    venue: { en: 'LHA Academy Court', ar: 'ملعب أكاديمية LHA' },
    address: { en: 'Address to be confirmed', ar: 'العنوان سيتم تأكيده' },
    mapLink: '',
    ageGroup: { en: 'Ages 16+', ar: 'الأعمار 16+' },
    level: { en: 'Open', ar: 'مفتوح' },
    gender: { en: 'Open', ar: 'مفتوح' },
    capacity: 48,
    remaining: 24,
    price: 15,
    registrationDeadline: '2026-09-19',
    included: { en: ['Refereed games', 'Court time'], ar: ['مباريات محكّمة', 'وقت اللعب'] },
    bring: {
      en: ['Basketball shoes', 'Light & dark shirt'],
      ar: ['حذاء كرة سلة', 'قميص فاتح وآخر داكن'],
    },
    organizer: null,
    related: ['ev02'],
  },
  {
    id: 'ev05',
    slug: 'spring-skills-clinic-2026',
    status: 'ended',
    category: 'clinics',
    title: { en: 'Spring Skills Clinic', ar: 'ورشة مهارات الربيع' },
    description: {
      en: 'A past skills clinic covering handling, finishing and footwork. (Demo: this event has ended.)',
      ar: 'ورشة مهارات سابقة غطّت التحكم والإنهاء وحركة القدمين. (تجريبي: انتهت هذه الفعالية.)',
    },
    coverImage: '/images/events/spring-clinic.jpg',
    gallery: [],
    startDate: '2026-05-17',
    endDate: '2026-05-17',
    startTime: '10:00',
    endTime: '13:00',
    timezone: 'Africa/Tripoli',
    venue: { en: 'LHA Academy Court', ar: 'ملعب أكاديمية LHA' },
    address: { en: 'Address to be confirmed', ar: 'العنوان سيتم تأكيده' },
    mapLink: '',
    ageGroup: { en: 'Ages 10+', ar: 'الأعمار 10+' },
    level: { en: 'All levels', ar: 'جميع المستويات' },
    gender: { en: 'Open', ar: 'مفتوح' },
    capacity: 30,
    remaining: 0,
    price: 35,
    registrationDeadline: '2026-05-15',
    included: { en: ['Skills coaching'], ar: ['تدريب المهارات'] },
    bring: { en: ['Basketball shoes', 'Water bottle'], ar: ['حذاء كرة سلة', 'زجاجة ماء'] },
    organizer: null,
    related: ['ev02'],
  },
];

export const eventCategories = [
  { slug: 'camps', name: { en: 'Camps', ar: 'معسكرات' } },
  { slug: 'clinics', name: { en: 'Clinics', ar: 'ورش' } },
  { slug: 'tryouts', name: { en: 'Tryouts', ar: 'اختبارات' } },
  { slug: 'tournaments', name: { en: 'Tournaments', ar: 'بطولات' } },
  { slug: 'open-runs', name: { en: 'Open Runs', ar: 'جري مفتوح' } },
  { slug: 'workshops', name: { en: 'Workshops', ar: 'ورش عمل' } },
  { slug: 'registration', name: { en: 'Academy Registration', ar: 'تسجيل الأكاديمية' } },
  { slug: 'special', name: { en: 'Special Sessions', ar: 'جلسات خاصة' } },
];

export const getEvent = (slug) => events.find((e) => e.slug === slug);
export const isEventEnded = (e) =>
  e.status === 'ended' || new Date(e.endDate) < new Date(new Date().toDateString());
export const canRegister = (e) =>
  e.status === 'open' &&
  e.remaining > 0 &&
  new Date(e.registrationDeadline) >= new Date(new Date().toDateString());
export const upcomingEvents = () =>
  events
    .filter((e) => !isEventEnded(e))
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
export const pastEvents = () =>
  events.filter(isEventEnded).sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
export const featuredEvents = () => upcomingEvents().filter((e) => e.featured);
export const relatedEvents = (event, limit = 3) =>
  (event?.related || [])
    .map((s) => events.find((e) => e.id === s))
    .filter(Boolean)
    .slice(0, limit);
