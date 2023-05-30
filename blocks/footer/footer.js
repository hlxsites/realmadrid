import { fetchNavigationConfig } from '../../scripts/scripts.js';

/* eslint no-underscore-dangle: 0 */

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const data = await fetchNavigationConfig();
  if (!data) {
    return;
  }

  const footerConfig = data.data.footer.items[0];
  const mainSection = document.createElement('div');
  mainSection.classList.add('footer-main-section');
  block.append(mainSection);

  const mainNavigation = document.createElement('ul');
  mainNavigation.classList.add('footer-main-navigation');
  mainSection.append(mainNavigation);
  footerConfig.mainNavigation.forEach((item) => {
    const mainNavigationItem = document.createElement('li');
    mainNavigation.append(mainNavigationItem);
    mainNavigationItem.appendChild(document.createRange().createContextualFragment(`
      <a href="${item.url}">${item.title}</a>
      <svg focusable="false" width="24" height="24"><use xlink:href="/blocks/header/cibeles-sprite.svg#chevron-right"></use></svg>
    `));
    const childNavigation = document.createElement('ul');
    mainNavigationItem.append(childNavigation);
    childNavigation.classList.add('footer-child-navigation');
    item.childNavigationItems.forEach((child) => {
      const childNavigationItem = document.createElement('li');
      childNavigation.append(childNavigationItem);
      childNavigationItem.appendChild(document.createRange().createContextualFragment(`
        <a href="${child.url}">${child.title}</a>
      `));
    });
  });

  const extraNavigation = document.createElement('ul');
  extraNavigation.classList.add('footer-extra-navigation');
  mainSection.append(extraNavigation);
  footerConfig.additionalNavigation.forEach((item) => {
    const li = document.createElement('li');
    extraNavigation.append(li);
    li.appendChild(document.createRange().createContextualFragment(`
      <a href="${item.url}">${item.title}</a>
    `));
  });

  const mobileApps = document.createElement('ul');
  mobileApps.classList.add('footer-mobile-apps');
  mainSection.append(mobileApps);
  mobileApps.appendChild(document.createRange().createContextualFragment(`
    <h3>${footerConfig.mobileAPPLinks.title}</h3>
    <h4>${footerConfig.mobileAPPLinks.subtitle}</h4>
  `));
  footerConfig.mobileAPPLinks.appLinks.forEach((item) => {
    const li = document.createElement('li');
    mobileApps.append(li);
    li.appendChild(document.createRange().createContextualFragment(`
      <a href="${item.url}">
        <img src="${item.image._publishUrl}" alt="${item.title}"/>
      </a>
    `));
  });

  const mainSponsors = document.createElement('ul');
  mainSponsors.classList.add('footer-main-sponsors');
  mainSection.append(mainSponsors);
  footerConfig.sponsors.mainSponsors.forEach((item) => {
    const li = document.createElement('li');
    mainSponsors.append(li);
    li.appendChild(document.createRange().createContextualFragment(`
      <a href="${item.url}" alt="${item.title}">
        <img src="${item.logo._publishUrl}">
      </a>
    `));
  });
  const otherSponsors = document.createElement('ul');
  otherSponsors.classList.add('footer-other-sponsors');
  mainSection.append(otherSponsors);
  footerConfig.sponsors.otherSponsors.forEach((item) => {
    const li = document.createElement('li');
    otherSponsors.append(li);
    li.appendChild(document.createRange().createContextualFragment(`
      <a href="${item.url}" alt="${item.title}">
        <img src="${item.logo._publishUrl}">
      </a>
    `));
  });

  const socialLinks = document.createElement('ul');
  socialLinks.classList.add('footer-social-links');
  mainSection.append(socialLinks);
  footerConfig.socialLinks.forEach((item) => {
    const li = document.createElement('li');
    socialLinks.append(li);
    li.appendChild(document.createRange().createContextualFragment(`
      <a href="${item.url}">
        <svg focusable="false" width="24" height="24"><title>${item.title}</title><use xlink:href="/blocks/header/cibeles-sprite.svg#${item.title.toLowerCase()}"></use></svg>
      </a>
    `));
  });

  const bottomSection = document.createElement('div');
  bottomSection.classList.add('footer-bottom-section');
  block.append(bottomSection);

  const logo = document.createElement('div');
  logo.classList.add('footer-logo');
  bottomSection.append(logo);
  logo.innerHTML = `
    <svg focusable="false" width="56" height="56"><use xlink:href="/blocks/header/cibeles-sprite.svg#logo-rm"></use></svg>
  `;

  const bottomBar = document.createElement('ul');
  bottomBar.classList.add('footer-bottom-links');
  bottomSection.append(bottomBar);
  footerConfig.bottomBarLinks.forEach((item) => {
    const li = document.createElement('li');
    bottomBar.append(li);
    li.appendChild(document.createRange().createContextualFragment(`
      <a href="${item.url}">${item.title}</a>
    `));
  });

  const copyRight = document.createElement('div');
  copyRight.classList.add('footer-copy-right');
  bottomSection.append(copyRight);
  copyRight.innerHTML = footerConfig.copyRightText;
}
