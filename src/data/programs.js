// ============================================================================
// ACADEMY PROGRAMS (in-person)  —  EDITABLE DEMO DATA.
// Set `enabled: false` to hide a program without deleting it.
// Set `price: null` + `inquiryOnly: true` for "contact for pricing".
// `coach` is a coach slug (see coaches.js) or null.
// ============================================================================

export const programs = [
  {
    id: 'pr01',
    slug: 'youth-development',
    enabled: true,
    featured: true,
    name: { en: 'LHA Start', ar: 'برنامج LHA Start' },
    summary: {
      en: 'Foundational basketball for young players — fun, fundamentals and confidence.',
      ar: 'أساسيات كرة السلة للاعبين الصغار — المتعة والمبادئ والثقة.',
    },
    description: {
      en: 'A structured introduction to basketball for younger players. We build core movement skills, ball familiarity, coordination and a love for the game in a positive, disciplined environment.',
      ar: 'مقدمة منظمة لكرة السلة للاعبين الأصغر سناً. نبني مهارات الحركة الأساسية والتعوّد على الكرة والتناسق وحب اللعبة في بيئة إيجابية ومنضبطة.',
    },
    image: '/images/programs/youth-development.jpg',
    ages: { en: 'Ages 6–11', ar: 'الأعمار 6–11' },
    level: { en: 'Beginner', ar: 'مبتدئ' },
    schedule: { en: 'Schedule announced per term', ar: 'يُعلن الجدول كل فصل' },
    location: { en: 'Academy court', ar: 'ملعب الأكاديمية' },
    objectives: {
      en: [
        'Develop coordination & motor skills',
        'Learn basic rules & positions',
        'Build teamwork & discipline',
      ],
      ar: [
        'تطوير التناسق والمهارات الحركية',
        'تعلّم القواعد والمراكز الأساسية',
        'بناء العمل الجماعي والانضباط',
      ],
    },
    skills: {
      en: ['Dribbling basics', 'Passing', 'Layups', 'Defensive stance'],
      ar: ['أساسيات المحاورة', 'التمرير', 'اللياب', 'وضعية الدفاع'],
    },
    included: {
      en: ['Certified youth coaching', 'Small-group ratios', 'Progress feedback'],
      ar: ['تدريب معتمد للناشئين', 'مجموعات صغيرة', 'تقييم للتقدم'],
    },
    coach: null,
    price: null,
    inquiryOnly: true,
    related: ['pr02', 'pr04'],
  },
  {
    id: 'pr02',
    slug: 'player-development',
    enabled: true,
    featured: true,
    name: { en: 'LHA Next', ar: 'برنامج LHA Next' },
    summary: {
      en: 'Skill-focused training to sharpen scoring, handling and decision-making.',
      ar: 'تدريب يركّز على المهارة لتطوير التسجيل والتحكم واتخاذ القرار.',
    },
    description: {
      en: 'For committed players ready to level up. Sessions target advanced ball-handling, scoring versatility, footwork and basketball IQ through progressive, repeatable drills.',
      ar: 'للاعبين الملتزمين المستعدين للتطور. تستهدف الجلسات التحكم المتقدم بالكرة وتنوع التسجيل وحركة القدمين وذكاء اللعبة عبر تمارين متدرجة.',
    },
    image: '/images/programs/player-development.jpg',
    ages: { en: 'Ages 12–17', ar: 'الأعمار 12–17' },
    level: { en: 'Intermediate', ar: 'متوسط' },
    schedule: { en: 'Schedule announced per term', ar: 'يُعلن الجدول كل فصل' },
    location: { en: 'Academy court', ar: 'ملعب الأكاديمية' },
    objectives: {
      en: ['Expand scoring range', 'Improve handling under pressure', 'Sharpen court awareness'],
      ar: ['توسيع مدى التسجيل', 'تحسين التحكم تحت الضغط', 'زيادة الوعي بالملعب'],
    },
    skills: {
      en: ['Advanced dribbling', 'Finishing', 'Shooting mechanics', 'Reads & spacing'],
      ar: ['محاورة متقدمة', 'الإنهاء', 'ميكانيكا التسديد', 'القراءة والتموضع'],
    },
    included: {
      en: ['Skill assessments', 'Video feedback', 'Individual development notes'],
      ar: ['تقييمات المهارة', 'ملاحظات بالفيديو', 'ملاحظات تطوير فردية'],
    },
    coach: null,
    price: null,
    inquiryOnly: true,
    related: ['pr03', 'pr08'],
  },
  {
    id: 'pr03',
    slug: 'elite-player-development',
    enabled: true,
    featured: true,
    name: { en: 'LHA Apex', ar: 'برنامج LHA Apex' },
    summary: {
      en: 'High-performance training for players chasing the next level.',
      ar: 'تدريب عالي الأداء للاعبين الطامحين للمستوى الأعلى.',
    },
    description: {
      en: 'Our most demanding pathway. Combines position-specific skill work, athletic performance and competitive scenarios for players targeting elite, collegiate or professional opportunities.',
      ar: 'أكثر مساراتنا تطلباً. يجمع بين المهارات الخاصة بالمركز والأداء البدني والسيناريوهات التنافسية للاعبين الطامحين لفرص النخبة أو الجامعات أو الاحتراف.',
    },
    image: '/images/programs/elite-development.jpg',
    ages: { en: 'Ages 15+', ar: 'الأعمار 15+' },
    level: { en: 'Advanced', ar: 'متقدم' },
    schedule: { en: 'By selection & assessment', ar: 'بالاختيار والتقييم' },
    location: { en: 'Academy court & performance area', ar: 'ملعب الأكاديمية ومنطقة الأداء' },
    objectives: {
      en: ['Position-specific mastery', 'Athletic performance gains', 'Compete at higher tempo'],
      ar: ['إتقان خاص بالمركز', 'تحسين الأداء البدني', 'المنافسة بإيقاع أعلى'],
    },
    skills: {
      en: ['Position skills', 'Strength & power', 'Live reads', 'Game situations'],
      ar: ['مهارات المركز', 'القوة والانفجار', 'القراءة الحية', 'مواقف المباراة'],
    },
    included: {
      en: ['Individual plan', 'Performance tracking', 'Competitive reps'],
      ar: ['خطة فردية', 'متابعة الأداء', 'تكرارات تنافسية'],
    },
    coach: null,
    price: null,
    inquiryOnly: true,
    related: ['pr02', 'pr11'],
  },
  {
    id: 'pr04',
    slug: 'private-training',
    enabled: true,
    name: { en: 'LHA 1:1', ar: 'تدريب LHA 1:1' },
    summary: {
      en: 'One-on-one coaching fully tailored to your game.',
      ar: 'تدريب فردي مخصص بالكامل للعبتك.',
    },
    description: {
      en: 'Focused private sessions built entirely around your goals — whether that is your jumper, your handle or your confidence. Maximum attention, fastest progress.',
      ar: 'جلسات خاصة مركزة مبنية بالكامل حول أهدافك — سواء التسديد أو التحكم أو الثقة. أقصى اهتمام وأسرع تقدم.',
    },
    image: '/images/programs/private-training.jpg',
    ages: { en: 'All ages', ar: 'جميع الأعمار' },
    level: { en: 'All levels', ar: 'جميع المستويات' },
    schedule: { en: 'Flexible booking', ar: 'حجز مرن' },
    location: { en: 'Academy court', ar: 'ملعب الأكاديمية' },
    objectives: {
      en: ['Target specific weaknesses', 'Accelerate individual growth'],
      ar: ['استهداف نقاط ضعف محددة', 'تسريع التطور الفردي'],
    },
    skills: {
      en: ['Fully customised', 'Skill of your choice'],
      ar: ['مخصص بالكامل', 'المهارة التي تختارها'],
    },
    included: { en: ['1-on-1 coaching', 'Personalised plan'], ar: ['تدريب فردي', 'خطة شخصية'] },
    coach: null,
    price: null,
    inquiryOnly: true,
    related: ['pr05', 'pr02'],
  },
  {
    id: 'pr05',
    slug: 'small-group-training',
    enabled: true,
    name: { en: 'LHA Unit', ar: 'تدريب مجموعات LHA Unit' },
    summary: {
      en: 'Train with 2–4 players — competitive reps, shared intensity.',
      ar: 'تدرّب مع 2–4 لاعبين — تكرارات تنافسية وحماس مشترك.',
    },
    description: {
      en: 'The energy of a group with the attention of a small ratio. Great for friends, teammates or players who thrive on competition.',
      ar: 'طاقة المجموعة مع اهتمام النسبة الصغيرة. مثالي للأصدقاء أو الزملاء أو من يزدهرون بالمنافسة.',
    },
    image: '/images/programs/small-group.jpg',
    ages: { en: 'All ages', ar: 'جميع الأعمار' },
    level: { en: 'All levels', ar: 'جميع المستويات' },
    schedule: { en: 'Flexible booking', ar: 'حجز مرن' },
    location: { en: 'Academy court', ar: 'ملعب الأكاديمية' },
    objectives: {
      en: ['Competitive skill reps', 'Shared accountability'],
      ar: ['تكرارات تنافسية', 'مسؤولية مشتركة'],
    },
    skills: {
      en: ['Skill circuits', 'Competitive drills'],
      ar: ['دوائر مهارية', 'تمارين تنافسية'],
    },
    included: { en: ['Small ratio', 'Structured plan'], ar: ['نسبة صغيرة', 'خطة منظمة'] },
    coach: null,
    price: null,
    inquiryOnly: true,
    related: ['pr04', 'pr06'],
  },
  {
    id: 'pr06',
    slug: 'team-training',
    enabled: true,
    name: { en: 'LHA Team', ar: 'تدريب الفرق LHA Team' },
    summary: {
      en: 'Full-team sessions for schools, clubs and organised squads.',
      ar: 'جلسات للفريق الكامل للمدارس والأندية والفرق المنظمة.',
    },
    description: {
      en: 'Structured team practices covering offensive and defensive concepts, conditioning and team culture — designed to raise the whole roster.',
      ar: 'تدريبات جماعية منظمة تغطي المفاهيم الهجومية والدفاعية واللياقة وثقافة الفريق — لرفع مستوى القائمة بأكملها.',
    },
    image: '/images/programs/team-training.jpg',
    ages: { en: 'Team-based', ar: 'حسب الفريق' },
    level: { en: 'All levels', ar: 'جميع المستويات' },
    schedule: { en: 'Arranged with your club', ar: 'يُنسّق مع ناديك' },
    location: { en: 'Academy or your venue', ar: 'الأكاديمية أو ملعبكم' },
    objectives: {
      en: ['Team concepts', 'Cohesion & culture'],
      ar: ['مفاهيم الفريق', 'الانسجام والثقافة'],
    },
    skills: {
      en: ['Offense/defense systems', 'Conditioning'],
      ar: ['أنظمة الهجوم والدفاع', 'اللياقة'],
    },
    included: { en: ['Team plan', 'Coach coordination'], ar: ['خطة الفريق', 'تنسيق مع المدرب'] },
    coach: null,
    price: null,
    inquiryOnly: true,
    related: ['pr05'],
  },
  {
    id: 'pr07',
    slug: 'shooting-lab',
    enabled: true,
    name: { en: 'LHA Shot Lab', ar: 'مختبر LHA Shot Lab' },
    summary: {
      en: 'Rebuild your jumper — mechanics, range and repeatability.',
      ar: 'أعد بناء تسديدتك — الميكانيكا والمدى والثبات.',
    },
    description: {
      en: 'A dedicated shooting program focused on clean mechanics, consistent release and extending range through high-rep, feedback-driven work.',
      ar: 'برنامج تسديد مخصص يركّز على الميكانيكا النظيفة وثبات الإطلاق وتوسيع المدى عبر تكرارات عالية قائمة على الملاحظة.',
    },
    image: '/images/programs/shooting-lab.jpg',
    ages: { en: 'Ages 12+', ar: 'الأعمار 12+' },
    level: { en: 'All levels', ar: 'جميع المستويات' },
    schedule: { en: 'Scheduled blocks', ar: 'فترات مجدولة' },
    location: { en: 'Academy court', ar: 'ملعب الأكاديمية' },
    objectives: {
      en: ['Cleaner mechanics', 'Extend range', 'Raise consistency'],
      ar: ['ميكانيكا أنظف', 'توسيع المدى', 'رفع الثبات'],
    },
    skills: {
      en: ['Form shooting', 'Off-the-dribble', 'Catch-and-shoot'],
      ar: ['تسديد الشكل', 'من المحاورة', 'الاستلام والتسديد'],
    },
    included: {
      en: ['Shot tracking', 'Mechanics feedback'],
      ar: ['تتبع التسديد', 'ملاحظات الميكانيكا'],
    },
    coach: null,
    price: null,
    inquiryOnly: true,
    related: ['pr08', 'pr02'],
  },
  {
    id: 'pr08',
    slug: 'guard-development',
    enabled: true,
    name: { en: 'LHA Guard Lab', ar: 'برنامج LHA Guard Lab' },
    summary: {
      en: 'Handle, create and lead — training built for guards.',
      ar: 'التحكم والصناعة والقيادة — تدريب مصمم للصنّاع.',
    },
    description: {
      en: 'Position-specific development for guards: elite ball-handling, pick-and-roll reads, creating separation and running a team.',
      ar: 'تطوير خاص بالمركز للصنّاع: تحكم متقدم بالكرة وقراءة الحجب والدوران وخلق المساحة وقيادة الفريق.',
    },
    image: '/images/programs/guard-development.jpg',
    ages: { en: 'Ages 13+', ar: 'الأعمار 13+' },
    level: { en: 'Intermediate+', ar: 'متوسط فأعلى' },
    schedule: { en: 'Scheduled blocks', ar: 'فترات مجدولة' },
    location: { en: 'Academy court', ar: 'ملعب الأكاديمية' },
    objectives: {
      en: ['Elite handle', 'PnR mastery', 'Playmaking'],
      ar: ['تحكم متقدم', 'إتقان الحجب والدوران', 'صناعة اللعب'],
    },
    skills: {
      en: ['Ball-handling', 'Creating space', 'Reads & passing'],
      ar: ['التحكم بالكرة', 'خلق المساحة', 'القراءة والتمرير'],
    },
    included: { en: ['Guard drills', 'Decision training'], ar: ['تمارين الصنّاع', 'تدريب القرار'] },
    coach: null,
    price: null,
    inquiryOnly: true,
    related: ['pr07', 'pr02'],
  },
  {
    id: 'pr09',
    slug: 'big-man-development',
    enabled: true,
    name: { en: 'LHA Post Lab', ar: 'برنامج LHA Post Lab' },
    summary: {
      en: 'Footwork, finishing and rim protection for forwards and centers.',
      ar: 'حركة القدمين والإنهاء وحماية السلة للأجنحة والارتكاز.',
    },
    description: {
      en: 'Interior-focused training: post footwork, finishing through contact, screening, rebounding and rim protection for modern bigs.',
      ar: 'تدريب داخلي: حركة قدمين في المنطقة والإنهاء عبر الاحتكاك والحجب والمتابعات وحماية السلة للاعبي الارتكاز المعاصرين.',
    },
    image: '/images/programs/big-man.jpg',
    ages: { en: 'Ages 13+', ar: 'الأعمار 13+' },
    level: { en: 'Intermediate+', ar: 'متوسط فأعلى' },
    schedule: { en: 'Scheduled blocks', ar: 'فترات مجدولة' },
    location: { en: 'Academy court', ar: 'ملعب الأكاديمية' },
    objectives: {
      en: ['Post footwork', 'Finish through contact', 'Protect the rim'],
      ar: ['حركة القدمين', 'الإنهاء عبر الاحتكاك', 'حماية السلة'],
    },
    skills: {
      en: ['Post moves', 'Rebounding', 'Screening', 'Rim protection'],
      ar: ['حركات المنطقة', 'المتابعات', 'الحجب', 'حماية السلة'],
    },
    included: {
      en: ['Interior drills', 'Contact finishing'],
      ar: ['تمارين داخلية', 'إنهاء بالاحتكاك'],
    },
    coach: null,
    price: null,
    inquiryOnly: true,
    related: ['pr03'],
  },
  {
    id: 'pr10',
    slug: 'athletic-performance',
    enabled: true,
    name: { en: 'LHA Athlete', ar: 'برنامج LHA Athlete' },
    summary: {
      en: 'Speed, strength and vertical for explosive on-court movement.',
      ar: 'السرعة والقوة والقفز لحركة انفجارية في الملعب.',
    },
    description: {
      en: 'Basketball-specific strength and conditioning: acceleration, deceleration, jumping, agility and injury-resilience for athletes of all levels.',
      ar: 'قوة ولياقة خاصة بكرة السلة: التسارع والتباطؤ والقفز والرشاقة ومقاومة الإصابات لجميع المستويات.',
    },
    image: '/images/programs/athletic-performance.jpg',
    ages: { en: 'Ages 13+', ar: 'الأعمار 13+' },
    level: { en: 'All levels', ar: 'جميع المستويات' },
    schedule: { en: 'Scheduled blocks', ar: 'فترات مجدولة' },
    location: { en: 'Performance area', ar: 'منطقة الأداء' },
    objectives: {
      en: ['Improve speed & power', 'Raise vertical', 'Move more efficiently'],
      ar: ['تحسين السرعة والقوة', 'رفع القفز', 'حركة أكثر كفاءة'],
    },
    skills: {
      en: ['Strength', 'Speed & agility', 'Jump mechanics'],
      ar: ['القوة', 'السرعة والرشاقة', 'ميكانيكا القفز'],
    },
    included: { en: ['Performance plan', 'Movement coaching'], ar: ['خطة أداء', 'تدريب الحركة'] },
    coach: null,
    price: null,
    inquiryOnly: true,
    related: ['pr03'],
  },
  {
    id: 'pr11',
    slug: 'seasonal-academy-membership',
    enabled: true,
    name: { en: 'LHA Season', ar: 'عضوية LHA Season' },
    summary: {
      en: 'Full-term membership with ongoing structured development.',
      ar: 'عضوية لفصل كامل مع تطوير منظم مستمر.',
    },
    description: {
      en: 'Join the academy for a full season of consistent, progressive training. The complete pathway — skill, performance and competition — under one membership.',
      ar: 'انضم للأكاديمية لموسم كامل من التدريب المنتظم والمتدرّج. المسار الكامل — المهارة والأداء والمنافسة — بعضوية واحدة.',
    },
    image: '/images/programs/membership.jpg',
    ages: { en: 'All ages', ar: 'جميع الأعمار' },
    level: { en: 'All levels', ar: 'جميع المستويات' },
    schedule: { en: 'Full term', ar: 'فصل كامل' },
    location: { en: 'Academy court', ar: 'ملعب الأكاديمية' },
    objectives: {
      en: ['Consistent long-term growth', 'Full development pathway'],
      ar: ['نمو طويل الأمد', 'مسار تطوير كامل'],
    },
    skills: {
      en: ['All-round development', 'Regular assessment'],
      ar: ['تطوير شامل', 'تقييم دوري'],
    },
    included: {
      en: ['Priority scheduling', 'Ongoing feedback', 'Member benefits'],
      ar: ['أولوية في الجدولة', 'ملاحظات مستمرة', 'مزايا الأعضاء'],
    },
    coach: null,
    price: null,
    inquiryOnly: true,
    related: ['pr03', 'pr02'],
  },
  {
    id: 'pr12',
    slug: 'camps-and-clinics',
    enabled: true,
    name: { en: 'LHA Camps', ar: 'معسكرات LHA' },
    summary: {
      en: 'Intensive multi-day camps and focused skills clinics.',
      ar: 'معسكرات مكثفة متعددة الأيام وورش مهارية مركزة.',
    },
    description: {
      en: 'High-energy camps and clinics that pack a lot of development into a short window — perfect for holidays and breaks. See the Events page for dated sessions.',
      ar: 'معسكرات وورش عالية الطاقة تضغط الكثير من التطوير في وقت قصير — مثالية للعطلات. راجع صفحة الفعاليات للجلسات المحددة بتواريخ.',
    },
    image: '/images/programs/camps.jpg',
    ages: { en: 'All ages', ar: 'جميع الأعمار' },
    level: { en: 'All levels', ar: 'جميع المستويات' },
    schedule: { en: 'See Events for dates', ar: 'راجع الفعاليات للتواريخ' },
    location: { en: 'Academy court', ar: 'ملعب الأكاديمية' },
    objectives: {
      en: ['Concentrated development', 'Fun & competition'],
      ar: ['تطوير مكثف', 'متعة ومنافسة'],
    },
    skills: { en: ['Multi-skill', 'Competition'], ar: ['متعدد المهارات', 'منافسة'] },
    included: {
      en: ['Multi-day coaching', 'Camp activities'],
      ar: ['تدريب متعدد الأيام', 'أنشطة المعسكر'],
    },
    coach: null,
    price: null,
    inquiryOnly: true,
    related: ['pr01'],
  },
];

export const getProgram = (slug) => programs.find((p) => p.slug === slug && p.enabled);
export const enabledPrograms = () => programs.filter((p) => p.enabled);
export const featuredPrograms = () => programs.filter((p) => p.enabled && p.featured);
export const relatedPrograms = (program, limit = 3) =>
  (program?.related || [])
    .map((s) => programs.find((p) => p.id === s))
    .filter((p) => p && p.enabled)
    .slice(0, limit);
