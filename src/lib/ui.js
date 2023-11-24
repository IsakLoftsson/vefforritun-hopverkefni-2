// eslint-disable-next-line max-len
import { getProducts, getProductsFrontPage, getCategories, getCategoryNameById, searchProducts, getProductsByCategory } from './api.js';
import { el } from './elements.js';
// eslint-disable-next-line import/no-cycle
import { route } from '../index.js';

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
 * Útbýr element fyrir öll gögn um vöru í FrontPage. Birtir titil fyrir þau gögn sem eru til
 * staðar (ekki tóm fylki) og birtir þau.
 * @param {object} product Gögn fyrir vöru sem á að birta.
 * @returns Element sem inniheldur öll gögn um vöru.
 */
export function createProductFrontPage(product) {
  // Búum til element fyrir vöru með upplýsingum
  const productEl = el('div', { class: 'front-page-site' });
  const imageElement = el('img', { src: product.image, alt: 'Product Image' });
  const linkElement = el('a', { href: `/?id=${product.id}` }, imageElement);
  const resultElement = el('li', { class: 'result' },
    el('span', { class: 'image' }, linkElement),
    el('div', { class: 'content' },
      el('div', { class: 'priceAndKr' },
        el('a', { class: 'price' }, product.price),
        el('a', { class: 'kr'}, 'kr.-'),
      ),
      el('div', { class: 'titleAndCata' },
        el('a', { class: 'title' }, product.title),
        el('a', { class: 'category_title', href: `/?category=${product.category_id}`}, product.category_title),
      ),
    ),   
  );
  // Bætum við vöru elementi
  productEl.appendChild(resultElement);
  // skilum vöru
  return productEl;
}

/**
 * Setur „loading state“ skilabað meðan gögn eru sótt.
 * @param {HTMLElement | Element} parentElement Element sem á að birta skilbaoð í.
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

  const button = document.querySelector('button');

  if (button) {
    button.setAttribute('disabled', 'disabled');
  }
}

/**
 * Fjarlægir „loading state“.
 * @param {HTMLElement | Element} parentElement Element sem inniheldur skilaboð.
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

  const disabledButton = document.querySelector('button[disabled]');

  if (disabledButton) {
    disabledButton.removeAttribute('disabled');
  }
}

/**
 * Útbýr element fyrir öll gögn um category í FrontPage. Birtir titil á category fyrir öll category sem eru til.
 * staðar (ekki tóm fylki) og birtir þau.
 * @param {object} category Gögn fyrir vöru sem á að birta.
 * @returns Element sem inniheldur öll gögn um vöru.
 */
export function createCategoryFrontPage(category) {
  // Búum til element fyrir category
  const categoryEl = el('div', { class: 'front-page-site' });
  const linkElement = el('a', { href: `/?category=${category.id}` }, category.title);
  const resultElement = el('li', { class: 'result' },
    el('a', { class: 'title' }, linkElement),
  );
  // Bætum við category elementi
  categoryEl.appendChild(resultElement);
  // skilum category
  return categoryEl;
}

/**
 * Birta niðurstöður úr leit.
 * @param {import('./api.types.js').Launch[] | null} results Niðurstöður úr leit
 * @param {string} query Leitarstrengur.
 */
function createSearchResults(results, query) {
  // Gáum hvort main element sé til, ef svo er þá eyðum við því
  const checkIfmainElement = document.querySelector('.main-results');
  if (checkIfmainElement) {
    checkIfmainElement.remove();
  }
  // Búum til nýtt main element og bætum við title og category-products
  const mainElement = el('ul', { class: 'main-results' });
  mainElement.appendChild(el('h2', { class: 'results__title' }, `Leitarniðurstöður fyrir: "${query}"`));
  const categoryProducts = el('category-products', {}, );
  mainElement.appendChild(categoryProducts);
  // Ef niðurstöður eru tómar þá birtum við villuskilaboð
  if (!results) {
    const noResultElement = el('villa1', {}, `Villa við leit að ${query}`);
    mainElement.appendChild(noResultElement);
    return mainElement;
  }
  // Ef niðurstöður eru tómar þá birtum við villuskilaboð
  if (results.length === 0) {
    const noResultElement = el('villa2', {}, `Engar niðurstöður fyrir leit að ${query}`);
    mainElement.appendChild(noResultElement);
    return mainElement;
  }
  // Búum til nýtt element fyrir hverja vöru með createProductFrontPage() og bætum við í category-products
  results.forEach(vara => {
    categoryProducts.appendChild(createProductFrontPage(vara));
  });

  return categoryProducts;
}

/**
 *
 * @param {HTMLElement} parentElement Element sem á að birta niðurstöður í.
 * @param {Element} searchForm Form sem á að gera óvirkt.
 * @param {string} query Leitarstrengur.
 */
