export { MAX_COMPARE, MAX_RECENT, normalizeIds, mergeIdLists, mergeRecent } from './protocol';
import { mergeCart as merge } from './protocol';
export const mergeCart = (local = [], cloud = []) => merge(local, cloud).items;
