import fetchMenuData from './utils.js';
import createPopupMenu from './popupMenu.js';
import createMainMenu from './topMenu.js';

function addHamburger(block, data) {
  let state = false;
  const icon = () => {
    const src = `/blocks/header/cibeles-sprite.svg#${state ? 'times' : 'menu'}`;
    return `
        <svg focusable="false" width="24" height="24" aria-hidden="true">
            <use xlink:href="${src}"></use>
        </svg>
    `;
  };
  const popup = createPopupMenu(data);
  block.appendChild(popup);
  const menu = document.createElement('div');
  menu.setAttribute('style', 'background-color: #fff; border-radius: 5px; padding: 0px 9px; display: flex; flex-direction: column; justify-content: center; align-items: center');
  menu.innerHTML = icon();

  const toggle = () => {
    state = !state;
    menu.innerHTML = icon();
    if (state) {
      popup.classList.add('visible');
      document.body.style.overflow = 'hidden';
    } else {
      popup.classList.remove('visible');
      document.body.style.overflow = 'auto';
    }
  };
  menu.addEventListener('click', toggle, false);
  popup.addEventListener('click', (e) => {
    if (e.target.classList.contains('popup-menu-area') && state) {
      toggle();
    }
  }, false);

  block.appendChild(menu);
}

export default async function decorate(block) {
  let lastScroll = 0;
  document.addEventListener('scroll', () => {
    if (lastScroll < window.scrollY) {
      block.classList.add('hidden');
    } else {
      block.classList.remove('hidden');
    }
    lastScroll = window.scrollY;
  });

  const data = await fetchMenuData();
  addHamburger(block, data);

  // eslint-disable-next-line no-underscore-dangle
  const logoUrl = data.data.header.items[0].additionalLogos[0]._publishUrl;
  // eslint-disable-next-line no-underscore-dangle
  const sponsorUrl = data.data.header.items[0].sponsors[1].logo._publishUrl;

  block.appendChild(document.createRange().createContextualFragment(`
    <div style="flex: 1 0 auto; display: flex; flex-direction: row; justify-content: space-between; align-items: center">
      <!-- Logos -->
      <div style="flex: 0 0 auto; display: flex; flex-direction: row; justify-content: space-between; align-items: center; margin: 0 9px 0 10px">
        <svg focusable="false" width="40" height="40">
          <use xlink:href="/blocks/header/cibeles-sprite.svg#logo-rm"></use>
        </svg>
        <div style="width: 1px; height: 32px; border-right: 1px solid #e1e5ea; margin-left: 9px"></div>
        <img src='${logoUrl}' style="width: 40px; height: 40px; margin-left: 16px"/>
      </div>
      ${createMainMenu(data)}
      <div style="flex: 0; display: flex; flex-direction: row; justify-content: space-between; align-items: center">
        <img src='${sponsorUrl}' style="width: 57px; height: 40px; margin: -6px 9px 0 10px"/>
        <svg focusable="false" width="24" height="24" style="margin-right: 9px; filter: invert(75%) sepia(18%) saturate(182%) hue-rotate(178deg) brightness(95%) contrast(87%);">
          <use xlink:href="/blocks/header/cibeles-sprite.svg#dots-v"></use>
        </svg>
        <button class="login-button">
          <svg focusable="false" width="16" height="16" aria-hidden="true" style="margin-left: 0px; filter: invert(26%) sepia(75%) saturate(7487%) hue-rotate(245deg) brightness(95%) contrast(107%);">
            <use xlink:href="/blocks/header/cibeles-sprite.svg#profile"></use>
          </svg>
          Acceso
        </button>
      </div>
    </div>
  `));
}
