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

function buildFAQPage(main) {
  // add header on top
  buildContentHeaderBlock(main);
  // create a section for the info box
  const infoSection = document.createElement('div');
  const fragmentBlock = buildBlock('fragment', [['/area-vip/es/fragments/contact-card']]);
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
    if ((getMetadata('template') === 'vip-faq') && main === document.querySelector('main')) {
      buildFAQPage(main);
      return;
    }
    buildHeroBlock(main);
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
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
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
const VIP_AREA_LANGUAGE_HOME_PATH = {
  es: '/area-vip',
  en: '/en/vip-area',
  fr: '/fr/zone-vip',
  de: '/de/vip-zone',
  pt: '/pt/area-vip',
  ja: '/ja/vip-area',
  ar: '/ar/vip-area',
  hi: '/hi/vip-area',
};

const LANG_LOCALE = {
  en: 'en-US',
  de: 'de-DE',
  fr: 'fr-FR',
  ko: 'ko-KR',
  es: 'es-ES',
  it: 'it-IT',
  jp: 'ja-JP',
  br: 'pt-BR',
};

let language;

export function getLanguage() {
  if (language) return language;
  language = 'es';
  const segs = window.location.pathname.split('/');
  if (segs && segs.length > 0) {
    // eslint-disable-next-line no-restricted-syntax
    for (const [value] of Object.entries(VIP_AREA_LANGUAGE_HOME_PATH)) {
      if (value === segs[1]) {
        language = value;
        break;
      }
    }
  }
  return language;
}

export function getLocale() {
  return LANG_LOCALE[getLanguage()];
}

export function getVipAreaIndexPath(url) {
  language = getLanguage();
  return `${url.origin}${VIP_AREA_LANGUAGE_HOME_PATH[language]}${VIP_AREA_INDEX}`;
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
