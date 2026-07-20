import Icon from '../icons/Icon';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import SmartImage from '../common/SmartImage';

export default function CoachCard({ coach }) {
  const { t, pick } = useLanguage();
  const to = `/coaches/${coach.slug}`;
  return (
    <article className="coach-card">
      <Link to={to} className="coach-card-media" aria-label={pick(coach.name)}>
        <SmartImage src={coach.image} alt={pick(coach.name)} className="coach-card-img" />
      </Link>
      <div className="coach-card-body">
        <h3 className="coach-card-name">
          <Link to={to}>{pick(coach.name)}</Link>
        </h3>
        <p className="coach-card-role">{pick(coach.role)}</p>
        <Link to={to} className="coach-card-link">
          {t.coaches.viewProfile} <Icon name="arrow" size={18} />
        </Link>
      </div>
    </article>
  );
}