export async function searchAndRender(parentElement, searchForm, query, category = undefined) {
  // Athugum hvort main element sé til, ef ekki þá skilum við villuskilaboðum
  const mainElement = parentElement.querySelector('results-main-element');
  if (!mainElement) {
    console.warn('fann ekki <main> element');
    return;
  }
  // Fjarlægja fyrri vörur svo það birtist ekki tvisvar
  const resultsElement = parentElement.querySelector('category-products');
  if (resultsElement) {
    resultsElement.remove();
  }
  // Setjum loading state sem disablear takkann svo maður geti ekki ýtt oft á hann
  setLoading(mainElement, searchForm);
  // Sækjum niðurstöður úr leit
  const results = await searchProducts(query, category);
  // Búum til niðurstöður úr leit
  const resultsEl = createSearchResults(results, query);
  parentElement.appendChild(resultsEl);
  // Fjarlægjum loading state af takkanum svo hann virki aftur
  setNotLoading(mainElement, searchForm);
}

/**
 * Sýna leit.
 * @param {HTMLElement} parentElement Element sem á að innihalda forsíðu.
 * @param {(e: SubmitEvent) => void} searchHandler Fall sem keyrt er þegar leitað er.
 * @param {string} query Leitarorð, ef eitthvað, til að sýna niðurstöður fyrir.
 * @param {string} category Flokkur, til að sýna niðurstöður fyrir.
 */
export async function renderSearch( parentElement, searchHandler, query, category) {
  // Náum í nafn á flokk með getCategoryNameById()
  const categoryName = await getCategoryNameById(category) ?? 'missing';
  // Búum til heading og searchform út frá categoryName
  const heading = el('h1', { class: 'heading', 'data-foo': 'bar' }, categoryName.name);
  const searchForm = renderSearchForm(searchHandler, query);
  const container = el('headerAndSearch', {}, heading, searchForm);
  // Athugum hvort headerandsearch element sé til, ef ekki þá bætum við því við
  const checkIfHeaderAndSearch = parentElement.querySelector('headerandsearch');
  if (!checkIfHeaderAndSearch) {
    parentElement.appendChild(container);
  }
  // Ef ekkert leitarorð þá höldum við ekki áfram
  if (!query) {
    return;
  }
  // Athugum hvort results-main-element sé til, ef ekki þá bætum við því við
  const checkIfContainer = parentElement.querySelector('results-main-element');
  if (!checkIfContainer) {
    const productContainer = el('results-main-element', {}, );
    parentElement.appendChild(productContainer);
  }
  // Leitum og birtum niðurstöður með searchAndRender() út frá category
  searchAndRender(parentElement, searchForm, query, category);
}

/**
 * Sýna categories, með hnappi.
 * @param {HTMLElement} parentElement Element sem á að innihalda forsíðu.
 */
export async function renderCategories(parentElement){
  // Búum til element fyrir categories og header
  const categoryContainer = el('div', { class: 'category-container' });
  const heading2 = el('h1', { class: 'heading2', 'data-foo': 'bar' }, 'Skoðaðu vöruflokkana okkar');
  parentElement.appendChild(heading2);
  parentElement.appendChild(categoryContainer);
  // Sækjum categories úr API
  const categoryResult = await getCategories();
  const categories = categoryResult.categories;
  // Búum til hnapp fyrir hvert category
  categories.forEach(category => {
    categoryContainer.appendChild(createCategoryFrontPage(category));
  });
}

/**
 * Sýna category, með leit.
 * @param {HTMLElement} parentElement Element sem á að innihalda forsíðu.
 * @param {(e: SubmitEvent) => void} searchHandler Fall sem keyrt er þegar leitað er.
 * @param {string} category Flokkur, til að sýna niðurstöður fyrir.
 */
export async function renderCategory( parentElement, searchHandler, category) {
  // Athugum hvort category-container element sé til, ef svo er þá eyðum við því
  const checkIfCategories = document.querySelector('category-container');
  if (checkIfCategories) {
    checkIfCategories.remove();
  }
  // Náum í nafn á flokk með category id með getCategoryNameById()
  const categoryName = await getCategoryNameById(category)
  // bætum við heading og searchform út frá categoryName
  const heading = el('h1', { class: 'heading', 'data-foo': 'bar' }, categoryName.name);
  const searchForm = renderSearchForm(searchHandler, '');
  const container = el('headerAndSearch', {}, heading, searchForm);
  parentElement.appendChild(container);
  // Ef ekkert category þá höldum við ekki áfram
  if (!category) {
    return;
  }
  // Búum til element fyrir vörurnar
  const productContainer = el('category-products', {}, );
  parentElement.appendChild(productContainer);
  // Sækjum vörur úr API út frá category með getProductsByCategory()
  const result = await getProductsByCategory(category, 12);
  const items = result.items;
  // Búum til vöru element fyrir hverja vöru sem við finnum í API, með createProductFrontPage() og bætum við í category-products
  items.forEach(item => {
    productContainer.appendChild(createProductFrontPage(item));
  });
}

/**
 * Sýna forsíðu, hugsanlega með leitarniðurstöðum.
 * @param {HTMLElement} parentElement Element sem á að innihalda forsíðu.
 */
