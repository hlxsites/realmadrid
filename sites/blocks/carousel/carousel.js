import { createOptimizedPicture } from '../../scripts/lib-franklin.js';

function createButtons() {
  const divButtons = document.createElement('div');
  divButtons.classList.add('carousel-buttons-container');
  divButtons.innerHTML = `<a class="carousel-button carousel-button-prev" aria-label="Previous slide" aria-disabled="false"></a>
                          <a class="carousel-button carousel-button-next" aria-label="Next slide" aria-disabled="false"></a>`;

  return divButtons;
}

function createPicturesContainer(block) {
  const divPicContainer = document.createElement('div');
  divPicContainer.classList.add('carousel-pics-container');
  [...block.children].forEach((child) => divPicContainer.append(child));
  return divPicContainer;
}

function showPic(picNumber, picWidth, carouselPicContainer) {
  const transform = `transform: translate3d(-${picWidth * picNumber}px, 0px, 0px); transition-duration: 300ms;`;
  carouselPicContainer.style.cssText = transform;
}

function showHideButtons(currentPic, maxShift, prevButton, nextButton) {
  prevButton.style.display = currentPic === 0 ? 'none' : '';
  nextButton.style.display = currentPic === maxShift ? 'none' : '';
}

export default function decorate(block) {
  const carouselPicContainer = createPicturesContainer(block);
  const buttonContainer = createButtons();

  block.append(carouselPicContainer);
  block.append(buttonContainer);

  let carouselInterval = null;
  let numPics = 0;
  let currentPic = 0;
  let picContainerStyle = null;

  [...block.querySelectorAll('picture')].forEach((pic) => {
    const div = pic.closest('div');
    const img = pic.querySelector('img');
    if (img) {
      const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ media: '(min-width: 990px)', width: '750' }, { width: '600' }]);
      pic.remove();
      div.append(optimizedPic);
    }
    div.classList.add('pic-container');
    picContainerStyle = picContainerStyle || getComputedStyle(div);
    numPics += 1;
  });

  if (!numPics) {
    return;
  }

  const prevButton = buttonContainer.querySelector('.carousel-button-prev');
  const nextButton = buttonContainer.querySelector('.carousel-button-next');
  // Calculate image with and maximum number of images in the carousel, based on the screen size
  const picWidth = picContainerStyle
    ? parseInt(picContainerStyle.width, 10) + parseInt(picContainerStyle.marginRight, 10) : 0;

  const maxShift = numPics - parseInt(window.innerWidth / picWidth, 10);
  showHideButtons(currentPic, maxShift, prevButton, nextButton);
  // Setup auto shift for the carousel
  carouselInterval = window.setInterval(() => {
    currentPic = (currentPic === maxShift) ? 0 : currentPic + 1;
    showPic(currentPic, picWidth, carouselPicContainer);
    showHideButtons(currentPic, maxShift, prevButton, nextButton);
  }, 5000);

  // add listeners to prev and next buttons
  prevButton.addEventListener('click', () => {
    window.clearInterval(carouselInterval);
    if (currentPic >= 1) {
      currentPic -= 1;
      showPic(currentPic, picWidth, carouselPicContainer);
      showHideButtons(currentPic, maxShift, prevButton, nextButton);
    }
  });

  nextButton.addEventListener('click', () => {
    window.clearInterval(carouselInterval);
    if (currentPic < maxShift) {
      currentPic += 1;
      showPic(currentPic, picWidth, carouselPicContainer);
      showHideButtons(currentPic, maxShift, prevButton, nextButton);
    }
  });
}
