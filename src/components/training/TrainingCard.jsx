import Icon from '../icons/Icon';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import SmartImage from '../common/SmartImage';
import Price from '../common/Price';
import Badge from '../common/Badge';

export default function TrainingCard({ program, eager = false }) {
  const { t, pick } = useLanguage();
  const to = `/online-training/${program.slug}`;
  return (
    <article className="training-card">
      <Link to={to} className="training-card-media" aria-label={pick(program.title)}>
        <SmartImage
          src={program.coverImage}
          alt={pick(program.title)}
          width={1312}
          height={816}
          sizes="(min-width: 960px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="training-card-img"
          eager={eager}
        />
        <span className="training-card-play" aria-hidden="true">
          <Icon name="play" size={20} />
        </span>
        <div className="training-card-badges">
          {!program.available && <Badge tone="limited">{t.training.comingSoon}</Badge>}
        </div>
      </Link>
      <div className="training-card-body">
        <h3 className="training-card-title">
          <Link to={to}>{pick(program.title)}</Link>
        </h3>
        <ul className="training-card-meta">
          <li>{pick(program.level)}</li>
          <li>{pick(program.duration)}</li>
          <li>
            {program.sessions} {t.training.sessions}
          </li>
        </ul>
        <div className="training-card-foot">
          {program.available === false ? (
            <span className="status-pill">{t.training.comingSoon}</span>
          ) : (
            <Price amount={program.price} compareAt={program.compareAt} size="sm" />
          )}
          <Link to={to} className="training-card-link">
            {t.common.viewDetails} <Icon name="arrow" size={18} />
          </Link>
        </div>
      </div>
    </article>
  );
}
