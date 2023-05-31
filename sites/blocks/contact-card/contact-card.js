export default function decorate(block) {
  const divclasses = ['title', 'telephone', 'contact'];
  block.querySelectorAll(':scope > div')
    .forEach((div, index) => {
      div.classList.add(divclasses[index]);
    });

  Array.from(block.querySelectorAll('.button-container'))
    .forEach((buttonContainer) => {
      let removeButton;
      Array.from(buttonContainer.querySelectorAll('a[href]'))
        .filter((alink) => alink.href.startsWith('mailto:') || alink.href.startsWith('tel:'))
        .forEach((alink) => {
          alink.classList.remove('button', 'primary');
          removeButton = true;
        });
      if (removeButton) {
        buttonContainer.classList.remove('button-container');
      }
    });
}
