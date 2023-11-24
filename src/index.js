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
  // Náum í category úr URL
  const category = qs.get('category') ?? undefined;
  console.log('onSearch: category:', category);
  await searchAndRender(document.body, e.target, value);
  // Setjum inn rétt URL í history með réttum category og value gildum
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

  // Athugum hvort við finnum gildi í URL strengnum
  const id = qs.get('id');
  console.log('route(): id:', id);
  const query = qs.get('search') ?? undefined;
  console.log('route(): search:', query);
  const category = qs.get('category') ?? undefined;
  console.log('route(): category:', category);
  const categories = qs.get('categories') ?? undefined;
  console.log('route(): categories:', categories);

  // finnum main html elementið
  const parentElement = document.body;
  const main = document.querySelector('main');
  // hreinsum það sem var í main element til að undirbúa fyrir nýja síðu, eða sömu síðu
  if (main) {
    main.remove();
  }
  //Fjarlægja fyrri vörur
  const checkIfProducts = document.querySelector('category-products');
  if (checkIfProducts) {
    checkIfProducts.remove();
  }
  // Fjarlægja fyrri vöruflokka
  const checkIfCategories = document.querySelector('.category-container');
  if (checkIfCategories) {
    checkIfCategories.remove();
  }
  // Fjarlægja takka
  const checkIfButton = document.querySelector('.skoda-flokka-button');
  if (checkIfButton) {
    checkIfButton.remove();
  }
  // Fjarlægja heading
  const checkIfHeading = document.querySelector('.heading');
  if (checkIfHeading) {
    checkIfHeading.remove();
  }
  // Fjarlægja heading2
  const checkIfHeading2 = document.querySelector('.heading2');
  if (checkIfHeading2) {
    checkIfHeading2.remove();
  }
  // Köllum á rétta render fallið sem á við til að birta síðu sem passar við URL
  if (id) {
    // ef id hefur gildi þá erum við að byðja um ákveðna vöru. Notum renderDetails til að birta þá vöru
    renderDetails(parentElement, id);
  } else if (category && !query) {
    // ef category hefur gildi en ekki query þá erum við að byðja um ákveðna vöruflokk. Notum renderCategory til að birta þann vöruflokk
    renderCategory(parentElement, onSearch, category);
  } else if (category && query) {
    // ef category og query hefur gildi þá erum við að leita í ákveðnum vöruflokki. Notum renderSearch til að birta leitarniðurstöður
    renderSearch(parentElement, onSearch, query, category);
  } else if (categories) {
    // ef categories hefur gildi þá sýnum við alla vöruflokka. Notum renderCategories til að birta alla vöruflokka
    renderCategories(parentElement, onSearch, categories);
  } else {
    // Ef ekkert af ofantöldu er til staðar þá erum við á forsíðu. Notum renderFrontpage til að birta forsíðu   
    renderFrontpage(parentElement);
  }
}

// Bregst við því þegar við notum vafra til að fara til baka eða áfram.
window.onpopstate = () => {
  route();
};

// Athugum í byrjun hvað eigi að birta.
route();
