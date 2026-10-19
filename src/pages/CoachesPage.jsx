import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Seo from '../components/common/Seo';
import PageHero from '../components/common/PageHero';
import Breadcrumbs from '../components/common/Breadcrumbs';
import CoachCard from '../components/coaches/CoachCard';
import { availableCoaches } from '../data/coaches';

const development = [
  {
    image: '/images/programs/elite-development.webp',
    en: 'Build the fundamentals',
    ar: 'أساس قوي للعبتك',
    bodyEn: 'From footwork and ball skills to smarter decisions in live play.',
    bodyAr: 'من حركة القدمين والتحكم بالكرة إلى اتخاذ قرارات أفضل أثناء اللعب.',
  },
  {
    image: '/images/programs/guard-development.webp',
    en: 'Train with purpose',
    ar: 'تدرّب بهدف واضح',
    bodyEn: 'Structured on-court programs around real basketball skills.',
    bodyAr: 'برامج تدريب في الملعب تركز على مهارات كرة السلة الأساسية.',
  },
  {
    image: '/images/programs/youth-development.webp',
    en: 'Keep progressing',
    ar: 'كمّل تطورك',
    bodyEn: 'Choose a program that fits your development needs and goals.',
    bodyAr: 'اختار البرنامج اللي يناسب احتياجاتك وأهدافك في التطور.',
  },
];

export default function CoachesPage() {
  const { t, pick } = useLanguage();
  const coaches = availableCoaches();
  return (
    <>
      <Seo title={t.coaches.title} description={t.coaches.sub} path="/coaches" />
      <PageHero label={t.coaches.label} title={t.coaches.title} description={t.coaches.sub} />
      <div className="container">
        <Breadcrumbs items={[{ label: t.coaches.title }]} />
      </div>
      {coaches.length > 0 ? (
        <section className="section" aria-labelledby="academy-staff-heading">
          <div className="container">
            <p className="section-label">
              {pick({ en: 'PEOPLE BEHIND THE WORK', ar: 'المدربون وراء كل تطور' })}
            </p>
            <h2 id="academy-staff-heading" className="section-title">
              {pick({ en: 'MEET THE TEAM.', ar: 'تعرّف على الفريق.' })}
            </h2>
            <div className="card-grid card-grid--4">
              {coaches.map((coach) => (
                <CoachCard key={coach.slug} coach={coach} />
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="section academy-editorial" aria-labelledby="coaching-approach-title">
          <div className="container">
            <div className="academy-editorial-heading">
              <div>
                <p className="section-label">
                  {pick({ en: 'OUR TRAINING APPROACH', ar: 'أسلوب التدريب' })}
                </p>
                <h2 id="coaching-approach-title" className="section-title">
                  {pick({ en: 'THE WORK COMES FIRST.', ar: 'الشغل هو الأساس.' })}
                </h2>
              </div>
              <p>
                {pick({
                  en: 'Our coaching roster is being verified before we publish individual names or biographies. Explore what the programs focus on in the meantime.',
                  ar: 'نراجع قائمة المدربين قبل نشر أي اسم أو سيرة شخصية. إلى ذلك الوقت، تقدر تتعرف على أهداف البرامج وطريقة التدريب.',
                })}
              </p>
            </div>
            <div className="academy-editorial-grid">
              {development.map((item, index) => (
                <article className="academy-editorial-card" key={item.en}>
                  <div className="academy-editorial-card-image">
                    <img
                      src={item.image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      width="1312"
                      height="816"
                    />
                  </div>
                  <div className="academy-editorial-card-body">
                    <span>0{index + 1}</span>
                    <h3>{pick({ en: item.en, ar: item.ar })}</h3>
                    <p>{pick({ en: item.bodyEn, ar: item.bodyAr })}</p>
                  </div>
                </article>
              ))}
            </div>
            <div className="academy-editorial-actions">
              <Link className="btn-primary" to="/programs">
                {pick({ en: 'Explore Programs', ar: 'اكتشف البرامج' })}
              </Link>
              <Link className="btn-secondary" to="/contact">
                {pick({ en: 'Ask About Coaching', ar: 'اسأل عن التدريب' })}
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
