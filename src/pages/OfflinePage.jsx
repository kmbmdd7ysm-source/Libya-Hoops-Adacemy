import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
export default function OfflinePage() {
  const { pick } = useLanguage();
  return (
    <section className="offline-page">
      <img src="/brand/lha-mark-white.png" alt="LHA" />
      <h1>{pick({ en: 'You are offline', ar: 'أنت غير متصل' })}</h1>
      <p>
        {pick({
          en: 'Previously visited pages may still be available. Live actions require internet access.',
          ar: 'قد تظل الصفحات التي زرتها متاحة. الإجراءات المباشرة تحتاج إلى اتصال بالإنترنت.',
        })}
      </p>
      <Link to="/" className="btn-primary">
        {pick({ en: 'Return home', ar: 'العودة للرئيسية' })}
      </Link>
    </section>
  );
}
