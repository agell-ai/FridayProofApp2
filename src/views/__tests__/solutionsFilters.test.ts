import type { ClientLibraryItem, ClientTemplate } from '../../types';

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

const run = async () => {
  const { isMarketplaceTemplateAsset, isTemplateAsset } = await import('../solutionsFilters.js');

  const templates: ClientTemplate[] = [
    {
      id: 'temp-1',
      name: 'Order Fulfillment Template',
      category: 'E-commerce',
      usage: 12,
      lastModified: '2024-01-20',
      isTemplate: true,
    },
    {
      id: 'sys-1',
      name: 'Order Processing Workflow',
      category: 'E-commerce',
      usage: 0,
      lastModified: '2024-01-20',
      isTemplate: false,
    },
    {
      id: 'sys-2',
      name: 'Support Ticket Router',
      category: 'Customer Service',
      usage: 0,
      lastModified: '2024-01-21',
      isTemplate: false,
    },
    {
      id: 'sys-3',
      name: 'Invoice Processing Engine',
      category: 'Finance',
      usage: 0,
      lastModified: '2024-01-22',
      isTemplate: false,
    },
  ];

  const eligibleTemplateNames = templates.filter(isTemplateAsset).map((template) => template.name);

  assert(
    eligibleTemplateNames.length === 1 && eligibleTemplateNames[0] === 'Order Fulfillment Template',
    'Library filter should only include published templates.',
  );
  ['Order Processing Workflow', 'Support Ticket Router', 'Invoice Processing Engine'].forEach((name) => {
    assert(
      !eligibleTemplateNames.includes(name),
      `Library filter should exclude non-template asset "${name}".`,
    );
  });

  const libraryItems: ClientLibraryItem[] = [
    {
      id: 'lib-6',
      name: 'Order Fulfillment Template',
      type: 'template',
      category: 'E-commerce',
      createdAt: '2024-01-18',
      templateId: 'temp-1',
    },
    {
      id: 'lib-7',
      name: 'Order Processing Workflow',
      type: 'workflow',
      category: 'E-commerce',
      createdAt: '2024-01-18',
    },
    {
      id: 'lib-8',
      name: 'Support Ticket Router',
      type: 'component',
      category: 'Customer Service',
      createdAt: '2024-01-19',
    },
    {
      id: 'lib-9',
      name: 'Invoice Processing Engine',
      type: 'workflow',
      category: 'Finance',
      createdAt: '2024-01-20',
    },
  ];

  const eligibleMarketplaceNames = libraryItems
    .filter(isMarketplaceTemplateAsset)
    .map((item) => item.name);

  assert(
    eligibleMarketplaceNames.length === 1 && eligibleMarketplaceNames[0] === 'Order Fulfillment Template',
    'Marketplace filter should only include template contributions.',
  );
  ['Order Processing Workflow', 'Support Ticket Router', 'Invoice Processing Engine'].forEach((name) => {
    assert(
      !eligibleMarketplaceNames.includes(name),
      `Marketplace filter should exclude non-template asset "${name}".`,
    );
  });

  console.log('solutionsFilters tests passed');
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
