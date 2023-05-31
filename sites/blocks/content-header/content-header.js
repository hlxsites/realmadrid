async function getTitle(path) {
  const resp = await fetch(`${path}`);
  if (resp.ok) {
    const text = await resp.text();
    return document.createRange().createContextualFragment(text).querySelector('title')?.innerText;
  }
  return '';
}

export default function decorate(block) {
  block.textContent = '';
  const title = document.querySelector('title')?.innerText;
  // init header DOM structure
  const dom = document.createRange().createContextualFragment(`
    <h1>${title}</h1>
    <div itemscope itemtype="http://schema.org/WebPage" class="breadcrumb">
      <div itemprop="breadcrumb" class="breadcrumb-items">
      </div>
    </div>
  `);
  // get current path
  const curPath = document.location.pathname;
  // breadcrumb parent div
  const breadcrumb = dom.querySelector('.breadcrumb-items');
  // go through all sub paths
  curPath.split('/').reduce(async (prevSubPath, nextPathElem) => {
    const nextSubPath = `${await prevSubPath}/${nextPathElem}`;
    // if not the current page
    if (nextSubPath !== curPath) {
      const a = document.createElement('a');
      a.setAttribute('href', nextSubPath);
      const parentTitle = await getTitle(nextSubPath);
      if (parentTitle !== '') {
        a.innerText = parentTitle;
        breadcrumb.append(a);
        breadcrumb.append(' · ');
      }
    } else {
      const span = document.createElement('span');
      span.textContent = title;
      breadcrumb.append(span);
    }
    return nextSubPath;
  });
  block.append(dom);
}
