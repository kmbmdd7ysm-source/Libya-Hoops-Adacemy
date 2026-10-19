import { getCartItemFulfillmentType, FULFILLMENT_TYPES } from './fulfillment';

// The deployed Center Vision public COD endpoint currently accepts physical
// SKU lines only; keep this rule in sync with api/order-notification.js.
export const isPhysicalCodLine = (item) =>
  item?.type === 'product' &&
  getCartItemFulfillmentType(item) === FULFILLMENT_TYPES.PHYSICAL &&
  typeof item?.sku === 'string' &&
  /^[A-Za-z0-9][A-Za-z0-9._:-]{0,79}$/.test(item.sku.trim()) &&
  Number.isInteger(Number(item.quantity)) &&
  Number(item.quantity) >= 1 &&
  Number(item.quantity) <= 99;

export const canSubmitCodCart = (items, countryCode) =>
  String(countryCode).toUpperCase() === 'LY' &&
  Array.isArray(items) &&
  items.length > 0 &&
  items.length <= 25 &&
  items.every(isPhysicalCodLine);

export const requiresNonCodCheckout = (items) =>
  Array.isArray(items) && items.some((item) => !isPhysicalCodLine(item));
