export default function createPopupMenu(data) {
  const popupArea = document.createElement('div');
  popupArea.classList.add('popup-menu-area');

  const popup = document.createElement('div');
  popup.classList.add('popup-menu');
  popupArea.appendChild(popup);

  popup.innerHTML = '<div></div>';

  const hasChildrenIcon = `
    <svg focusable="false" width="18" height="18" aria-hidden="true" class="main-popup-menu-has-children">
      <use xlink:href="/blocks/header/cibeles-sprite.svg#chevron-right"></use>
    </svg>`;

  const imageArea = document.createElement('div');
  imageArea.classList.add('image-popup-menu-area');

  const subMenu = document.createElement('div');
  subMenu.classList.add('sub-popup-menu-area');

  const updateSubMenu = (index) => {
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
  };

  updateSubMenu(data.data.header.items[0].mainNavigation
    .findIndex((nav) => nav.childNavigationItems.length));

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
        updateSubMenu(index);
      });
    } else {
      link.setAttribute('href', nav.url);
    }
    menuItem.appendChild(link);
    mainMenu.appendChild(menuItem);
  });

  popup.appendChild(mainMenu);
  popup.appendChild(subMenu);
  popup.appendChild(imageArea);

  const footer = document.createElement('div');
  popup.appendChild(footer);
  footer.classList.add('footer-popup-menu-area');
  footer.innerHTML = `
    <button class="lang-button">
      <svg focusable="false" width="16" height="16" aria-hidden="true">
        <use xlink:href="/blocks/header/landing-sprite.svg#lang"></use>
      </svg>
      <span>ES</span>
      <svg focusable="false" width="16" height="16" aria-hidden="true">
        <use xlink:href="/blocks/header/cibeles-sprite.svg#chevron-up"></use>
      </svg>
    </button>
  `;

  return popupArea;
}
