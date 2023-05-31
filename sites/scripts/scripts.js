import {
  sampleRUM,
  buildBlock,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS,
  getMetadata,
  toClassName,
  fetchPlaceholders,
} from './lib-franklin.js';

const LCP_BLOCKS = []; // add your LCP blocks to the list

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  const video = main.querySelector('.video');
  const isPictureHero = h1 && picture
    // eslint-disable-next-line no-bitwise
    && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING);
  const isVideoHero = h1 && video
    // eslint-disable-next-line no-bitwise
    && (h1.compareDocumentPosition(video) & Node.DOCUMENT_POSITION_PRECEDING);
  if (isPictureHero || isVideoHero) {
    const section = document.createElement('div');
    const heroMedia = isPictureHero ? picture : video;
    const elems = [heroMedia, h1];
    const parents = [heroMedia.parentElement];
    const h2 = h1.nextElementSibling;
    let heading = h1;
    if (h2 && h2.tagName === 'H2') {
      elems.push(h2);
      heading = h2;
    }
    for (let nextElem = heading.nextElementSibling;
      nextElem && nextElem.tagName === 'P' && nextElem.className === 'button-container';
      nextElem = nextElem.nextElementSibling
    ) {
      const anchor = nextElem.querySelector('a');
      if (anchor.href.endsWith('.pdf')) {
        anchor.setAttribute('download', 'download');
      }
      elems.push(anchor);
      parents.push(anchor.parentElement);
    }
    const heroBlock = buildBlock('hero', { elems });
    if (isVideoHero) {
      heroBlock.classList.add('hero-video');
    }
    section.append(heroBlock);
    parents.filter((elem) => elem.tagName === 'P')
      .forEach((elem) => elem.remove());
    main.prepend(section);
  }
}

function buildContentHeaderBlock(main) {
  // add content header
  // create a section for the header
  const headerSection = document.createElement('div');
  const HeaderBlock = buildBlock('content-header', '');
  headerSection.append(HeaderBlock);
  main.prepend(headerSection);
}

export const DOCROOT = '/sites';

const VIP_AREA_LANGUAGE_HOME_PATH = {
  es: `${DOCROOT}/area-vip`,
  en: `${DOCROOT}/en/vip-area`,
  fr: `${DOCROOT}/fr/zone-vip`,
  de: `${DOCROOT}/de/vip-zone`,
  pt: `${DOCROOT}/pt/area-vip`,
  ja: `${DOCROOT}/ja/vip-area`,
  ar: `${DOCROOT}/ar/vip-area`,
  hi: `${DOCROOT}/hi/vip-area`,
};

const TOUR_SECTION = 'tour-bernabeu';

const TOUR_LANGUAGE_HOME_PATH = {
  es: `${DOCROOT}/${TOUR_SECTION}`,
  en: `${DOCROOT}/en/${TOUR_SECTION}`,
  fr: `${DOCROOT}/fr/${TOUR_SECTION}`,
  de: `${DOCROOT}/de/${TOUR_SECTION}`,
  pt: `${DOCROOT}/pt/${TOUR_SECTION}`,
  ja: `${DOCROOT}/ja/${TOUR_SECTION}`,
  ar: `${DOCROOT}/ar/${TOUR_SECTION}`,
  hi: `${DOCROOT}/hi/${TOUR_SECTION}`,
};

const VIP_SECTION_PATHS = Object.values(VIP_AREA_LANGUAGE_HOME_PATH);

const TOUR_SECTION_PATHS = Object.values(TOUR_LANGUAGE_HOME_PATH);

let language;

export function getLanguage() {
  if (language) return language;
  language = 'es';
  const segs = window.location.pathname.split('/');
  if (segs && segs.length > 0) {
    // eslint-disable-next-line no-restricted-syntax
    for (const [value] of Object.entries(VIP_AREA_LANGUAGE_HOME_PATH)) {
      if (value === segs[2]) {
        language = value;
        break;
      }
    }
  }
  return language;
}

export function getVIPAreaLangRoot(lang) {
  const requestedLang = typeof lang === 'string' ? lang : getLanguage();
  return VIP_AREA_LANGUAGE_HOME_PATH[requestedLang];
}

export function getTourLangRoot(lang) {
  const requestedLang = typeof lang === 'string' ? lang : getLanguage();
  return TOUR_LANGUAGE_HOME_PATH[requestedLang];
}

export function getCurrentSection() {
  const currentUrl = window.location.pathname;
  if (VIP_SECTION_PATHS.find((x) => currentUrl.indexOf(x) > -1)) {
    return 'vip';
  } if (TOUR_SECTION_PATHS.find((x) => currentUrl.indexOf(x) > -1)) {
    return 'tour';
  }
  return 'vip'; // todo: choose proper default
}

