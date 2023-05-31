import createLanguageSelectorButton from './languageSelector.js';

export function createTopMenuMobile(data) {
  const menuItems = data.data.header.items[0].additionalNavigation.map((nav) => (
    `<li><a class='top-menu-mobile-item' href="${nav.url}">${nav.title}</a></li>`
  )).join('');
  const menu = document.createElement('ul');
  menu.classList.add('top-menu-mobile');
  menu.innerHTML = menuItems;
  return menu;
}

export default async function createPopupMenu(data) {
  const popupArea = document.createElement('div');
  popupArea.classList.add('popup-menu-area');

  const popup = document.createElement('div');
  popup.classList.add('popup-menu');
  popupArea.appendChild(popup);

  popup.innerHTML = '<div></div>';

  const hasChildrenIcon = `
    <svg focusable="false" width="18" height="18" aria-hidden="true" class="main-popup-menu-has-children right">
      <use xlink:href="${window.hlx.codeBasePath}/blocks/header/cibeles-sprite.svg#chevron-right"></use>
    </svg>
    <svg focusable="false" width="18" height="18" aria-hidden="true" class="main-popup-menu-has-children up ">
      <use xlink:href="${window.hlx.codeBasePath}/blocks/header/cibeles-sprite.svg#chevron-up"></use>
    </svg>
    <svg focusable="false" width="18" height="18" aria-hidden="true" class="main-popup-menu-has-children down">
      <use xlink:href="${window.hlx.codeBasePath}/blocks/header/cibeles-sprite.svg#chevron-down"></use>
    </svg>
    `;

  const imageArea = document.createElement('div');
  imageArea.classList.add('image-popup-menu-area');

  const subMenu = document.createElement('ul');
  subMenu.classList.add('sub-popup-menu-area');

  let selectedMenuItem = null;

  const updateSubMenu = (index, menuItem) => {
    if (selectedMenuItem === menuItem) {
      selectedMenuItem.classList.remove('selected');
      selectedMenuItem = null;
      return;
    }
    subMenu.innerHTML = data.data.header.items[0]
      .mainNavigation[index].childNavigationItems.map((nav) => (
        `<li><a class='sub-popup-menu-item' href="${nav.url}">${nav.title}</a></li>`
      )).join('');
    if (data.data.header.items[0].mainNavigation[index].image) {
      // eslint-disable-next-line no-underscore-dangle
      const originalImageUrl = data.data.header.items[0].mainNavigation[index].image._publishUrl;
      const lastDotIndex = originalImageUrl.lastIndexOf('.');
      // eslint-disable-next-line prefer-template
      const imageUrl = originalImageUrl.slice(0, lastDotIndex) + '.app.' + originalImageUrl.slice(lastDotIndex) + '?wid=150';
      imageArea.innerHTML = `
        <img src="${imageUrl}"></img>
      `;
    } else {
      imageArea.innerHTML = '';
    }
    menuItem.appendChild(subMenu);
    menuItem.appendChild(imageArea);
    if (selectedMenuItem) {
      selectedMenuItem.classList.remove('selected');
    }
    menuItem.classList.add('selected');
    selectedMenuItem = menuItem;
  };

  const mainMenu = document.createElement('ul');
  mainMenu.classList.add('main-popup-menu-area');
  data.data.header.items[0].mainNavigation.forEach((nav, index) => {
    const menuItem = document.createElement('li');
    const link = document.createElement('a');
    link.setAttribute('class', 'main-popup-menu-item');
    link.innerHTML = `<span>${nav.title}</span>`;
    if (nav.childNavigationItems.length) {
      link.innerHTML += hasChildrenIcon;
      link.addEventListener('click', (e) => {
        e.preventDefault();
        updateSubMenu(index, menuItem);
      });
    } else {
      link.setAttribute('href', nav.url);
    }
    menuItem.appendChild(link);
    mainMenu.appendChild(menuItem);
    if (index === 0) {
      updateSubMenu(index, menuItem);
    }
  });

  const scrollableArea = document.createElement('div');
  scrollableArea.classList.add('scrollable-popup-menu-area');
  popup.appendChild(scrollableArea);

  scrollableArea.appendChild(createTopMenuMobile(data));
  scrollableArea.appendChild(mainMenu);
  scrollableArea.appendChild(subMenu);
  scrollableArea.appendChild(imageArea);

  const sponsors = document.createElement('div');
  scrollableArea.appendChild(sponsors);
  sponsors.classList.add('sponsors-popup-menu-area');

  const sponsorIcons = data.data.header.items[0].sponsors.map((sponsor) => (
    // eslint-disable-next-line no-underscore-dangle
    `<img src='${sponsor.logo._publishUrl}' style="width: 57px; height: 40px; margin: -6px 9px 0 10px; padding: 5px"/>`
  )).join('');

  sponsors.innerHTML = `
    ${sponsorIcons}
    <a href="https://app-rm-spa-web-stg.azurewebsites.net/sobre-el-real-madrid/el-club/patrocinadores">
         Ver todos los patrocinadores
    </a>
  `;

  const footer = document.createElement('div');
  popup.appendChild(footer);
  footer.classList.add('language-popup-menu-area');
  await createLanguageSelectorButton(footer, data.data.header.items[0].languages);

  return popupArea;
}
