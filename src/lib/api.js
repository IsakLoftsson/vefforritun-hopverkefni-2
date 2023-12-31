/**
 * API föll.
 * @see https://vef1-2023-h2-api-791d754dda5b.herokuapp.com/
 */

/**
 * Sækjum týpurnar okkar.
 * @typedef {import('./api.types.js').Launch} Launch
 * @typedef {import('./api.types.js').LaunchDetail} LaunchDetail
 * @typedef {import('./api.types.js').LaunchSearchResults} LaunchSearchResults
 */

/** Grunnslóð á API (DEV útgáfa) */
const API_URL = 'https://vef1-2023-h2-api-791d754dda5b.herokuapp.com/';

async function queryApi(url) {
  // await sleep(1000);
  try {
    const result = await fetch(url);

    if (!result.ok) {
      throw new Error('result not ok');
    }

    return await result.json();
  } catch (e) {
    console.warn('unable to query', e);
    return null;
  }
}

/**
 * Skilar Promise sem bíður í gefnar millisekúndur.
 * Gott til að prófa loading state, en einnig hægt að nota `throttle` í 
 * DevTools.
 * @param {number} ms Tími til að sofa í millisekúndum.
 * @returns {Promise<void>}
 */
export async function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(undefined), ms);
  });
}

/**
 * Leita í vöru API eftir leitarstreng.
 * @param {string} query Leitarstrengur.
 * @returns {Promise<Launch[] | null>} Fylki af vörum eða `null` ef villa
 *  kom upp.
 */
export async function searchProducts(query, category) {
  
  const url = new URL('products', API_URL);
  url.searchParams.set('search', query);
  url.searchParams.set('mode', 'list');
  // url.searchParams.set('limit', 12);
  // url.searchParams.set('offset', 0);
  url.searchParams.set('category', category);

  let response;
  try {
    response = await fetch(url);
  } catch (e) {
    return null;
  }

  if (!response.ok) {
    console.error(
      'Villa við að sækja gögn, ekki 200 staða',
      response.status,
      response.statusText
    );
    return null;
  }

  let json;
  try {
    json = await response.json();
  } catch (e) {
    return null;
  }

  return json.items;
}

/**
 * Skilar stakri vöru eftir auðkenni eða `null` ef ekkert fannst.
 * @param {string} id Auðkenni vöru.
 * @returns {Promise<LaunchDetail | null>} Vara.
 */
export async function getProducts(id) {
  const url = new URL(`products/${id}`, API_URL);
  const result = await queryApi(url);

  if (!result) {
    return null;
  }

  return {
    // @ts-ignore
    id: result.key,
    title: result.title ?? '',
    price: result.price ?? '',
    description: result.description ?? '',
    image: result.image ?? '',
    category_id: result.category_id ?? '',
    category_title: result.category_title ?? ''
  };
}

/**
 * Skilar vörum fyrir frontpage eða `null` ef ekkert fannst.
 * @returns {Promise<LaunchDetail | null>} Vara.
 */
export async function getProductsFrontPage() {
  const url = new URL('products?limit=6', API_URL);
  url.searchParams.set('mode', 'list');
  const result = await queryApi(url);

  const {items} = result;
  
  if (!result) {
    return null;
  }

  return {
    // @ts-ignore
    items
  };
}

/**
 * Skilar vörum fyrir frontpage eða `null` ef ekkert fannst.
 * @returns {Promise<LaunchDetail | null>} Vara.
 */
export async function getCategories() {
  const url = new URL('categories?limit=12', API_URL);
  url.searchParams.set('mode', 'list');
  const result = await queryApi(url);

  const categories = result.items;

  if (!result) {
    return null;
  }

  return {
    // @ts-ignore
    categories
  };
}

/**
 * Skilar vörum fyrir frontpage eða `null` ef ekkert fannst.
 * @returns {Promise<LaunchDetail | null>} Vara.
 */
export async function getProductsByCategory(categoryId, limit) {
  const url = new URL(`products?limit=${limit}&category=${categoryId}`, API_URL);
  url.searchParams.set('mode', 'list');
  const result = await queryApi(url);

  const {items} = result;

  if (!result) {
    return null;
  }

  return {
    // @ts-ignore
    items
  };
}

/**
 * Skilar vörum fyrir frontpage eða `null` ef ekkert fannst.
 * @returns {Promise<LaunchDetail | null>} Vara.
 */
export async function getCategoryNameById(categoryId) {
  const url = new URL(`categories/${categoryId}`, API_URL);
  const result = await queryApi(url);
  const name = result.title;
  if (!result) {
    return null;
  }
  // @ts-ignore
  return {
    name
  };
}