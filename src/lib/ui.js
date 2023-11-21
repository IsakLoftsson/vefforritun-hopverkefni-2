import { getProducts, getProductsFrontPage, searchProducts } from './api.js';
import { el } from './elements.js';

/**
 * Býr til leitarform.
 * @param {(e: SubmitEvent) => void} searchHandler Fall sem keyrt er þegar leitað er.
 * @param {string | undefined} query Leitarstrengur.
 * @returns {HTMLElement} Leitarform.
 */
export function renderSearchForm(searchHandler, query = undefined) {
  const form = el('form', {},
    el('label', {}, 'Leita: '),
    el('input', { value: query ?? '', placeholder: 'Leitarorð' }),
    el('button', {}, 'Leita'));
  form.addEventListener('submit', searchHandler);
  return form;
}

/**
 * Setur „loading state“ skilabað meðan gögn eru sótt.
 * @param {HTMLElement} parentElement Element sem á að birta skilbaoð í.
 * @param {Element | undefined} searchForm Leitarform sem á að gera óvirkt.
 */
function setLoading(parentElement, searchForm = undefined) {
  let loadingElement = parentElement.querySelector('.loading');

  if (!loadingElement) {
    loadingElement = el('div', { class: 'loading' }, 'Sæki gögn...');
    parentElement.appendChild(loadingElement);
  }

  if (!searchForm) {
    return;
  }

  const button = searchForm.querySelector('button');

  if (button) {
    button.setAttribute('disabled', 'disabled');
  }
}

/**
 * Fjarlægir „loading state“.
 * @param {HTMLElement} parentElement Element sem inniheldur skilaboð.
 * @param {Element | undefined} searchForm Leitarform sem á að gera virkt.
 */
function setNotLoading(parentElement, searchForm = undefined) {
  const loadingElement = parentElement.querySelector('.loading');

  if (loadingElement) {
    loadingElement.remove();
  }

  if (!searchForm) {
    return;
  }

  const disabledButton = searchForm.querySelector('button[disabled]');

  if (disabledButton) {
    disabledButton.removeAttribute('disabled');
  }
}

/**
 * Birta niðurstöður úr leit.
 * @param {import('./api.types.js').Launch[] | null} results Niðurstöður úr leit
 * @param {string} query Leitarstrengur.
 */
function createSearchResults(results, query) {
  const list = el('ul', { class: 'results' });
  list.appendChild(el('h2', { class: 'results__title' }, `Leitarniðurstöður fyrir: "${query}"`));

  if (!results) {
    const noResultElement = el('li', {}, `Villa við leit að ${query}`);
    list.appendChild(noResultElement);
    return list;
  }

  if (results.length === 0) {
    const noResultElement = el('li', {}, `Engar niðurstöður fyrir leit að ${query}`);
    list.appendChild(noResultElement);
    return list;
  }

  for (const result of results) {
    const imageElement = el('img', { src: result.image, alt: 'Product Image' });
    const linkElement = el('a', { href: `/?id=${result.id}` }, imageElement);
    const resultElement = el('li', { class: 'result' },
      el('span', { class: 'image' }, linkElement),
      el('span', { class: 'title' }, result.title),
      el('span', { class: 'price' }, result.price),
      el('span', { class: 'kr'}, 'kr.-'),
      el('span', { class: 'category_title' }, result.category_title),
    );
    list.appendChild(resultElement);
  }

  return list;
}

/**
 *
 * @param {HTMLElement} parentElement Element sem á að birta niðurstöður í.
 * @param {Element} searchForm Form sem á að gera óvirkt.
 * @param {string} query Leitarstrengur.
 */
export async function searchAndRender(parentElement, searchForm, query) {
  const mainElement = parentElement.querySelector('main');

  if (!mainElement) {
    console.warn('fann ekki <main> element');
    return;
  }

  // Fjarlægja fyrri niðurstöður
  const resultsElement = mainElement.querySelector('.results');
  if (resultsElement) {
    resultsElement.remove();
  }

  setLoading(mainElement, searchForm);
  const results = await searchProducts(query);
  console.log('searchAndRender: results:', results);
  setNotLoading(mainElement, searchForm);

  const resultsEl = createSearchResults(results, query);
  console.log('searchAndRender: resultsEl:', resultsEl);

  mainElement.appendChild(resultsEl);
}

