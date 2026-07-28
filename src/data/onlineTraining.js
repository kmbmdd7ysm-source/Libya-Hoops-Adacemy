// ============================================================================
// ONLINE TRAINING (digital programs)  —  EDITABLE DEMO DATA.
// These are purchasable digital items and can be added to the same cart.
// `available: false` shows the program as "coming soon" and blocks purchase.
// `coach` is a coach slug (coaches.js) or null. `trailerUrl` optional.
// ============================================================================

export const onlineTraining = [

  {id:'ot10',slug:'vert-code-elite',available:true,featured:true,category:'performance',title:{en:'The Vert Code Elite',ar:'ذا فيرت كود إيليت'},description:{en:'Advanced 12-month vertical jump, speed and explosiveness system.',ar:'نظام متقدم لمدة 12 شهراً للقفزة العمودية والسرعة والانفجار.'},coverImage:'/images/training/vert-code-elite.jpg?v=20260728-2',price:99,level:{en:'Advanced',ar:'متقدم'},recommendedAge:{en:'Ages 15+',ar:'الأعمار 15+'},duration:{en:'12 months · 5 days/week',ar:'12 شهراً · 5 أيام أسبوعياً'},sessions:260,equipment:{en:['Weight room'],ar:['صالة أوزان']},outcomes:{en:['Vertical jump','Speed','Explosiveness'],ar:['القفزة العمودية','السرعة','الانفجار']},forWho:{en:'Advanced athletes with resistance-training experience.',ar:'للرياضيين المتقدمين ذوي خبرة المقاومة.'},curriculum:[{title:{en:'Base · Load · Explode · Spring',ar:'الأساس · التحميل · الانفجار · المرونة'},lessons:{en:['Strength and stability','Energy storage and transfer','Fast force production','Elasticity'],ar:['القوة والثبات','تخزين ونقل الطاقة','إنتاج القوة السريع','المرونة']}}],includedResources:{en:['Nutrition','Jump mechanics','Recovery','Mentality','Knee guide'],ar:['التغذية','ميكانيكا القفز','الاستشفاء','العقلية','دليل الركبة']},deliveryType:{en:'Digital plan + guides',ar:'خطة رقمية + أدلة'},coach:null,related:['ot11']},
  {id:'ot11',slug:'overtime-athletes-performance',available:true,featured:true,category:'performance',title:{en:'Overtime Athletes Performance',ar:'برنامج أوفرتايم أثليتس للأداء'},description:{en:'Complete 12-week power-athlete program combining plyometrics, speed, strength, power and change of direction.',ar:'برنامج متكامل لمدة 12 أسبوعاً يجمع البليومتريكس والسرعة والقوة والانفجار وتغيير الاتجاه.'},coverImage:'/images/training/overtime-athletes-performance.jpg?v=20260728-2',price:79,level:{en:'Intermediate–advanced',ar:'متوسط–متقدم'},recommendedAge:{en:'Ages 15+',ar:'الأعمار 15+'},duration:{en:'12 weeks · 4 days/week',ar:'12 أسبوعاً · 4 أيام أسبوعياً'},sessions:48,equipment:{en:['Weight room','Medicine ball','Sprint space'],ar:['صالة أوزان','كرة طبية','مساحة للسرعة']},outcomes:{en:['Speed','Power','Strength','Change of direction'],ar:['السرعة','الانفجار','القوة','تغيير الاتجاه']},forWho:{en:'Power athletes seeking a structured performance split.',ar:'لرياضيي القوة الباحثين عن برنامج أداء منظم.'},curriculum:[{title:{en:'Weekly split',ar:'التقسيم الأسبوعي'},lessons:{en:['Plyometrics + lower','Speed + upper','COD + lower','Power + upper'],ar:['بليومتريكس + سفلي','سرعة + علوي','تغيير اتجاه + سفلي','قوة انفجارية + علوي']}}],includedResources:{en:['Goal tracker','Dynamic warm-up','Deload weeks'],ar:['متتبع الأهداف','إحماء ديناميكي','أسابيع تخفيف']},deliveryType:{en:'PDF program',ar:'برنامج PDF'},coach:null,related:['ot10']},
  {id:'ot12',slug:'bodyweight-work',available:true,category:'strength',title:{en:'Bodyweight Work',ar:'برنامج وزن الجسم'},description:{en:'Three-month bodyweight strength and conditioning plan.',ar:'خطة قوة ولياقة بوزن الجسم لمدة ثلاثة أشهر.'},coverImage:'/images/training/bodyweight-work.jpg?v=20260728-2',price:49,level:{en:'All levels',ar:'جميع المستويات'},recommendedAge:{en:'Ages 13+',ar:'الأعمار 13+'},duration:{en:'3 months · 4–5 days/week',ar:'3 أشهر · 4–5 أيام أسبوعياً'},sessions:54,equipment:{en:['Open space'],ar:['مساحة مفتوحة']},outcomes:{en:['Strength','Mobility','Conditioning'],ar:['القوة','الحركة','اللياقة']},forWho:{en:'Home and no-gym athletes.',ar:'للتدريب المنزلي ودون صالة.'},curriculum:[],includedResources:{en:['Progressions','Substitutions','Recovery'],ar:['تدرج','بدائل','استشفاء']},deliveryType:{en:'Digital plan',ar:'خطة رقمية'},coach:null,related:['ot13']},
  {id:'ot13',slug:'full-body-strength',available:true,category:'strength',title:{en:'Full Body Strength',ar:'قوة الجسم بالكامل'},description:{en:'Progressive three- or six-month full-body strength system.',ar:'نظام متدرج لقوة الجسم بالكامل لمدة ثلاثة أو ستة أشهر.'},coverImage:'/images/training/full-body-strength.jpg?v=20260728-2',price:69,level:{en:'Intermediate',ar:'متوسط'},recommendedAge:{en:'Ages 15+',ar:'الأعمار 15+'},duration:{en:'3–6 months · 4–5 days/week',ar:'3–6 أشهر · 4–5 أيام أسبوعياً'},sessions:108,equipment:{en:['Full gym'],ar:['صالة متكاملة']},outcomes:{en:['Total-body strength','Lean muscle','Durability'],ar:['قوة الجسم','الكتلة العضلية','التحمل']},forWho:{en:'Athletes building long-term strength.',ar:'للرياضيين الباحثين عن قوة طويلة المدى.'},curriculum:[],includedResources:{en:['3-month track','6-month progression'],ar:['مسار 3 أشهر','تدرج 6 أشهر']},deliveryType:{en:'Digital plan',ar:'خطة رقمية'},coach:null,related:['ot12','ot14']},
  {id:'ot14',slug:'full-week-legs',available:true,category:'strength',title:{en:'Full Week Legs',ar:'برنامج الأرجل الأسبوعي الكامل'},description:{en:'Eight-week lower-body specialization plan.',ar:'خطة تخصصية للجزء السفلي لمدة ثمانية أسابيع.'},coverImage:'/images/training/full-week-legs.jpg?v=20260728-2',price:45,level:{en:'Intermediate',ar:'متوسط'},recommendedAge:{en:'Ages 15+',ar:'الأعمار 15+'},duration:{en:'8 weeks · 3 days/week',ar:'8 أسابيع · 3 أيام أسبوعياً'},sessions:24,equipment:{en:['Weight room'],ar:['صالة أوزان']},outcomes:{en:['Leg strength','Power','Balance'],ar:['قوة الأرجل','الانفجار','التوازن']},forWho:{en:'Athletes prioritizing lower-body development.',ar:'للرياضيين الذين يركزون على الجزء السفلي.'},curriculum:[],includedResources:{en:['Three-day split','Progressive loading'],ar:['تقسيم 3 أيام','تحميل متدرج']},deliveryType:{en:'Digital plan',ar:'خطة رقمية'},coach:null,related:['ot13']},

  {
    id: 'ot01',
    slug: 'complete-ball-handling',
    available: true,
    featured: true,
    category: 'ball-handling',
    title: { en: 'Complete Ball Handling', ar: 'التحكم الكامل بالكرة' },
    description: {
      en: 'A full program to develop elite, pressure-proof handles from the ground up — daily drills you can do anywhere.',
      ar: 'برنامج كامل لتطوير تحكم متقدم يقاوم الضغط من الصفر — تمارين يومية يمكنك أداؤها في أي مكان.',
    },
    coverImage: '/images/training/ball-handling.jpg?v=20260728-2',
    trailerUrl: '',
    price: 39,
    compareAt: 59,
    level: { en: 'All levels', ar: 'جميع المستويات' },
    recommendedAge: { en: 'Ages 12+', ar: 'الأعمار 12+' },
    duration: { en: '6 weeks', ar: '6 أسابيع' },
    sessions: 24,
    equipment: { en: ['Basketball', 'Open space'], ar: ['كرة سلة', 'مساحة مفتوحة'] },
    outcomes: {
      en: ['Tighter, faster handle', 'Confidence under pressure', 'Better weak-hand control'],
      ar: ['تحكم أسرع وأدق', 'ثقة تحت الضغط', 'تحكم أفضل باليد الضعيفة'],
    },
    forWho: {
      en: 'Players who want a reliable handle in games, not just in the driveway.',
      ar: 'اللاعبون الذين يريدون تحكماً موثوقاً في المباريات، لا في التمرين فقط.',
    },
    curriculum: [
      {
        title: { en: 'Week 1 · Foundations', ar: 'الأسبوع 1 · الأساسيات' },
        lessons: {
          en: ['Hand positioning', 'Pound series', 'Control dribbles'],
          ar: ['وضع اليد', 'سلسلة الطرق', 'محاورات التحكم'],
        },
      },
      {
        title: { en: 'Week 2 · Combos', ar: 'الأسبوع 2 · التوليفات' },
        lessons: {
          en: ['Crossover chains', 'Between-the-legs', 'Behind-the-back'],
          ar: ['سلاسل الكروس', 'بين الساقين', 'خلف الظهر'],
        },
      },
      {
        title: { en: 'Weeks 3–6 · Game Application', ar: 'الأسابيع 3–6 · التطبيق' },
        lessons: {
          en: ['Change of pace', 'Creating separation', 'Live reads'],
          ar: ['تغيير الإيقاع', 'خلق المساحة', 'القراءة الحية'],
        },
      },
    ],
    includedResources: {
      en: ['Downloadable drill sheet', 'Progress tracker', 'Lifetime access'],
      ar: ['ورقة تمارين للتحميل', 'متتبع التقدم', 'وصول مدى الحياة'],
    },
    deliveryType: { en: 'On-demand video + PDF', ar: 'فيديو عند الطلب + PDF' },
    coach: null,
    related: ['ot02', 'ot06'],
  },
  {
    id: 'ot02',
    slug: 'shooting-mechanics',
    available: true,
    featured: true,
    category: 'shooting',
    title: { en: 'Shooting Mechanics', ar: 'ميكانيكا التسديد' },
    description: {
      en: 'Rebuild a clean, repeatable jump shot and extend your range with a proven mechanics framework.',
      ar: 'أعد بناء تسديدة نظيفة وثابتة ووسّع مداك بإطار ميكانيكي مُثبت.',
    },
    coverImage: '/images/training/shooting.jpg?v=20260728-2',
    trailerUrl: '',
    price: 44,
    compareAt: 65,
    level: { en: 'All levels', ar: 'جميع المستويات' },
    recommendedAge: { en: 'Ages 12+', ar: 'الأعمار 12+' },
    duration: { en: '5 weeks', ar: '5 أسابيع' },
    sessions: 20,
    equipment: { en: ['Basketball', 'Hoop'], ar: ['كرة سلة', 'سلة'] },
    outcomes: {
      en: ['Consistent release', 'Extended range', 'Higher makes %'],
      ar: ['إطلاق ثابت', 'مدى أوسع', 'نسبة نجاح أعلى'],
    },
    forWho: {
      en: 'Anyone who wants to shoot it the same way every time.',
      ar: 'كل من يريد التسديد بنفس الطريقة في كل مرة.',
    },
    curriculum: [
      {
        title: { en: 'Base & Balance', ar: 'القاعدة والتوازن' },
        lessons: {
          en: ['Stance & alignment', 'Footwork into the shot'],
          ar: ['الوقفة والمحاذاة', 'حركة القدمين نحو التسديد'],
        },
      },
      {
        title: { en: 'Release', ar: 'الإطلاق' },
        lessons: {
          en: ['Hand placement', 'One-motion release', 'Follow-through'],
          ar: ['وضع اليد', 'إطلاق بحركة واحدة', 'المتابعة'],
        },
      },
      {
        title: { en: 'Range & Application', ar: 'المدى والتطبيق' },
        lessons: {
          en: ['Extending range', 'Off-the-catch', 'Off-the-dribble'],
          ar: ['توسيع المدى', 'من الاستلام', 'من المحاورة'],
        },
      },
    ],
    includedResources: {
      en: ['Form checklist', 'Shot-tracking sheet', 'Lifetime access'],
      ar: ['قائمة فحص الشكل', 'ورقة تتبع التسديد', 'وصول مدى الحياة'],
    },
    deliveryType: { en: 'On-demand video + PDF', ar: 'فيديو عند الطلب + PDF' },
    coach: null,
    related: ['ot01', 'ot03'],
  },
  {
    id: 'ot03',
    slug: 'finishing-package',
    available: true,
    category: 'finishing',
    title: { en: 'Finishing Package', ar: 'حزمة الإنهاء' },
    description: {
      en: 'Score through contact and finish with either hand from every angle around the rim.',
      ar: 'سجّل عبر الاحتكاك وأنهِ بكلتا اليدين من كل زاوية حول السلة.',
    },
    coverImage: '/images/training/finishing.jpg?v=20260728-2',
    trailerUrl: '',
    price: 34,
    level: { en: 'Intermediate', ar: 'متوسط' },
    recommendedAge: { en: 'Ages 13+', ar: 'الأعمار 13+' },
    duration: { en: '4 weeks', ar: '4 أسابيع' },
    sessions: 16,
    equipment: { en: ['Basketball', 'Hoop'], ar: ['كرة سلة', 'سلة'] },
    outcomes: {
      en: ['Finish through contact', 'Ambidextrous layups', 'Advanced touch'],
      ar: ['الإنهاء عبر الاحتكاك', 'لياب بكلتا اليدين', 'لمسة متقدمة'],
    },
    forWho: {
      en: 'Drivers who get to the rim but need to convert.',
      ar: 'المخترقون الذين يصلون للسلة لكن يحتاجون التسجيل.',
    },
    curriculum: [
      {
        title: { en: 'Layup Library', ar: 'مكتبة اللياب' },
        lessons: {
          en: ['Euro & reverse', 'Floaters', 'Contact layups'],
          ar: ['يورو وعكسي', 'التسديدة العائمة', 'لياب الاحتكاك'],
        },
      },
      {
        title: { en: 'Finishing Under Pressure', ar: 'الإنهاء تحت الضغط' },
        lessons: { en: ['Angles', 'Absorbing contact'], ar: ['الزوايا', 'امتصاص الاحتكاك'] },
      },
    ],
    includedResources: {
      en: ['Finishing checklist', 'Lifetime access'],
      ar: ['قائمة الإنهاء', 'وصول مدى الحياة'],
    },
    deliveryType: { en: 'On-demand video', ar: 'فيديو عند الطلب' },
    coach: null,
    related: ['ot02', 'ot04'],
  },
  {
    id: 'ot04',
    slug: 'footwork-fundamentals',
    available: true,
    category: 'footwork',
    title: { en: 'Footwork Fundamentals', ar: 'أساسيات حركة القدمين' },
    description: {
      en: 'The footwork that unlocks everything — pivots, jab steps, triple threat and creating space.',
      ar: 'حركة القدمين التي تفتح كل شيء — الارتكاز والخطوات وخلق المساحة.',
    },
    coverImage: '/images/training/footwork.jpg?v=20260728-2',
    trailerUrl: '',
    price: 29,
    level: { en: 'All levels', ar: 'جميع المستويات' },
    recommendedAge: { en: 'Ages 12+', ar: 'الأعمار 12+' },
    duration: { en: '3 weeks', ar: '3 أسابيع' },
    sessions: 12,
    equipment: { en: ['Basketball'], ar: ['كرة سلة'] },
    outcomes: {
      en: ['Balanced footwork', 'Cleaner moves', 'More space'],
      ar: ['توازن في القدمين', 'حركات أنظف', 'مساحة أكبر'],
    },
    forWho: {
      en: 'Players building a sound skill base.',
      ar: 'اللاعبون الذين يبنون قاعدة مهارية سليمة.',
    },
    curriculum: [
      {
        title: { en: 'Pivots & Triple Threat', ar: 'الارتكاز والتهديد الثلاثي' },
        lessons: {
          en: ['Front & reverse pivot', 'Jab series'],
          ar: ['ارتكاز أمامي وعكسي', 'سلسلة الخطوات'],
        },
      },
    ],
    includedResources: {
      en: ['Footwork drills PDF', 'Lifetime access'],
      ar: ['PDF تمارين القدمين', 'وصول مدى الحياة'],
    },
    deliveryType: { en: 'On-demand video + PDF', ar: 'فيديو عند الطلب + PDF' },
    coach: null,
    related: ['ot01', 'ot03'],
  },
  {
    id: 'ot05',
    slug: 'basketball-iq',
    available: true,
    category: 'basketball-iq',
    title: { en: 'Basketball IQ', ar: 'ذكاء كرة السلة' },
    description: {
      en: 'See the game a step ahead — spacing, reads, pick-and-roll decisions and playing without the ball.',
      ar: 'شاهد اللعبة بخطوة استباقية — التموضع والقراءة وقرارات الحجب واللعب بدون كرة.',
    },
    coverImage: '/images/training/basketball-iq.jpg?v=20260728-2',
    trailerUrl: '',
    price: 34,
    level: { en: 'Intermediate+', ar: 'متوسط فأعلى' },
    recommendedAge: { en: 'Ages 13+', ar: 'الأعمار 13+' },
    duration: { en: '4 weeks', ar: '4 أسابيع' },
    sessions: 14,
    equipment: { en: ['None — film & concepts'], ar: ['لا شيء — مفاهيم وفيديو'] },
    outcomes: {
      en: ['Better decisions', 'Read defenses', 'Play off-ball'],
      ar: ['قرارات أفضل', 'قراءة الدفاع', 'اللعب بدون كرة'],
    },
    forWho: {
      en: 'Players who want to think the game, not just play it.',
      ar: 'اللاعبون الذين يريدون فهم اللعبة لا لعبها فقط.',
    },
    curriculum: [
      {
        title: { en: 'Spacing & Reads', ar: 'التموضع والقراءة' },
        lessons: {
          en: ['Court spacing', 'Reading help', 'PnR reads'],
          ar: ['تموضع الملعب', 'قراءة المساعدة', 'قراءة الحجب'],
        },
      },
    ],
    includedResources: {
      en: ['Concept guide', 'Lifetime access'],
      ar: ['دليل المفاهيم', 'وصول مدى الحياة'],
    },
    deliveryType: { en: 'On-demand video', ar: 'فيديو عند الطلب' },
    coach: null,
    related: ['ot02', 'ot06'],
  },
  {
    id: 'ot06',
    slug: 'strength-and-conditioning',
    available: true,
    featured: true,
    category: 'strength-conditioning',
    title: { en: 'Strength & Conditioning', ar: 'القوة واللياقة' },
    description: {
      en: 'Basketball-specific training for speed, power and durability — home and gym versions included.',
      ar: 'تدريب خاص بكرة السلة للسرعة والقوة والتحمّل — نسختان للمنزل والنادي.',
    },
    coverImage: '/images/training/strength.jpg?v=20260728-2',
    trailerUrl: '',
    price: 44,
    compareAt: 60,
    level: { en: 'All levels', ar: 'جميع المستويات' },
    recommendedAge: { en: 'Ages 14+', ar: 'الأعمار 14+' },
    duration: { en: '8 weeks', ar: '8 أسابيع' },
    sessions: 32,
    equipment: { en: ['Optional dumbbells / bands'], ar: ['دمبل / أشرطة (اختياري)'] },
    outcomes: {
      en: ['More explosive', 'Stronger & faster', 'Injury-resilient'],
      ar: ['انفجارية أكبر', 'أقوى وأسرع', 'مقاومة للإصابة'],
    },
    forWho: {
      en: 'Athletes ready to build a real physical base.',
      ar: 'الرياضيون المستعدون لبناء قاعدة بدنية حقيقية.',
    },
    curriculum: [
      {
        title: { en: 'Foundation Phase', ar: 'مرحلة التأسيس' },
        lessons: { en: ['Movement prep', 'Base strength'], ar: ['تهيئة الحركة', 'قوة أساسية'] },
      },
      {
        title: { en: 'Power Phase', ar: 'مرحلة القوة' },
        lessons: {
          en: ['Jump training', 'Speed & agility'],
          ar: ['تدريب القفز', 'السرعة والرشاقة'],
        },
      },
    ],
    includedResources: {
      en: ['8-week plan PDF', 'Home & gym tracks', 'Lifetime access'],
      ar: ['خطة 8 أسابيع PDF', 'مسارا المنزل والنادي', 'وصول مدى الحياة'],
    },
    deliveryType: { en: 'On-demand video + PDF', ar: 'فيديو عند الطلب + PDF' },
    coach: null,
    related: ['ot01', 'ot02'],
  },
];

// Optional filter categories for the Online Training page.
export const trainingCategories = [
  { slug: 'ball-handling', name: { en: 'Ball Handling', ar: 'التحكم بالكرة' } },
  { slug: 'shooting', name: { en: 'Shooting', ar: 'التسديد' } },
  { slug: 'finishing', name: { en: 'Finishing', ar: 'الإنهاء' } },
  { slug: 'footwork', name: { en: 'Footwork', ar: 'حركة القدمين' } },
  { slug: 'basketball-iq', name: { en: 'Basketball IQ', ar: 'ذكاء كرة السلة' } },
  { slug: 'strength-conditioning', name: { en: 'Strength & Conditioning', ar: 'القوة واللياقة' } },
];

export const getTraining = (slug) => onlineTraining.find((t) => t.slug === slug);
export const featuredTraining = () => onlineTraining.filter((t) => t.featured);
export const relatedTraining = (program, limit = 3) =>
  (program?.related || [])
    .map((s) => onlineTraining.find((t) => t.id === s))
    .filter(Boolean)
    .slice(0, limit);
