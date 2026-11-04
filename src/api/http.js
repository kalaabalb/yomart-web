import { apiOrigin } from '../config/runtime.js';
import { createJsonRequester } from './request.js';
export { productId, priceLabel } from './contract.js';
import { catalogImageUrl, unwrapList } from './contract.js';

export { ApiError } from './request.js';
export const requestJson = createJsonRequester(apiOrigin);

export function imageUrl(value) {
  return catalogImageUrl(value, apiOrigin);
}

export { unwrapList };
