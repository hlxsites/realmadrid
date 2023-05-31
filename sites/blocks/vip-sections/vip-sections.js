/*
 * VIP Section Block
 */

import { createOptimizedPicture } from '../../scripts/lib-franklin.js';

/**
 * Loads a fragment.
 * @param {string} path The path to the fragment
 * @returns {HTMLElement} The root element of the fragment
 */
async function loadFragment(path) {
  if (path && path.startsWith('/')) {
    const resp = await fetch(`${path}.plain.html`);
    if (resp.ok) {
      const main = document.createElement('main');
      main.innerHTML = await resp.text();
      return main;
    }
  }
  return null;
}

function transformToSectionsUnorderedList(input, excludedSectionPath) {
  const vipSections = input.querySelector('.vip-sections');
  const ul = document.createElement('ul');

  vipSections.querySelectorAll(':scope div > div').forEach((section) => {
    // mark download links
    const pdfAnchor = section.querySelector('p > a[href$=".pdf"]');
    if (pdfAnchor) {
      pdfAnchor.setAttribute('download', 'download');
    }

    const anchor = section.querySelector('p > a:first-of-type');
    if (!anchor || anchor.href.endsWith(excludedSectionPath)) {
      return; // exclude current section, exclude sections without path
    }

    const breakpoints = [
      { media: '(max-width: 990px)', width: '960' },
      { media: '(min-width: 990px) and (max-width: 1200px)', width: '480' },
      { media: '(min-width: 1200px)', width: '600' },
    ];

    const img = section.querySelector('p > picture > img');
    const picture = createOptimizedPicture(img.src, anchor.textContent, false, breakpoints);

    anchor.innerHTML = `
      ${picture.outerHTML}
      <div class="info">
        <h3>${anchor.textContent}</h3>
        ${anchor.parentNode.nextElementSibling.outerHTML}
      </div>
    `;

    const li = document.createElement('li');
    li.innerHTML = `
      ${anchor.outerHTML}
      ${pdfAnchor ? pdfAnchor.outerHTML : ''}
    `;
    ul.appendChild(li);
  });

  vipSections.replaceChildren(ul);
  return vipSections;
}

export default async function decorate(block) {
  // load fragment
  const fragmentBlockDiv = block.querySelector(':scope > div > div');
  const fragmentPath = fragmentBlockDiv ? fragmentBlockDiv.textContent : null;
  const fragment = await loadFragment(fragmentPath);

  if (fragment) {
    // current vip section
    const pathSegments = new URL(block.baseURI).pathname.split('/');
    const excludedSectionPath = pathSegments[pathSegments.length - 1];

    // turn into list
    const vipSections = transformToSectionsUnorderedList(fragment, excludedSectionPath);
    block.replaceChildren(vipSections);
  }
}
