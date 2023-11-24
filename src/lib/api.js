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
  console.log('searchProducts: category:', category);
  const url = new URL('products', API_URL);
  url.searchParams.set('search', query);
  url.searchParams.set('mode', 'list');
  // url.searchParams.set('limit', 12);
  // url.searchParams.set('offset', 0);
  url.searchParams.set('category', category);
  console.log('searchProducts: category:', category);

  let response;
  try {
    response = await fetch(url);
    console.log('searchProducts: response úr fetch:', response);
  } catch (e) {
    console.error('Villa kom upp við að sækja gögn');
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
    console.log('json er:', json);
  } catch (e) {
    console.error('Villa við að vinna úr JSON');
    return null;
  }

  console.log('json.items:', json.items);
  return json.items;
}

/**
 * Skilar stakri vöru eftir auðkenni eða `null` ef ekkert fannst.
 * @param {string} id Auðkenni vöru.
 * @returns {Promise<LaunchDetail | null>} Vara.
 */
export async function getProducts(id) {
  //console.log('id:', id);
  const url = new URL(`products/${id}`, API_URL);
  //console.log('url:', url);
  const result = await queryApi(url);
  //console.log('result:', result);

  if (!result) {
    return null;
  }

  return {
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
  const url = new URL(`products?limit=6`, API_URL);
  url.searchParams.set('mode', 'list');
  //console.log('url:', url);
  const result = await queryApi(url);
  //console.log('getProductFrontPage: result:', result);

  const items = result.items;
  //console.log('result.items:', result.items);

  if (!result) {
    return null;
  }

  return {
    items
  };
}

/**
 * Skilar vörum fyrir frontpage eða `null` ef ekkert fannst.
 * @returns {Promise<LaunchDetail | null>} Vara.
 */
export async function getCategories() {
  const url = new URL(`categories?limit=12`, API_URL);
  url.searchParams.set('mode', 'list');
  console.log('url:', url);
  const result = await queryApi(url);
  console.log('getProductFrontPage: result:', result);

  const categories = result.items;
  console.log('result.categories:', categories);

  if (!result) {
    return null;
  }

  return {
    categories
  };
}

/**
 * Skilar vörum fyrir frontpage eða `null` ef ekkert fannst.
 * @returns {Promise<LaunchDetail | null>} Vara.
 */
export async function getProductsByCategory(category_id, limit) {
  const url = new URL(`products?limit=${limit}&category=${category_id}`, API_URL);
  url.searchParams.set('mode', 'list');
  console.log('getProductsByCategory: url:', url);
  const result = await queryApi(url);
  console.log('getProductsByCategory: result:', result);

  const items = result.items;
  console.log('getProductsByCategory: result.items:', result.items);

  if (!result) {
    return null;
  }

  return {
    items
  };
}

/**
 * Skilar vörum fyrir frontpage eða `null` ef ekkert fannst.
 * @returns {Promise<LaunchDetail | null>} Vara.
 */
export async function getCategoryNameById(category_id) {
  const url = new URL(`categories/${category_id}`, API_URL);
  //console.log('getCategoryNameById: url:', url);
  const result = await queryApi(url);
  //console.log('getCategoryNameById: result:', result);
  const name = result.title;
  //console.log('getCategoryNameById: result.title:', result.title);
  if (!result) {
    return null;
  }
  return {
    name
  };
}