export async function renderFrontpage(parentElement) {
  /** Birta vörur á frontpage */
  // Athugum hvort category-container element sé til, ef svo er þá eyðum við því
  const checkIfCategories = document.querySelector('category-container');
  if (checkIfCategories) {
    checkIfCategories.remove();
  }
  // Búum til element fyrir heading og category-products
  const heading = el('h1', { class: 'heading', 'data-foo': 'bar' }, 'Nýjar vörur');
  const productContainer = el('category-products', {}, heading);
  parentElement.appendChild(heading);
  parentElement.appendChild(productContainer);
  // Sækjum vörur úr API með getProductsFrontPage()
  const result = await getProductsFrontPage();
  const items = result.items;
  // Búum til vöru element fyrir hverja vöru sem við finnum í API, með createProductFrontPage() og bætum við í category-container
  items.forEach(item => {
    productContainer.appendChild(createProductFrontPage(item));
  });

  /** Birta 'Skoða alla flokka' takka á frontpage */
  // Bætum við takka elementi
  const addToCartButton = el('button', { class: 'skoda-flokka-button' }, 'Skoða alla flokka');
  // Bætum við event listener á takka
  addToCartButton.addEventListener('click', () => {
    // Breytum URL í glugga í category=1
    window.history.pushState({}, '', '/?categories=1');
    // notum route() til að refresha síðu og birta það sem á að birta út frá URL
    route();
  });
  parentElement.appendChild(addToCartButton);

  /**  Birta flokka á frontpage */
  // Bætum við elementi fyrir flokka og heading
  const categoryContainer = el('div', { class: 'category-container' });
  const heading2 = el('h1', { class: 'heading2', 'data-foo': 'bar' }, 'Skoðaðu vöruflokkana okkar');
  parentElement.appendChild(heading2);
  parentElement.appendChild(categoryContainer);
  // Sækjum flokka úr API með getCategories()
  const categoryResult = await getCategories();
  const categories = categoryResult.categories;
  // Búum til hnapp fyrir hvern flokk sem við finnum í API og setjum í category-container
  categories.forEach(category => {
    categoryContainer.appendChild(createCategoryFrontPage(category));
  });
}


/**
 * Útbýr element fyrir öll gögn um vöru. Birtir titil fyrir þau gögn sem eru til
 * staðar (ekki tóm fylki) og birtir þau.
 * @param {object} product Gögn fyrir vöru sem á að birta.
 * @returns Element sem inniheldur öll gögn um vöru.
 */
export function createProduct(product) {
  // Búum til element fyrir vöru
  const productEl = el('div', { class: 'product-site' },);
  // ef það er mynd þá bætum við henni við 
  if (product.image) {
    productEl.appendChild(el('img', { class: 'product-image', src: product.image }));
  }
  // Búum til element fyrir upplýsingar um vöru
  const productInfo =   el('div', { class: 'info-Container' })
  productEl.appendChild(productInfo);
  productInfo.appendChild(el('h1', { class: 'product-title' }, product.title))
  const categoryAndPrice = el('div', { class: 'categoryAndPrice' })
  productInfo.appendChild(categoryAndPrice);
  categoryAndPrice.appendChild(el('p', { class: 'category_title' }, `Flokkur: ${product.category_title}`));
  categoryAndPrice.appendChild(el('p', { class: 'price' }, `Verð: ${product.price} kr.-`));
  productInfo.appendChild(el('p', { class: 'description' }, product.description));
  // skilum vöru elementi
  return productEl;
}

/**
 * Sýna vöru.
 * @param {HTMLElement} parentElement Element sem á að innihalda vöru.
 * @param {string} id Auðkenni vöru.
 */
export async function renderDetails(parentElement, id) {
  // Búum til element fyrir vöru
  const container = el('main', {});
  parentElement.appendChild(container);
  // Setjum loading state á síðu til að sýna að við erum að sækja gögn
  setLoading(parentElement);
  // Sækjum vöru úr API með getProducts()
  const result = await getProducts(id);
  // Fjarlægjum loading state af síðu
  setNotLoading(parentElement);
  // Tómt og villu state, við gerum ekki greinarmun á þessu tvennu, ef við myndum vilja gera það þyrftum við að skilgreina stöðu fyrir niðurstöðu
  if (!result) {
    parentElement.appendChild(el('p', {}, 'Engin vara fannst.'));
    return;
  }
  // Útfæra ef gögn
  parentElement.appendChild(createProduct(result));

  // Búum til element fyrir heading
  const heading2 = el('h1', { class: 'heading2', 'data-foo': 'bar' }, `Meira úr ${result.category_title}`);
  parentElement.appendChild(heading2);
  // Sækjum upplýsingar um hvaða category við erum í
  const resultCategoryId = result.category_id
  // Búum til element fyrir vörurnar
  const productContainer = el('category-products', {}, );
  parentElement.appendChild(productContainer);
  // Sækjum vörur úr API út frá category með getProductsByCategory()
  const resultFromCategory = await getProductsByCategory(resultCategoryId, 3);
  const items = resultFromCategory.items;
  // Búum til vöru element fyrir hverja vöru sem við finnum í API, með createProductFrontPage() og bætum við í category-products
  items.forEach(item => {
    productContainer.appendChild(createProductFrontPage(item));
  });
}