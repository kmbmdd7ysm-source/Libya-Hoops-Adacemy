import { BRAND, brandAsset } from '../../config/brand';
export default function Logo({
  variant = 'mark',
  colorMode = 'black',
  size,
  width,
  height,
  label = BRAND.name,
  decorative = false,
  priority = false,
  className = '',
  ...rest
}) {
  const src = brandAsset(variant, colorMode),
    style = { width: width || size, height: height || 'auto' };
  return (
    <img
      src={src}
      alt={decorative ? '' : label}
      aria-hidden={decorative || undefined}
      className={`brand-logo brand-logo--${variant} ${className}`}
      style={style}
      loading={priority ? 'eager' : 'lazy'}
      fetchpriority={priority ? 'high' : undefined}
      decoding="async"
      {...rest}
    />
  );
}
