export default function createTopMenu(data) {
  const menuItems = data.data.header.items[0].additionalNavigation.map((nav) => (
    `<li><a class='top-menu-item' href="${nav.url}">${nav.title}</a></li>`
  )).join('');
  return `
    <ul class='top-menu'>${menuItems}</ul>
  `;
}
