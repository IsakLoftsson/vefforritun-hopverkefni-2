import { renderDetails, renderFrontpage, renderSearch, renderCategory, searchAndRender, renderCategories} from './lib/ui.js';

/**
 * Fall sem keyrir við leit.
 * @param {SubmitEvent} e
 * @returns {Promise<void>}
 */
async function onSearch(e) {
  console.log('onSearch: e:', e);
  e.preventDefault();

  if (!e.target || !(e.target instanceof Element)) {
    return;
  }

  const { value } = e.target.querySelector('input') ?? {};

  if (!value) {
    return;
  }

  const { search } = window.location;
  const qs = new URLSearchParams(search);
  const category = qs.get('category') ?? undefined;
  console.log('onSearch: category:', category);

  await searchAndRender(document.body, e.target, value);
  window.history.pushState({}, '', `/?category=${category}&search=${value}`);
  route();
}

/**
 * Athugar hvaða síðu við erum á út frá query-string og birtir.
 * Ef `id` er gefið er staka vara birt, annars er forsíða birt með
 * leitarniðurstöðum ef `query` er gefið.
 */
export function route() {
  const { search } = window.location;

  const qs = new URLSearchParams(search);
  console.log('qs:', qs);

  const id = qs.get('id');
  console.log('route(): id:', id);
  const query = qs.get('search') ?? undefined;
  console.log('route(): search:', query);
  const category = qs.get('category') ?? undefined;
  console.log('route(): category:', category);
  const categories = qs.get('categories') ?? undefined;
  console.log('route(): categories:', categories);

  const parentElement = document.body;
  // finnum main html elementið
  const main = document.querySelector('main');
  // hreinsum það sem var í main element til að undirbúa fyrir nýja síðu, eða sömu síðu
  if (main) {
    main.remove();
  }

  const categoryProducts = document.querySelector('category-products');
  if (categoryProducts) {
    categoryProducts.remove();
  }

  if (id) {
    renderDetails(parentElement, id);
  } else if (category && !query) {
    renderCategory(parentElement, onSearch, category);
  } else if (category && query) {
    renderSearch(parentElement, onSearch, query, category);
  } else if (categories) {
    renderCategories(parentElement, onSearch, categories);
  } else {
    renderFrontpage(parentElement);
  }
}

// Bregst við því þegar við notum vafra til að fara til baka eða áfram.
window.onpopstate = () => {
  route();
};

// Athugum í byrjun hvað eigi að birta.
route();
