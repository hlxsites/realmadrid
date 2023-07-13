import { decorateIcons, createOptimizedPicture } from '../../scripts/lib-franklin.js';
import { getVIPAreaLangRoot } from '../../scripts/scripts.js';

async function getVIPQueryindex(vipRoot) {
  const resp = await fetch(`${vipRoot}/query-index.json`);
  return resp.ok ? (await resp.json()).data : null;
}

async function addNavigation(block) {
  // get language dependent root
  const vipRoot = getVIPAreaLangRoot();
  const currentPath = document.location.pathname;
  // no navigation for VIP root page
  // if (currentPath === vipRoot) return;

  // get query index for this language
  const index = await getVIPQueryindex(vipRoot);
  if (index === null) return;

  // nav container div
  const nav = document.createElement('div');
  nav.classList.add('navigation');

  // get parent path
  const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
  // get index entry for parent
  const parentIndex = index.find((parentEntry) => parentEntry.path === parentPath);
  if (parentIndex) {
    nav.append(document.createRange().createContextualFragment(`
    <a href='${parentPath}'class='parent'><span class='icon icon-arrow-right'></span>${parentIndex.title}</a>
    `));
  }

  // add direct children
  const childrenDepth = currentPath.split('/').length + 1;
  const childrenDiv = document.createElement('div');
  childrenDiv.classList.add('children');
  index.forEach((entry) => {
    if (entry.path.startsWith(currentPath) && entry.path.split('/').length === childrenDepth
    && entry.category !== 'vip-area-detail') {
      childrenDiv.append(document.createRange().createContextualFragment(`
      <a href='${entry.path}'class='child'></span>${entry.title}</a>
      `));
    }
  });
  if (childrenDiv.hasChildNodes()) {
    nav.append(childrenDiv);
  }

  decorateIcons(nav);
  // append navigation block
  block.prepend(nav);
}

function createVideo(block) {
  const anchors = [...block.querySelectorAll('a[href$=".mp4"]')];
  const screens = ['desktop', 'mobile'];
  const videos = anchors.map((a, i) => {
    const video = document.createElement('video');
    video.setAttribute('loop', '');
    video.setAttribute('muted', '');
    video.muted = true;
    video.setAttribute('playsInline', '');
    video.setAttribute('autoplay', '');
    video.innerHTML = `<source src="${a.href}" type="video/mp4" />`;
    if (screens[i]) {
      video.setAttribute(`data-screen-${screens[i]}`, '');
    }
    return video;
  });
  if (videos.length === 1) { // if there is only 1 video show it on mobile as well
    videos[0].setAttribute('data-screen-mobile', '');
  }
  const div = document.createElement('div');
  div.classList.add('video');
  div.append(...videos);
  return div;
}

export default async function decorate(block) {
  const heroContent = block.querySelector(':scope > div > div');
  const heroPic = block.querySelector(':scope picture');
  let heroVideo;
  if (block.classList.contains('hero-video')) {
    const videoContent = heroContent.querySelector(':scope > div');
    heroVideo = createVideo(videoContent);
    videoContent.remove();
  }
  if (heroPic) {
    const img = heroPic.querySelector('img');
    heroPic.remove();
    const optimizedHeroPic = createOptimizedPicture(img.src, img.alt, false, [{ media: '(min-width: 600px)', width: '2000' }, { width: '1200' }]);
    block.append(optimizedHeroPic);
  } else if (heroVideo) {
    block.append(heroVideo);
  }
  if (heroContent) {
    if (heroContent.parentElement) {
      heroContent.parentElement.remove();
      // Remove button class from all except first link
      Array.from(heroContent.querySelectorAll('.button:not(:first-of-type)'))
        .forEach((button) => {
          button.classList.remove('button');
        });
    }
    heroContent.classList.add('hero-content');
    block.append(heroContent);
  }

  // add navigation to hero block
  addNavigation(block);

  return block;
}
