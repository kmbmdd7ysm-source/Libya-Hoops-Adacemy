export function getPurchasableVariants(product) {
  return (product?.variants || []).filter((variant) => Number(variant.stock) > 0);
}

export function getCompareAction(product) {
  const available = getPurchasableVariants(product);
  if (!available.length) return { type: 'unavailable', variant: null };

  const sizes = new Set(available.map((variant) => variant.size).filter(Boolean));
  const colors = new Set(available.map((variant) => variant.color).filter(Boolean));
  const requiresChoice = sizes.size > 1 || colors.size > 1;

  return requiresChoice
    ? { type: 'choose-options', variant: null }
    : { type: 'add', variant: available[0] };
}
