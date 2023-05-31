import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import { getVipAreaIndexPath } from '../../scripts/scripts.js';

const AREAS_VIP_DETAIL = 'vip-area-detail';

async function fetchVIPAreas() {
  try {
    const vipAreaIndexPath = getVipAreaIndexPath(new URL(window.location));
    const resp = await fetch(vipAreaIndexPath);
    const json = await resp.json();
    return json.data.filter((area) => area.category === AREAS_VIP_DETAIL);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(`unable to fetch vip areas ${e}`);
  }
  return [];
}

function areaElement(area) {
  const breakpoints = [
    { media: '(max-width: 480px)', width: '480' },
    { media: '(min-width: 480px) and (max-width: 600px)', width: '600' },
    { media: '(min-width: 600px) and (max-width: 750px)', width: '750' },
    { media: '(min-width: 750px) and (max-width: 990px)', width: '960' },
    { media: '(min-width: 990px) and (max-width:1200px)', width: '480' },
    { media: '(min-width: 1200px)', width: '960' },
  ];
  const picture = createOptimizedPicture(area.image, area.title, false, breakpoints);
  const li = document.createElement('li');
  li.innerHTML = `
    <a href="${area.path}">
      <div class="info">
        <h3>${area.title}</h3>
        <p>${area.description}</p>
      </div>
    </a>
  `;
  const anchor = li.querySelector('a');
  anchor.insertAdjacentElement('afterbegin', picture);
  return li;
}

/**
 * decorates the vip areas block. Makes a query to get the available VIP areas pages
 * @param {Element} block The VIP areas element
 */
export default async function decorate(block) {
  const vipareas = await fetchVIPAreas();
  const ul = document.createElement('ul');

  vipareas.map(areaElement)
    .forEach((li) => ul.appendChild(li));
  block.append(ul);
}
