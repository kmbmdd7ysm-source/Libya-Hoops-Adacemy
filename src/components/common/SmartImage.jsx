import { useState } from 'react';
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
  const unavailable = failed || !src;

  if (unavailable) {
    return (
      <span
        className={`smart-img smart-img--fallback ${className}`.trim()}
        role="img"
        aria-label={alt || pick({ en: 'Product image unavailable', ar: 'صورة المنتج غير متوفرة' })}
        style={width || height ? { width, height } : undefined}
      >
        <span className="smart-img-fallback-mark" aria-hidden="true">
          LHA
        </span>
        <span className="smart-img-fallback-copy">
          {pick({ en: 'Media coming soon', ar: 'الصورة قريبًا' })}
        </span>
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt || ''}
      width={width}
      height={height}
      sizes={sizes}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : 'auto'}
      decoding={eager ? 'sync' : 'async'}
      onError={() => setFailed(true)}
      className={`smart-img ${className}`.trim()}
    />
  );
}
