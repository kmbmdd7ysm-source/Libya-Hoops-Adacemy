import { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function SmartImage({
  src,
  alt,
  width,
  height,
  eager = false,
  className = '',
  sizes,
}) {
  const [failed, setFailed] = useState(false);
  const { pick } = useLanguage();

  // A card can be reused with a different image after navigation/language changes.
  // Reset the fallback state whenever its source changes.
  useEffect(() => setFailed(false), [src]);

  const unavailable = failed || !src;

  if (unavailable) {
    return (
      <span
        className={`smart-img smart-img--fallback ${className}`.trim()}
        role="img"
        aria-label={alt || pick({ en: 'Image unavailable', ar: 'الصورة غير متوفرة' })}
        style={width || height ? { width, height } : undefined}
      >
        <span className="smart-img-fallback-mark" aria-hidden="true">LHA</span>
        <span className="smart-img-fallback-copy">
          {pick({ en: 'Media coming soon', ar: 'الصورة قريبًا' })}
        </span>
      </span>
    );
  }

  return (
    <img
      key={src}
      src={src}
      alt={alt || ''}
      width={width}
      height={height}
      sizes={sizes}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority="auto"
      decoding="async"
      referrerPolicy="same-origin"
      draggable="false"
      onError={() => setFailed(true)}
      className={`smart-img ${className}`.trim()}
    />
  );
}
