import { buildBlock, decorateBlock, loadBlock } from '../../scripts/lib-franklin.js';
import { loadFragment } from '../../scripts/scripts.js';

function handleKeyUp(e) {
  const visibleModal = document.querySelector('.area-features .modal.appear');
  if (visibleModal && e.keyCode === 27) {
    // eslint-disable-next-line no-use-before-define
    togglePopup(visibleModal, false);
  }
}

function togglePopup(modal, bShow) {
  const modalOverlay = document.getElementById('modal-overlay');
  modalOverlay.classList.toggle('appear', bShow);
  modal.classList.toggle('appear', bShow);
  document.body.classList.toggle('modal-visible', bShow);
  const body = document.querySelector('body');
  if (bShow) {
    body.addEventListener('keyup', handleKeyUp);
  } else {
    body.removeEventListener('keyup', handleKeyUp);
  }
}

function loadIframe(entries, observer) {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      const li = e.target;
      const iframeLink = li.querySelector('p > a[href$="iframe=true"]');
      if (iframeLink) {
        const { parentElement } = iframeLink;
        const link = iframeLink.href;
        if (link) {
          parentElement.innerHTML = `<iframe src="${link}" allow="fullscreen" frameborder="0"/>`;
        }
      }
      observer.unobserve(li);
    }
  });
}

function enableIframeLoad(li) {
  const options = {
    rootMargin: '0px',
    threshold: 0.5,
  };
  const observer = new IntersectionObserver(loadIframe, options);
  observer.observe(li);
}

function attachEventHandlers(li) {
  const modal = li.querySelector('.modal');
  modal.addEventListener('click', (e) => {
    togglePopup(modal, false);
    e.stopPropagation();
  });
  modal.querySelector('.close').addEventListener('click', () => {
    togglePopup(modal, false);
  });

  li.querySelector('.modal-content').addEventListener('click', (e) => {
    e.stopPropagation();
  });

  li.addEventListener('click', () => {
    togglePopup(modal, true);
    modal.focus();
  });
}

function createModal(icon, heading, content, hasIFrame) {
  const modal = document.createElement('div');
  modal.classList.add('modal');
  modal.setAttribute('tabindex', '-1');
  modal.innerHTML = `
  <div class="modal-content-wrapper ${hasIFrame ? 'iframe-content' : ''}">
  <div class="modal-content">
  <button class="close" tabindex="0"></button>
  <div class="modal-header">
    ${[icon, heading].map((h) => h.outerHTML).join('')}
  </div>
    ${content.map((c) => c.outerHTML).join('')}
  </div>
  <div>
  `;
  return modal;
}

async function loadFragments(items) {
  (await Promise.all([...items].filter((li) => {
    // assumption here is that actual heading in the card will not start with /
    const text = li.querySelector('.cards-card-body:last-child').innerText;
    return text && text.startsWith('/');
  }).map(async (li) => {
    const text = li.querySelector('.cards-card-body:last-child').innerText;
    return [li, await loadFragment(text)];
  }))).forEach(([li, fragment]) => {
    const element = li.querySelector('.cards-card-body:last-child');
    element.innerHTML = '';
    const fragmentSection = fragment.querySelector(':scope .section');
    element.append(...fragmentSection.childNodes);
  });
}

async function makePopupCards(block) {
  const items = block.querySelectorAll('li');
  await loadFragments(items);
  items.forEach((li) => {
    const content = [...li.querySelectorAll('.cards-card-body:last-child p')];
    const icon = li.querySelector('.cards-card-body:first-child span');
    const heading = li.querySelector('.cards-card-body:last-child h3');
    const iframeLink = li.querySelector('p > a[href$="iframe=true"]');
    if (iframeLink) {
      enableIframeLoad(li);
    }
    li.append(createModal(icon, heading, content, iframeLink != null));
    content.forEach((c) => c.remove());
    attachEventHandlers(li);
  });
}

export default async function decorate(block) {
  const cardsBlock = buildBlock('cards', [...block.children].map((x) => [...x.children].map((y) => y.innerHTML)));
  block.innerHTML = '';
  block.append(cardsBlock);
  decorateBlock(cardsBlock);
  await loadBlock(cardsBlock);
  const modalOverlay = document.getElementById('modal-overlay');
  if (!modalOverlay) {
    const div = document.createElement('div');
    div.id = 'modal-overlay';
    document.body.insertAdjacentElement('afterbegin', div);
  }
  makePopupCards(block);
}
