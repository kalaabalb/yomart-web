import { requestJson, unwrapList } from './http.js';
import { buildProductsPath } from './contract.js';

export async function getProducts({ search = '', category = '', inStock = '' } = {}, options = {}) {
  return unwrapList(await requestJson(buildProductsPath({ search, category, inStock }), options));
}

export async function getProduct(id, options = {}) {
  return requestJson(`/products/${encodeURIComponent(id)}`, options);
}

export async function getCategories(options = {}) {
  return unwrapList(await requestJson('/categories', options));
}

export async function getBrands(options = {}) {
  return unwrapList(await requestJson('/brands', options));
}

export async function getCollections(options = {}) {
  return unwrapList(await requestJson('/collections', options));
}

export async function getPosters(options = {}) {
  return unwrapList(await requestJson('/posters', options));
}

export async function getRetailerContacts(options = {}) {
  return unwrapList(await requestJson('/retailer-contacts', options));
}
