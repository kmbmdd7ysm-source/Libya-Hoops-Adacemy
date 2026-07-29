import { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';

const MEDIA_VERSION = '20260729-final';

const withVersion = (src, retry = false) => {
  if (!src || /^(data:|blob:|https?:)/i.test(src)) return src;
  const separator = src.includes('?') ? '&' : '?';
  return `${src}${separator}v=${MEDIA_VERSION}${retry ? '&retry=1' : ''}`;
};

export default function SmartImage({
  src,
  alt,
  width,
  height,
  eager = false,
  className = '',
  sizes,
}) {
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);
  const { pick } = useLanguage();

  useEffect(() => {
    setAttempt(0);
    setFailed(false);
  }, [src]);

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
      key={`${src}-${attempt}`}
      src={withVersion(src, attempt > 0)}
      alt={alt || ''}
      width={width}
      height={height}
      sizes={sizes}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      draggable="false"
      onError={() => {
        if (attempt === 0) setAttempt(1);
        else setFailed(true);
      }}
      className={`smart-img ${className}`.trim()}
    />
  );
}
