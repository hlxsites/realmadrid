import { readBlockConfig, loadBlock } from '../../scripts/lib-franklin.js';

export default async function decorate(block) {
  // get config entries
  const cfg = readBlockConfig(block);
  const {
    pretitle, title, promo, desktop, navigation, mobile, tours,
  } = cfg;
  const promoTitle = cfg['promo-title'];

  // create basic dom structure
  const dom = document.createRange().createContextualFragment(`
      <div class='content'>
        <div class='content-wrapper'>
          <div class='ticket-container'>
          </div>
        </div>
      </div>
      <div class='background'>
      </div>
  `);

  // shortcuts
  const ticketContainer = dom.querySelector('.ticket-container');
  const background = dom.querySelector('.background');

  // if a pretitle is defined
  if (pretitle) {
    const preTitleElem = document.createElement('p');
    preTitleElem.classList.add('pretitle');
    preTitleElem.textContent = pretitle;
    ticketContainer.before(preTitleElem);
  }

  // if title is defined
  if (title) {
    const titleElem = document.createElement('h1');
    titleElem.textContent = title;
    ticketContainer.before(titleElem);
  }

  // if navigation is defined
  if (navigation) {
    const resp = await fetch(`${navigation}.plain.html`);
    if (resp.ok) {
      // create the nav element
      const divNavContainer = document.createElement('div');
      divNavContainer.classList.add('navcontainer');
      const navElem = document.createElement('nav');
      divNavContainer.append(navElem);
      ticketContainer.before(divNavContainer);
      // get the navigation table from the fragment
      const navEntries = document.createRange().createContextualFragment(await resp.text()).querySelector('.navigation');
      // add entries
      [...navEntries.children].forEach((navEntry) => {
        const a = navEntry.children[1].children[0];
        a.style.setProperty('--nav-icon', `'${navEntry.children[0].textContent.trim()}'`);
        const href = a.getAttribute('href');
        // if its the current page
        if (href.endsWith(document.location.pathname)) {
          a.classList.add('selected');
        }
        // if its an external link
        if (href.indexOf('www.realmadrid.') === -1) {
          a.style.setProperty('--external-icon', "'\\e916'");
        }
        navElem.append(a);
      });
    }
  }

  // if promo text and/or promo title is defined
  if (promo || promoTitle) {
    const promoElem = document.createElement('p');
    promoElem.classList.add('promo');
    if (promoTitle) {
      const strong = document.createElement('strong');
      strong.textContent = promoTitle;
      promoElem.append(strong);
    }
    if (promo) {
      promoElem.append(` ${promo}`);
    }
    ticketContainer.before(promoElem);
  }

  // if background is defined
  if (desktop) {
    // get the picture element
    const imageName = desktop.substring(desktop.lastIndexOf('media_'), desktop.indexOf('?'));
    const picture = block.querySelector(`:scope img[src*="${imageName}"`).parentElement;
    picture.classList.add('desktop');
    background.append(picture);
  }

  if (mobile) {
    // get the picture element
    const imageName = mobile.substring(mobile.lastIndexOf('media_'), mobile.indexOf('?'));
    const picture = block.querySelector(`:scope img[src*="${imageName}"`).parentElement;
    picture.classList.add('mobile');
    background.append(picture);
  }

  block.textContent = '';
  block.append(dom);

  // what tours are offered
  if (tours) {
    // start list
    const ul = document.createElement('ul');
    ticketContainer.append(ul);

    tours.forEach(async (tour) => {
      const li = document.createElement('li');
      ul.append(li);
      // read tour data from detail page
      const resp = await fetch(`${tour}.plain.html`);
      if (resp.ok) {
        const ticketCardBlock = document.createRange().createContextualFragment(`
            <div class='ticket-card' data-block-name='ticket-card' >
            <div>
              <div>${tour}</div>
            <div>
          </div>
        `);
        await loadBlock(ticketCardBlock.firstElementChild);
        li.append(ticketCardBlock);
      }
    });
  }
}
