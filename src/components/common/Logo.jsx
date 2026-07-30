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
  const src = brandAsset(variant, colorMode);
  const intrinsic = variant === 'horizontal' ? { width: 720, height: 200 } : { width: 415, height: 482 };
  const style = { width: width || size, height: height || 'auto' };
  return (
    <img
      src={src}
      alt={decorative ? '' : label}
      aria-hidden={decorative || undefined}
      className={`brand-logo brand-logo--${variant} ${className}`}
      width={intrinsic.width}
      height={intrinsic.height}
      style={style}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      {...rest}
    />
  );
}
