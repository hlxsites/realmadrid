import { createOptimizedPicture } from '../../scripts/lib-franklin.js';

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
      video.setAttribute('data-screen', screens[i]);
    }
    return video;
  });
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
  return block;
}
