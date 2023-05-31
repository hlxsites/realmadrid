import createPopupMenu from './popupMenu.js';

export default async function addPopupMenuButton(block, data) {
  let state = false;
  const icon = () => {
    const src = `${window.hlx.codeBasePath}/blocks/header/cibeles-sprite.svg#${state ? 'times' : 'menu'}`;
    return `
        <svg focusable="false" width="24" height="24" aria-hidden="true">
            <use xlink:href="${src}"></use>
        </svg>
    `;
  };
  const popup = await createPopupMenu(data);
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
