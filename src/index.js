import { renderDetails, renderFrontpage, renderSearch, renderCategory, searchAndRender } from './lib/ui.js';

/**
 * Fall sem keyrir við leit.
 * @param {SubmitEvent} e
 * @returns {Promise<void>}
 */
async function onSearch(e) {
  e.preventDefault();

  if (!e.target || !(e.target instanceof Element)) {
    return;
  }

  const { value } = e.target.querySelector('input') ?? {};

  if (!value) {
    return;
  }

  await searchAndRender(document.body, e.target, value);
  window.history.pushState({}, '', `/?search=${value}`);
}

/**
 * Athugar hvaða síðu við erum á út frá query-string og birtir.
 * Ef `id` er gefið er staka vara birt, annars er forsíða birt með
 * leitarniðurstöðum ef `query` er gefið.
 */
function route() {
  const { search } = window.location;
  const qs = new URLSearchParams(search);
  console.log('qs:', qs);

  const id = qs.get('id');
  console.log('id:', id);
  const query = qs.get('search') ?? undefined;
  console.log('search:', query);
  const category = qs.get('category') ?? undefined;
  console.log('category:', category);

  const parentElement = document.body;

  if (id) {
    renderDetails(parentElement, id);
  } else if (query) {
    renderSearch(parentElement, onSearch, query)
  } else if (category) {
    renderCategory(parentElement, onSearch, category)
  } else {
    renderFrontpage(parentElement);
  }
}

// Bregst við því þegar við notum vafra til að fara til baka eða áfram.
window.onpopstate = () => {
  // route(); // ?????????????
};

// Athugum í byrjun hvað eigi að birta.
route();
