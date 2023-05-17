const DATA_URL = 'https://publish-p47754-e237356.adobeaemcloud.com/graphql/execute.json/realmadridmastersite/structurePage%3Balang=es-es';

export default async function fetchMenuData() {
  try {
    const response = await fetch(DATA_URL);
    return await response.json();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
  return null;
}
