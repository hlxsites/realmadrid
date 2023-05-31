import { getLocale } from '../../scripts/scripts.js';

const TOUR_SECTION = 'tour-bernabeu';
const VIP_SECTION = 'area-vip';

const SITES_PREFIX = '/sites';

const defaultVipHome = {
  en: '/en/vip-area',
  es: '/area-vip',
  fr: '/fr/zone-vip',
  de: '/de/vip-zone',
  pt: '/pt/area-vip',
  ja: '/ja/vip-area',
  ar: '/ar/vip-area',
  hi: '/hi/vip-area',
};

const VIP_SECTION_NAMES = Object.values(defaultVipHome);

const defaultTourHome = {
  en: `/en/${TOUR_SECTION}`,
  es: `/${TOUR_SECTION}`,
  fr: `/fr/${TOUR_SECTION}`,
  de: `/de/${TOUR_SECTION}`,
  pt: `/pt${TOUR_SECTION}`,
  ja: `/ja${TOUR_SECTION}`,
  ar: `/ar${TOUR_SECTION}`,
  hi: `/hi${TOUR_SECTION}`,
};

const TOUR_SECTION_NAMES = Object.values(defaultTourHome);

async function fetchSiteMap() {
  try {
    const response = await fetch('/sitemap.xml');
    const siteMapText = await response.text();
    const parser = new DOMParser();
    const siteMap = parser.parseFromString(siteMapText, 'text/xml');
    return siteMap;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('unable to get the sitemap', e);
  }
  return null;
}

async function getLocalizedUrls() {
  const siteMap = await fetchSiteMap();
  if (siteMap) {
    const currentUrl = window.location.pathname;
    const locations = [...siteMap.querySelectorAll('loc')];
    const location = locations.find((x) => new URL(x.textContent).pathname === currentUrl);
    if (location && location.parentElement) {
      const links = [...location.parentElement.querySelectorAll('link')];
      return Object.fromEntries(links.map((link) => [link.hreflang, new URL(link.href).pathname]));
    }
  }
  return {};
}

async function createLanguageDropdown(languages, languageButtonContent, currentLanguage) {
  const urls = await getLocalizedUrls();
  let sectionName;
  const currentUrl = window.location.pathname;
  if (VIP_SECTION_NAMES.find((x) => currentUrl.indexOf(x) > -1)) {
    sectionName = VIP_SECTION;
  } else if (TOUR_SECTION_NAMES.find((x) => currentUrl.indexOf(x) > -1)) {
    sectionName = TOUR_SECTION;
  } else {
    sectionName = VIP_SECTION; // todo: choose proper default
  }
  const languageDropdown = document.createElement('ul');
  languageDropdown.classList.add('language-selector-dropdown');

  const languageButtonItem = document.createElement('li');
  languageButtonItem.classList.add('language-button-item');
  languageButtonItem.appendChild(document.createRange()
    .createContextualFragment(languageButtonContent));
  languageDropdown.appendChild(languageButtonItem);
  languageButtonItem.addEventListener('click', (e) => {
    e.preventDefault();
    languageDropdown.classList.toggle('visible');
  }, false);

  for (let i = 0; i < languages.length; i += 1) {
    const languageItem = document.createElement('li');
    languageItem.classList.add('language-selector-item');
    if (languages[i].code === currentLanguage) {
      languageItem.classList.add('current');
    }
    const langName = languages[i].code.split('-')[0].toLowerCase();
    let defaultUrl = '#';
    if (sectionName === TOUR_SECTION) {
      defaultUrl = defaultTourHome[langName];
    } else if (sectionName === VIP_SECTION) {
      defaultUrl = defaultVipHome[langName];
    }
    const langUrl = urls[langName]
      ? urls[langName]
      : `${SITES_PREFIX}${defaultUrl}`;
    languageItem.innerHTML = `
      <a href="${langUrl}">${languages[i].label}</a>
      <svg focusable="false" width="22" height="22" aria-hidden="true">
        <use xlink:href="${window.hlx.codeBasePath}/blocks/header/cibeles-sprite.svg#check"></use>
      </svg>
    `;
    languageDropdown.appendChild(languageItem);
  }

  return languageDropdown;
}

export default async function createLanguageSelectorButton(parent, languages) {
  const languageSelector = document.createElement('div');
  languageSelector.classList.add('language-selector');
  parent.appendChild(languageSelector);

  const languageSelectorButton = document.createElement('button');
  languageSelectorButton.id = 'language-selector-button';
  languageSelectorButton.classList.add('language-selector-button');

  const currentLanguage = getLocale();
  const languageButtonContent = `
    <svg focusable="false" width="16" height="16" aria-hidden="true">
      <use xlink:href="${window.hlx.codeBasePath}/blocks/header/landing-sprite.svg#lang"></use>
    </svg>
    <span>${currentLanguage.substring(0, 2)}</span>
    <svg focusable="false" width="16" height="16" aria-hidden="true">
      <use xlink:href="${window.hlx.codeBasePath}/blocks/header/cibeles-sprite.svg#chevron-up"></use>
    </svg>
  `;

  languageSelectorButton.appendChild(document.createRange()
    .createContextualFragment(languageButtonContent));

  const languageDropdown = await createLanguageDropdown(
    languages,
    languageButtonContent,
    currentLanguage,
  );

  languageSelectorButton.addEventListener('click', (e) => {
    e.preventDefault();
    languageDropdown.classList.toggle('visible');
  }, false);

  languageSelector.appendChild(languageSelectorButton);
  languageSelector.appendChild(languageDropdown);
}
