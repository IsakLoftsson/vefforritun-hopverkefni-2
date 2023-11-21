import { getProducts, getProductsFrontPage, getCategories, getCategoryNameById, searchProducts, getProductsByCategory } from './api.js';
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
 * Sýna leit.
 * @param {HTMLElement} parentElement Element sem á að innihalda forsíðu.
 * @param {(e: SubmitEvent) => void} searchHandler Fall sem keyrt er þegar leitað er.
 * @param {string | undefined} query Leitarorð, ef eitthvað, til að sýna niðurstöður fyrir.
 */
export function renderSearch( parentElement, searchHandler, query = undefined) {
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
 * Sýna category, með leit.
 * @param {HTMLElement} parentElement Element sem á að innihalda forsíðu.
 * @param {(e: SubmitEvent) => void} searchHandler Fall sem keyrt er þegar leitað er.
 * @param {string | undefined} query Leitarorð, ef eitthvað, til að sýna niðurstöður fyrir.
 */
export async function renderCategory( parentElement, searchHandler, category = undefined) {
  const categoryName = await getCategoryNameById(category)
  const heading = el('h1', { class: 'heading', 'data-foo': 'bar' }, categoryName.name);
  const searchForm = renderSearchForm(searchHandler, '');
  const container = el('main', {}, heading, searchForm);
  parentElement.appendChild(container);
  if (!category) {
    return;
  }

  /**** Birta vörur eftir flokki á frontpage ****/
  const productContainer = el('category_products', {}, );
  parentElement.appendChild(productContainer);
  
  const result = await getProductsByCategory(category);
  //console.log('renderFrontPage: result:', result);
  const items = result.items;
  //console.log('renderFrontPage: items:', items);
  items.forEach(item => {
    //console.log('renderFrontPage: item:', item);
    productContainer.appendChild(createProductFrontPage(item));
  });

  
}

/**
 * Sýna forsíðu, hugsanlega með leitarniðurstöðum.
 * @param {HTMLElement} parentElement Element sem á að innihalda forsíðu.
 * @param {(e: SubmitEvent) => void} searchHandler Fall sem keyrt er þegar leitað er.
 * @param {string | undefined} query Leitarorð, ef eitthvað, til að sýna niðurstöður fyrir.
 */
export async function renderFrontpage(parentElement) {
  const heading = el('h1', { class: 'heading', 'data-foo': 'bar' }, 'Nýjar vörur');
  const productContainer = el('main', {}, heading);
  parentElement.appendChild(heading);
  parentElement.appendChild(productContainer);

  /**** Birta vörur á frontpage ****/
  const result = await getProductsFrontPage();
  //console.log('renderFrontPage: result:', result);
  const items = result.items;
  //console.log('renderFrontPage: items:', items);
  items.forEach(item => {
    //console.log('renderFrontPage: item:', item);
    productContainer.appendChild(createProductFrontPage(item));
  });

  /**** Birta 'Skoða alla flokka' takka á frontpage ****/
  const addToCartButton = el('button', { class: 'skoda-flokka-button' }, 'Skoða alla flokka');
  addToCartButton.addEventListener('click', () => {
    console.log(`Takki virkar!`);
  });
  parentElement.appendChild(addToCartButton);

  /****  Birta flokka á frontpage ****/
  const categoryContainer = el('div', { class: 'category-container' });
  const heading2 = el('h1', { class: 'heading2', 'data-foo': 'bar' }, 'Skoðaðu vöruflokkana okkar');
  parentElement.appendChild(heading2);
  parentElement.appendChild(categoryContainer);

  const categoryResult = await getCategories();
  const categories = categoryResult.categories;
  categories.forEach(category => {
    categoryContainer.appendChild(createCategoryFrontPage(category));
  });

  //////////////////////////////////////////////////////////////////////////////
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
  console.log('createProductFrontPage: product:', product);
  const productEl = el('div', { class: 'front-page-site' });
  const imageElement = el('img', { src: product.image, alt: 'Product Image' });
  const linkElement = el('a', { href: `/?id=${product.id}` }, imageElement);
  const resultElement = el('li', { class: 'result' },
    el('span', { class: 'image' }, linkElement),
    el('a', { class: 'title' }, product.title),
    el('a', { class: 'price' }, product.price),
    el('a', { class: 'kr'}, 'kr.-'),
    el('a', { class: 'category_title', href: `/?category=${product.category_id}`}, product.category_title),
  );
  productEl.appendChild(resultElement);

  return productEl;
}

/**
 * Útbýr element fyrir öll gögn um category í FrontPage. Birtir titil á category fyrir öll category sem eru til.
 * staðar (ekki tóm fylki) og birtir þau.
 * @param {object} category Gögn fyrir vöru sem á að birta.
 * @returns Element sem inniheldur öll gögn um vöru.
 */
export function createCategoryFrontPage(category) {
  console.log('createCategoryFrontPage: category:', category);
  const categoryEl = el('div', { class: 'front-page-site' });
  const linkElement = el('a', { href: `/?category=${category.id}` }, category.title);
  const resultElement = el('li', { class: 'result' },
    el('a', { class: 'title' }, linkElement),
  );
  categoryEl.appendChild(resultElement);

  return categoryEl;
}

/**
 * Sýna vöru.
 * @param {HTMLElement} parentElement Element sem á að innihalda vöru.
 * @param {string} id Auðkenni vöru.
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