/**
 * Sýna category, með leit.
 * @param {HTMLElement} parentElement Element sem á að innihalda forsíðu.
 * @param {(e: SubmitEvent) => void} searchHandler Fall sem keyrt er þegar leitað er.
 * @param {string | undefined} query Leitarorð, ef eitthvað, til að sýna niðurstöður fyrir.
 */
export function renderCategory(
  parentElement,
  searchHandler,
  query = undefined,
) {
  const heading = el('h1', { class: 'heading', 'data-foo': 'bar' }, 'Clothing..');
  const searchForm = renderSearchForm(searchHandler, query);
  const container = el('main', {}, heading, searchForm);
  parentElement.appendChild(container);

  if (!query) {
    return;
  }

  searchAndRender(parentElement, searchForm, query);
}

/**
 * Sýna forsíðu, hugsanlega með leitarniðurstöðum.
 * @param {HTMLElement} parentElement Element sem á að innihalda forsíðu.
 * @param {(e: SubmitEvent) => void} searchHandler Fall sem keyrt er þegar leitað er.
 * @param {string | undefined} query Leitarorð, ef eitthvað, til að sýna niðurstöður fyrir.
 */
export async function renderFrontpage(parentElement) {
  const heading = el('h1', { class: 'heading', 'data-foo': 'bar' }, 'Nýjar vörur');
  const container = el('main', {}, heading);
  parentElement.appendChild(container);
  parentElement.appendChild(heading);

  // Í staðinn fyrir að nota renderDetails.
  const result = await getProductsFrontPage();
  //console.log('renderFrontPage: result:', result);
  const items = result.items;
  //console.log('renderFrontPage: items:', items);
  items.forEach(item => {
    //console.log('renderFrontPage: item:', item);
    parentElement.appendChild(createProductFrontPage(item));
  });
  
  
  //parentElement.appendChild(createProductFrontPage());
}


/**
 * Útbýr element fyrir öll gögn um vöru. Birtir titil fyrir þau gögn sem eru til
 * staðar (ekki tóm fylki) og birtir þau.
 * @param {object} product Gögn fyrir vöru sem á að birta.
 * @returns Element sem inniheldur öll gögn um vöru.
 */
export function createProduct(product) {
  const productEl = el('div', { class: 'product-site' },
    el('h1', { class: 'product-title' }, product.title));
  if (product.image) {
    productEl.appendChild(el('img', { class: 'product-image', src: product.image }));
  }
  productEl.appendChild(el('p', { class: 'category_title' }, `Flokkur: ${product.category_title}`));
  productEl.appendChild(el('p', { class: 'price' }, `Verð: ${product.price} kr.-`));
  productEl.appendChild(el('p', { class: 'description' }, product.description));
  return productEl;
}

/**
 * Útbýr element fyrir öll gögn um vöru í FrontPage. Birtir titil fyrir þau gögn sem eru til
 * staðar (ekki tóm fylki) og birtir þau.
 * @param {object} product Gögn fyrir vöru sem á að birta.
 * @returns Element sem inniheldur öll gögn um vöru.
 */
export function createProductFrontPage(product) {
  const productEl = el('div', { class: 'front-page-site' });
  if (product.image) {
    productEl.appendChild(el('img', { class: 'product-image', src: product.image }));
  }
  productEl.appendChild(el('p', { class: 'product-title' }, product.title));
  productEl.appendChild(el('p', { class: 'category_title' }, `Flokkur: ${product.category_title}`));
  productEl.appendChild(el('p', { class: 'price' }, `Verð: ${product.price} kr.-`));
  return productEl;
}

/**
 * Sýna geimskot.
 * @param {HTMLElement} parentElement Element sem á að innihalda geimskot.
 * @param {string} id Auðkenni geimskots.
 */
export async function renderDetails(parentElement, id) {
  const container = el('main', {});

  parentElement.appendChild(container);

  /* Setja loading state og sækja gögn */
  setLoading(parentElement);
  const result = await getProducts(id);
  setNotLoading(parentElement);

  // Tómt og villu state, við gerum ekki greinarmun á þessu tvennu, ef við
  // myndum vilja gera það þyrftum við að skilgreina stöðu fyrir niðurstöðu
  if (!result) {
    parentElement.appendChild(el('p', {}, 'Engin vara fannst.'));
    return;
  }

  /* Útfæra ef gögn */
  parentElement.appendChild(createProduct(result));

}