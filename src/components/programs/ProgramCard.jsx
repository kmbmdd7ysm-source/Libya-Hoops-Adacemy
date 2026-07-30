import Icon from '../icons/Icon';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import SmartImage from '../common/SmartImage';

export default function ProgramCard({ program, eager = false }) {
  const { t, pick } = useLanguage();
  const to = `/programs/${program.slug}`;
  return (
    <article className="program-card">
      <Link to={to} className="program-card-media" aria-label={pick(program.name)}>
        <SmartImage
          src={program.image}
          alt={pick(program.name)}
          width={1312}
          height={816}
          sizes="(min-width: 960px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="program-card-img"
          eager={eager}
        />
      </Link>
      <div className="program-card-body">
        <h3 className="program-card-title">
          <Link to={to}>{pick(program.name)}</Link>
        </h3>
        <p className="program-card-sub">{pick(program.summary)}</p>
        <ul className="program-card-tags">
          <li>{pick(program.ages)}</li>
          <li>{pick(program.level)}</li>
        </ul>
        <Link to={to} className="program-card-link">
          {t.common.viewProgram} <Icon name="arrow" size={18} />
        </Link>
      </div>
    </article>
  );
}
