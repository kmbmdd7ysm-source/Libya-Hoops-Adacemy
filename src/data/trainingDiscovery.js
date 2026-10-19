// Source-data-only discovery helpers. Never generate pricing, duration or rights.
export const trainingGoals = [
  { id: 'all', label: { en: 'All Training', ar: 'كل الأنظمة' } },
  { id: 'performance', label: { en: 'Athletic Performance', ar: 'الأداء الرياضي' } },
  { id: 'strength', label: { en: 'Strength & Body', ar: 'القوة واللياقة' } },
  { id: 'skills', label: { en: 'Basketball Skills', ar: 'مهارات كرة السلة' } },
];

export const durationFilters = [
  { id: 'all', label: { en: 'Any Duration', ar: 'كل المدد' } },
  { id: '4w', label: { en: '4 Weeks', ar: '4 أسابيع' } },
  { id: '8w', label: { en: '8 Weeks', ar: '8 أسابيع' } },
  { id: '12w', label: { en: '12 Weeks', ar: '12 أسبوعاً' } },
  { id: '1m', label: { en: '1 Month', ar: 'شهر' } },
  { id: '3m', label: { en: '3 Months', ar: '3 أشهر' } },
  { id: '6m', label: { en: '6 Months', ar: '6 أشهر' } },
  { id: '12m', label: { en: '12 Months', ar: '12 شهراً' } },
];

export const trainingGoal = (program) => {
  if (program.category === 'performance') return 'performance';
  if (program.category === 'strength' || program.category === 'strength-conditioning') {
    return 'strength';
  }
  return 'skills';
};

const fromDuration = (value = '') => {
  const match = String(value).toLowerCase().match(/(?:^|\s)(\d+)\s*(weeks?|months?)/);
  if (!match) return null;
  return `${Number(match[1])}${match[2].startsWith('week') ? 'w' : 'm'}`;
};

// A program has precisely its supplied purchase tiers. 3- and 6-month plans
// must never be synthesized from a 4-week program or from a headline range.
export const trainingDurationIds = (program) => {
  const options = Array.isArray(program.purchaseOptions) ? program.purchaseOptions : [];
  const fields = options.length ? options.map((item) => item.duration?.en || '') : [program.duration?.en || ''];
  return [...new Set(fields.map(fromDuration).filter(Boolean))];
};

export const matchesTraining = (program, goal = 'all', duration = 'all') => {
  if (program.available === false) return false;
  if (goal !== 'all' && trainingGoal(program) !== goal) return false;
  if (duration !== 'all' && !trainingDurationIds(program).includes(duration)) return false;
  return true;
};

export const listedPrices = (program) => {
  const options = Array.isArray(program.purchaseOptions) ? program.purchaseOptions : [];
  return options.length
    ? options.map(({ id, label, duration, price }) => ({ id, label, duration, price }))
    : [{ id: 'standard', label: null, duration: program.duration, price: program.price }];
};
