export default async function decorate(block) {
  // mandatory that first row contains link to plan
  const planLink = block.querySelector(':scope > div:first-of-type > div:first-of-type > a');
  if (planLink === null || planLink.getAttribute('href') === null) return;
  const planUrl = planLink.href;
  block.children[0].remove();

  // get all legend entries
  const legendEntries = block.querySelectorAll(':scope > div');

  // clear the block content
  block.textContent = '';

  /* load the stadion svg with the section markers */
  const response = await fetch(planUrl);
  if (response.ok) {
    const svg = await response.text();
    block.innerHTML = svg;
  }

  // create legend table
  const legend = document.createElement('div');
  legend.classList.add('legend');

  // All path classes for filtering in event handler
  const pathClassesFilter = [];

  // set each legend entry
  [...legendEntries].forEach((entry) => {
    // get the current class of the SVG path element
    const svgPathClass = entry.children[0].textContent;
    // collect all path classes for filtering in event handler
    pathClassesFilter.push(svgPathClass);
    // get the link
    const a = entry.children[1].children[0];
    // set classes for entry
    a.removeAttribute('class');
    a.classList.add('legend-entry');
    // get the color from SVG path
    const color = block.querySelector(`path.${svgPathClass}`).getAttribute('fill');
    // property will be picked up by pseudo :before/:after CSS selectors
    a.style.setProperty('--vip-locations-color', color);

    // eventhandler : on mouseover hide all other VIP sections
    a.addEventListener('mouseover', () => {
      pathClassesFilter.forEach((filter) => {
        if (filter !== svgPathClass) {
          const path = block.querySelector(`path.${filter}:not(.${svgPathClass})`);
          if (path) path.style.opacity = 0.1;
        }
      });
    });

    // eventhandler: on exit show all VIP sections again
    a.addEventListener('mouseout', () => {
      pathClassesFilter.forEach((filter) => {
        block.querySelector(`path.${filter}`).style.opacity = 1;
      });
    });

    legend.append(a);
  });

  block.append(legend);
}
