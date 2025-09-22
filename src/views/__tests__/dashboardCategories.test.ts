import type { MetricCategory } from '../dashboardCategories';

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

const run = async () => {
  const { CATEGORY_METADATA, CATEGORY_ORDER } = await import('../dashboardCategories.js');

  const expectedOrder = ['projects', 'automation', 'clients', 'team'];
  const orderMatches =
    CATEGORY_ORDER.length === expectedOrder.length &&
    CATEGORY_ORDER.every((category: MetricCategory, index: number) => category === expectedOrder[index]);

  assert(orderMatches, 'Dashboard categories should render in the order Projects, Systems, Clients, then Team.');

  const renderedTitles = CATEGORY_ORDER.map(
    (category: MetricCategory) => CATEGORY_METADATA[category].title,
  );
  const expectedTitles = ['Projects', 'Systems', 'Clients', 'Team'];

  expectedTitles.forEach((title, index) => {
    assert(
      renderedTitles[index] === title,
      `Expected "${expectedOrder[index]}" title to be "${title}", received "${renderedTitles[index]}".`,
    );
  });

  console.log('dashboardCategories tests passed');
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
