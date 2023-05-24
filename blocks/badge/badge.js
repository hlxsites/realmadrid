function styleBlock(block) {
  const badgeElements = block.querySelector('a').children;
  if (badgeElements.length > 2) {
    badgeElements[0].classList.add('background-image');
    badgeElements[1].classList.add('upper-box');
    badgeElements[2].classList.add('lower-box');
  }
}

export default function decorate(block) {
  const elements = [...block.children];
  // wrap link around block
  const badgeLink = elements[0].querySelector('a');
  if (badgeLink != null) {
    const anchorWrapper = document.createElement('a');
    anchorWrapper.setAttribute('href', badgeLink.getAttribute('href'));
    badgeLink.closest('.button-container').remove();
    elements.forEach((el) => {
      anchorWrapper.innerHTML += el.outerHTML;
      el.remove();
    });
    block.prepend(anchorWrapper);
  }
  styleBlock(block);
}
