import Icon from '../icons/Icon';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import SmartImage from '../common/SmartImage';

export default function CategoryCard({ to, name, image, eager = false }) {
  const { pick } = useLanguage();
  return (
    <Link to={to} className="category-card">
      <div className="category-card-media">
        <SmartImage src={image} alt={pick(name)} className="category-card-img" eager={eager} />
      </div>
      <span className="category-card-name">
        {pick(name)} <Icon name="arrow" size={18} />
      </span>
    </Link>
  );
}
