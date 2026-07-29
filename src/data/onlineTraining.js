// ============================================================================
// ONLINE TRAINING (digital programs)  —  EDITABLE DEMO DATA.
// These are purchasable digital items and can be added to the same cart.
// `available: false` shows the program as "coming soon" and blocks purchase.
// `coach` is a coach slug (coaches.js) or null. `trailerUrl` optional.
// ============================================================================

export const onlineTraining = [

  {id:'ot10',slug:'vert-code-elite',available:true,featured:true,category:'performance',title:{en:'LHA Flight',ar:'برنامج LHA Flight'},description:{en:'A complete advanced vertical-jump, speed and explosiveness system built around four progressive phases: Base, Load & Redirect, Explode and Spring. Includes structured weekly progressions, recovery guidance and performance tracking.',ar:'نظام متكامل ومتقدم لتطوير القفزة العمودية والسرعة والانفجار عبر أربع مراحل متدرجة: الأساس، التحميل وإعادة التوجيه، الانفجار، والمرونة الارتدادية. يشمل تقدمات أسبوعية وإرشادات الاستشفاء وتتبع الأداء.'},coverImage:'/images/categories/compression.jpg',price:25,purchaseOptions:[{id:'monthly',label:{en:'Monthly Access',ar:'اشتراك شهري'},duration:{en:'1 month',ar:'شهر واحد'},price:25},{id:'annual',label:{en:'Full 12-Month Program',ar:'البرنامج الكامل 12 شهراً'},duration:{en:'12 months',ar:'12 شهراً'},price:280,compareAt:300,savings:{en:'Save $20',ar:'وفر 20$'}}],level:{en:'Advanced',ar:'متقدم'},recommendedAge:{en:'Ages 15+',ar:'الأعمار 15+'},duration:{en:'12 months · 5 days/week',ar:'12 شهراً · 5 أيام أسبوعياً'},sessions:260,equipment:{en:['Weight room'],ar:['صالة أوزان']},outcomes:{en:['Vertical jump','Speed','Explosiveness'],ar:['القفزة العمودية','السرعة','الانفجار']},forWho:{en:'Advanced athletes with resistance-training experience.',ar:'للرياضيين المتقدمين ذوي خبرة المقاومة.'},curriculum:[{title:{en:'Phase 1 · Base',ar:'المرحلة 1 · الأساس'},lessons:{en:['Movement quality and landing mechanics','Strength and joint stability','Injury-risk reduction habits'],ar:['جودة الحركة وميكانيكا الهبوط','القوة وثبات المفاصل','عادات تقليل خطر الإصابة']}},{title:{en:'Phase 2 · Load & Redirect',ar:'المرحلة 2 · التحميل وإعادة التوجيه'},lessons:{en:['Eccentric strength','Tendon energy storage','Fast change of direction'],ar:['القوة اللامركزية','تخزين الطاقة في الأوتار','تغيير الاتجاه السريع']}},{title:{en:'Phase 3 · Explode',ar:'المرحلة 3 · الانفجار'},lessons:{en:['Rate of force development','Concentric power','First-step acceleration'],ar:['سرعة إنتاج القوة','القوة الانفجارية','تسارع الخطوة الأولى']}},{title:{en:'Phase 4 · Spring',ar:'المرحلة 4 · المرونة الارتدادية'},lessons:{en:['Elasticity and stiffness','One-foot and two-foot jumping','Reactive plyometrics'],ar:['المرونة والصلابة','القفز بقدم وقدمين','البليومتريكس التفاعلي']}}],includedResources:{en:['Nutrition','Jump mechanics','Recovery','Mentality','Knee guide'],ar:['التغذية','ميكانيكا القفز','الاستشفاء','العقلية','دليل الركبة']},deliveryType:{en:'Digital plan + guides',ar:'خطة رقمية + أدلة'},coach:null,related:['ot11']},
  {id:'ot11',slug:'overtime-athletes-performance',available:true,featured:true,category:'performance',title:{en:'LHA Force',ar:'برنامج LHA Force'},description:{en:'A complete elite athletic-performance system combining acceleration, plyometrics, strength, power, deceleration and change of direction. The weekly split is designed to improve on-court explosiveness without sacrificing movement quality.',ar:'نظام أداء رياضي متكامل يجمع التسارع والبليومتريكس والقوة والانفجار والتباطؤ وتغيير الاتجاه. صُمم التقسيم الأسبوعي لرفع الانفجار داخل الملعب دون التأثير على جودة الحركة.'},coverImage:'/images/categories/clothing-hero-player.jpeg',price:90,level:{en:'Intermediate–advanced',ar:'متوسط–متقدم'},recommendedAge:{en:'Ages 15+',ar:'الأعمار 15+'},duration:{en:'12 weeks · 4 days/week',ar:'12 أسبوعاً · 4 أيام أسبوعياً'},sessions:48,equipment:{en:['Weight room','Medicine ball','Sprint space'],ar:['صالة أوزان','كرة طبية','مساحة للسرعة']},outcomes:{en:['Speed','Power','Strength','Change of direction'],ar:['السرعة','الانفجار','القوة','تغيير الاتجاه']},forWho:{en:'Power athletes seeking a structured performance split.',ar:'لرياضيي القوة الباحثين عن برنامج أداء منظم.'},curriculum:[{title:{en:'Day 1 · Plyometrics + Lower Strength',ar:'اليوم 1 · بليومتريكس + قوة الجزء السفلي'},lessons:{en:['Landing mechanics','Jump progressions','Lower-body strength'],ar:['ميكانيكا الهبوط','تدرج القفز','قوة الجزء السفلي']}},{title:{en:'Day 2 · Speed + Upper Strength',ar:'اليوم 2 · سرعة + قوة الجزء العلوي'},lessons:{en:['Acceleration technique','Sprint mechanics','Upper-body strength'],ar:['تقنية التسارع','ميكانيكا السرعة','قوة الجزء العلوي']}},{title:{en:'Day 3–4 · COD + Power',ar:'اليومان 3–4 · تغيير الاتجاه + القوة الانفجارية'},lessons:{en:['Deceleration','Reactive change of direction','Medicine-ball power'],ar:['التباطؤ','تغيير الاتجاه التفاعلي','القوة بالكرة الطبية']}}],includedResources:{en:['Goal tracker','Dynamic warm-up','Deload weeks'],ar:['متتبع الأهداف','إحماء ديناميكي','أسابيع تخفيف']},deliveryType:{en:'PDF program',ar:'برنامج PDF'},coach:null,related:['ot10']},
  {id:'ot12',slug:'bodyweight-work',available:true,category:'strength',title:{en:'LHA Base',ar:'برنامج LHA Base'},description:{en:'A progressive bodyweight strength plan for athletes training at home or without a gym. Each phase develops control, mobility, muscular endurance and athletic conditioning with clear progressions and exercise substitutions.',ar:'خطة قوة متدرجة بوزن الجسم للرياضيين الذين يتدربون في المنزل أو دون صالة. تطور كل مرحلة التحكم والحركة والتحمل العضلي واللياقة مع تدرجات وبدائل واضحة للتمارين.'},coverImage:'/images/products/lha-own-game-sleeveless-black.jpeg',price:15,purchaseOptions:[{id:'one-month',label:{en:'1 Month',ar:'شهر واحد'},duration:{en:'1 month',ar:'شهر واحد'},price:15},{id:'three-months',label:{en:'3 Months',ar:'3 أشهر'},duration:{en:'3 months',ar:'3 أشهر'},price:40,compareAt:45,savings:{en:'Save $5',ar:'وفر 5$'}},{id:'six-months',label:{en:'6 Months',ar:'6 أشهر'},duration:{en:'6 months',ar:'6 أشهر'},price:65,compareAt:90,savings:{en:'Save $25',ar:'وفر 25$'}}],level:{en:'All levels',ar:'جميع المستويات'},recommendedAge:{en:'Ages 13+',ar:'الأعمار 13+'},duration:{en:'3 months · 4–5 days/week',ar:'3 أشهر · 4–5 أيام أسبوعياً'},sessions:54,equipment:{en:['Open space'],ar:['مساحة مفتوحة']},outcomes:{en:['Strength','Mobility','Conditioning'],ar:['القوة','الحركة','اللياقة']},forWho:{en:'Home and no-gym athletes.',ar:'للتدريب المنزلي ودون صالة.'},curriculum:[{title:{en:'Foundation',ar:'التأسيس'},lessons:{en:['Core control','Push, pull and squat patterns','Mobility'],ar:['التحكم بالجذع','أنماط الدفع والسحب والقرفصاء','الحركة']}},{title:{en:'Progressive Strength',ar:'القوة المتدرجة'},lessons:{en:['Tempo work','Single-leg strength','Advanced push-up variations'],ar:['التحكم بالإيقاع','قوة الرجل الواحدة','تنويعات ضغط متقدمة']}},{title:{en:'Athletic Conditioning',ar:'اللياقة الرياضية'},lessons:{en:['Intervals','Low-impact plyometrics','Work-capacity circuits'],ar:['فترات عالية الكثافة','بليومتريكس منخفض التأثير','دوائر تحمل العمل']}}],includedResources:{en:['Progressions','Substitutions','Recovery'],ar:['تدرج','بدائل','استشفاء']},deliveryType:{en:'Digital plan',ar:'خطة رقمية'},coach:null,related:['ot13']},
  {id:'ot13',slug:'full-body-strength',available:true,category:'strength',title:{en:'LHA Build',ar:'برنامج LHA Build'},description:{en:'A full-body gym program with structured strength, muscle-building and athletic-power phases. Choose one, three or six months and follow clear loading targets, progression rules and recovery guidance.',ar:'برنامج صالة متكامل للجسم بالكامل بمراحل منظمة للقوة وبناء العضلات والقوة الرياضية. اختر شهراً أو ثلاثة أو ستة أشهر واتبع أهداف تحميل وقواعد تقدم وإرشادات استشفاء واضحة.'},coverImage:'/images/categories/clothing-hero-player.jpeg',price:20,purchaseOptions:[{id:'one-month',label:{en:'1 Month',ar:'شهر واحد'},duration:{en:'1 month',ar:'شهر واحد'},price:20},{id:'three-months',label:{en:'3 Months',ar:'3 أشهر'},duration:{en:'3 months',ar:'3 أشهر'},price:50,compareAt:60,savings:{en:'Save $10',ar:'وفر 10$'}},{id:'six-months',label:{en:'6 Months',ar:'6 أشهر'},duration:{en:'6 months',ar:'6 أشهر'},price:100,compareAt:120,savings:{en:'Save $20',ar:'وفر 20$'}}],level:{en:'Intermediate',ar:'متوسط'},recommendedAge:{en:'Ages 15+',ar:'الأعمار 15+'},duration:{en:'3–6 months · 4–5 days/week',ar:'3–6 أشهر · 4–5 أيام أسبوعياً'},sessions:108,equipment:{en:['Full gym'],ar:['صالة متكاملة']},outcomes:{en:['Total-body strength','Lean muscle','Durability'],ar:['قوة الجسم','الكتلة العضلية','التحمل']},forWho:{en:'Athletes building long-term strength.',ar:'للرياضيين الباحثين عن قوة طويلة المدى.'},curriculum:[{title:{en:'Strength Foundation',ar:'أساس القوة'},lessons:{en:['Squat, hinge, push and pull','Technique standards','Progressive overload'],ar:['القرفصاء والسحب والدفع والمفصل','معايير التقنية','التحميل التدريجي']}},{title:{en:'Muscle & Durability',ar:'العضلات والتحمل'},lessons:{en:['Hypertrophy blocks','Unilateral strength','Core and tissue capacity'],ar:['مراحل تضخم عضلي','قوة أحادية الجانب','قدرة الجذع والأنسجة']}},{title:{en:'Athletic Power',ar:'القوة الرياضية'},lessons:{en:['Explosive lifts','Contrast training','Speed-strength'],ar:['رفعات انفجارية','تدريب متباين','قوة السرعة']}}],includedResources:{en:['3-month track','6-month progression'],ar:['مسار 3 أشهر','تدرج 6 أشهر']},deliveryType:{en:'Digital plan',ar:'خطة رقمية'},coach:null,related:['ot12','ot14']},
  {id:'ot14',slug:'full-week-legs',available:true,category:'strength',title:{en:'LHA Leg Drive',ar:'برنامج LHA Leg Drive'},description:{en:'An eight-week lower-body specialization plan built around three weekly sessions. Develop stronger legs, better balance, more power and improved durability through progressive strength and athletic movement work.',ar:'خطة تخصصية للجزء السفلي لمدة ثمانية أسابيع مبنية على ثلاث حصص أسبوعياً. تطور قوة الأرجل والتوازن والانفجار والتحمل عبر قوة متدرجة وحركات رياضية.'},coverImage:'/images/categories/compression.jpg',price:55,level:{en:'Intermediate',ar:'متوسط'},recommendedAge:{en:'Ages 15+',ar:'الأعمار 15+'},duration:{en:'8 weeks · 3 days/week',ar:'8 أسابيع · 3 أيام أسبوعياً'},sessions:24,equipment:{en:['Weight room'],ar:['صالة أوزان']},outcomes:{en:['Leg strength','Power','Balance'],ar:['قوة الأرجل','الانفجار','التوازن']},forWho:{en:'Athletes prioritizing lower-body development.',ar:'للرياضيين الذين يركزون على الجزء السفلي.'},curriculum:[{title:{en:'Day 1 · Strength',ar:'اليوم 1 · القوة'},lessons:{en:['Squat pattern','Posterior-chain strength','Core stability'],ar:['نمط القرفصاء','قوة السلسلة الخلفية','ثبات الجذع']}},{title:{en:'Day 2 · Unilateral Control',ar:'اليوم 2 · التحكم الأحادي'},lessons:{en:['Single-leg strength','Balance','Knee and ankle control'],ar:['قوة الرجل الواحدة','التوازن','التحكم بالركبة والكاحل']}},{title:{en:'Day 3 · Power',ar:'اليوم 3 · الانفجار'},lessons:{en:['Jump progressions','Fast force production','Athletic conditioning'],ar:['تدرجات القفز','إنتاج القوة السريع','اللياقة الرياضية']}}],includedResources:{en:['Three-day split','Progressive loading'],ar:['تقسيم 3 أيام','تحميل متدرج']},deliveryType:{en:'Digital plan',ar:'خطة رقمية'},coach:null,related:['ot13']},

  {
    id: 'ot01',
    slug: 'complete-ball-handling',
    available: true,
    featured: true,
    category: 'ball-handling',
    title: { en: 'LHA Handle', ar: 'برنامج LHA Handle' },
    description:{en:'Four-week ball-handling system with daily control, weak-hand, change-of-pace and game-combination work. Sessions progress from stationary mastery to live movement and pressure-ready reads.',ar:'نظام تحكم بالكرة لمدة أربعة أسابيع يشمل التحكم اليومي واليد الضعيفة وتغيير الإيقاع والتركيبات المستخدمة في المباريات، ويتدرج من الإتقان الثابت إلى الحركة والقراءة تحت الضغط.'},
    coverImage: '/images/training/ball-handling.jpg',
    trailerUrl: '',
    price:20,
    compareAt: 59,
    level: { en: 'All levels', ar: 'جميع المستويات' },
    recommendedAge: { en: 'Ages 12+', ar: 'الأعمار 12+' },
    duration:{en:'4 weeks',ar:'4 أسابيع'},
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
    title: { en: 'LHA Pure Shot', ar: 'برنامج LHA Pure Shot' },
    description:{en:'Four-week shooting system focused on balance, alignment, release consistency, footwork, range and game-speed repetition. Includes clear daily shot targets and progress checks.',ar:'نظام تسديد لمدة أربعة أسابيع يركز على التوازن والمحاذاة وثبات الإطلاق وحركة القدمين والمدى والتكرار بسرعة المباراة، مع أهداف يومية واضحة ومتابعة للتقدم.'},
    coverImage: '/images/training/shooting.jpg',
    trailerUrl: '',
    price:25,
    compareAt: 65,
    level: { en: 'All levels', ar: 'جميع المستويات' },
    recommendedAge: { en: 'Ages 12+', ar: 'الأعمار 12+' },
    duration:{en:'4 weeks',ar:'4 أسابيع'},
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
    title: { en: 'LHA Finish', ar: 'برنامج LHA Finish' },
    description:{en:'Four-week finishing package covering both-hand touch, footwork, angles, contact balance, floaters and finishing decisions around the rim.',ar:'برنامج إنهاء لمدة أربعة أسابيع يغطي اللمسة بكلتا اليدين وحركة القدمين والزوايا والتوازن مع الاحتكاك والفلوتر واتخاذ القرار حول السلة.'},
    coverImage: '/images/training/finishing.jpg',
    trailerUrl: '',
    price:20,
    level: { en: 'Intermediate', ar: 'متوسط' },
    recommendedAge: { en: 'Ages 13+', ar: 'الأعمار 13+' },
    duration:{en:'4 weeks',ar:'4 أسابيع'},
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
    title: { en: 'LHA Footwork', ar: 'برنامج LHA Footwork' },
    description:{en:'Four-week footwork program for pivots, jab steps, stops, starts, separation and efficient movement before the dribble, during attacks and into shots.',ar:'برنامج حركة قدمين لمدة أربعة أسابيع للارتكاز والخطوات الخادعة والتوقف والانطلاق وصناعة المساحة والحركة الفعالة قبل المحاورة وأثناء الاختراق والتسديد.'},
    coverImage: '/images/training/footwork.jpg',
    trailerUrl: '',
    price:20,
    level: { en: 'All levels', ar: 'جميع المستويات' },
    recommendedAge: { en: 'Ages 12+', ar: 'الأعمار 12+' },
    duration:{en:'4 weeks',ar:'4 أسابيع'},
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
    title: { en: 'LHA Vision', ar: 'برنامج LHA Vision' },
    description:{en:'Basketball IQ development through spacing, reads, pick-and-roll decisions, transition recognition, defensive positioning and film-study habits.',ar:'تطوير ذكاء كرة السلة عبر التمركز والقراءة وقرارات البيك آند رول والتحول والتمركز الدفاعي وعادات دراسة الفيديو.'},
    coverImage: '/images/training/basketball-iq.jpg',
    trailerUrl: '',
    price:30,
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
    available: false,
    featured: true,
    category: 'strength-conditioning',
    title: { en: 'LHA Engine', ar: 'برنامج LHA Engine' },
    description:{en:'A complete strength and conditioning system is being prepared with progressive strength, speed, power, mobility and recovery blocks.',ar:'يجري إعداد نظام متكامل للقوة واللياقة يشمل مراحل متدرجة للقوة والسرعة والانفجار والحركة والاستشفاء.'},
    coverImage: '/images/training/strength.jpg',
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