function buildFAQPage(main) {
  // add header on top
  buildContentHeaderBlock(main);
  // create a section for the info box
  const infoSection = document.createElement('div');
  const fragmentBlock = buildBlock('fragment', `${getVIPAreaLangRoot()}/fragments/contact-card`);
  infoSection.append(fragmentBlock);
  main.append(infoSection);
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    // we use fragments in auto blocks which generates its own main and calls decorateMain()
    // on it. So we have to check that we are not ending in a recursive loop
    if (main === document.querySelector('main')) {
      const template = toClassName(getMetadata('template'));
      if (template === 'vip-faq') {
        buildFAQPage(main);
      }
      if (template === 'area-vip') {
        buildHeroBlock(main);
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  // eslint-disable-next-line no-use-before-define
  document.documentElement.lang = getLanguage();
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    if (document.documentElement.lang === 'ar') {
      document.body.dir = 'rtl';
    }
    await waitForLCP(LCP_BLOCKS);
  }
}

/**
 * Adds the favicon.
 * @param {string} href The favicon URL
 */
export function addFavIcon(href) {
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/svg+xml';
  link.href = href;
  const existingLink = document.querySelector('head link[rel="icon"]');
  if (existingLink) {
    existingLink.parentElement.replaceChild(link, existingLink);
  } else {
    document.getElementsByTagName('head')[0].appendChild(link);
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  addFavIcon(`${window.hlx.codeBasePath}/styles/favicon.svg`);
  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

const VIP_AREA_INDEX = '/query-index.json';
const LANG_LOCALE = {
  es: 'es-ES',
  en: 'en-US',
  de: 'de-DE',
  fr: 'fr-FR',
  pt: 'pt-PT',
  ar: 'ar-AE',
  hi: 'hi-IN',
  ja: 'ja-JP',
};

export function getLocale() {
  return LANG_LOCALE[getLanguage()];
}
let navigationConfig;
export async function fetchNavigationConfig() {
  const placeholders = await fetchPlaceholders(DOCROOT);
  const { aemGqEndpoint } = placeholders;
  const locale = getLocale();
  const DATA_URL = `${aemGqEndpoint}/realmadridmastersite/structurePage%3Balang=${locale}`;
  if (navigationConfig) {
    return navigationConfig;
  }
  try {
    const response = await fetch(DATA_URL);
    navigationConfig = await response.json();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
  return navigationConfig;
}

export function getVipAreaIndexPath(url) {
  language = getLanguage();
  return `${url.origin}${VIP_AREA_LANGUAGE_HOME_PATH[language]}${VIP_AREA_INDEX}`;
}

export async function fetchLanguagePlaceholders() {
  const currentLanguage = getLanguage();
  let prefix = `${DOCROOT}/${currentLanguage}`;
  if (language === 'es') {
    prefix = DOCROOT;
  }
  const languagePlaceholders = await fetchPlaceholders(prefix);
  return languagePlaceholders;
}

/**
 * Adds a child div that wraps the blocks below 'merge-blocks-desktop' section and moves the class
 * to the new child.
 * Useful for tour pages only.
 * @param {HTMLElement} mergeBlockSection
 */
export function wrapMergeBlocksSection(mergeBlockSection) {
  const fragment = document.createElement('div');
  mergeBlockSection.classList.remove('merge-blocks-desktop');
  fragment.classList.add('merge-blocks-desktop');
  const blocks = [...mergeBlockSection.children];
  blocks.forEach((block) => {
    fragment.appendChild(block);
  });
  mergeBlockSection.appendChild(fragment);
}

/**
   * Loads a fragment.
   * @param {string} path The path to the fragment
   * @returns {HTMLElement} The root element of the fragment
   */
export async function loadFragment(path) {
  if (path && path.startsWith('/')) {
    const resp = await fetch(`${path}.plain.html`);
    if (resp.ok) {
      const main = document.createElement('main');
      main.innerHTML = await resp.text();
      decorateMain(main);
      await loadBlocks(main);
      return main;
    }
  }
  return null;
}

export function bindSwipeToElement(el) {
  let touchstartX = 0;
  let touchendX = 0;

  el.addEventListener('touchstart', (e) => {
    touchstartX = e.changedTouches[0].screenX;
  });

  el.addEventListener('touchend', (e) => {
    touchendX = e.changedTouches[0].screenX;
    if (touchendX < touchstartX) {
      el.dispatchEvent(new CustomEvent('swipe-RTL'));
    }
    if (touchendX > touchstartX) {
      el.dispatchEvent(new CustomEvent('swipe-LTR'));
    }
  });
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
