export const BRAND = {
  name: 'Libya Hoops Academy',
  shortName: 'LHA',
  slogan: 'OWN THE GAME.',
  assets: {
    horizontal: {
      black: '/brand/lha-wordmark-black.svg',
      white: '/brand/lha-wordmark-white.svg',
    },
    mark: { black: '/brand/lha-mark-black.png', white: '/brand/lha-mark-white.png' },
    official: '/images/brand/lha-official.png',
    favicon: '/favicon.svg',
    social: '/images/brand/og-image.png',
  },
  minimum: { mark: 28, horizontal: 120 },
  safeArea: '12.5% of mark width',
};
export function brandAsset(variant = 'mark', mode = 'black') {
  return BRAND.assets[variant]?.[mode] || BRAND.assets.mark[mode] || BRAND.assets.official;
}
