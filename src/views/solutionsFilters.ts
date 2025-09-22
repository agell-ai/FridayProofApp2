import type { ClientLibraryItem, ClientTemplate } from '../types';

export const isTemplateAsset = (
  template: ClientTemplate | null | undefined,
): template is ClientTemplate => Boolean(template?.isTemplate);

export const isMarketplaceTemplateAsset = (
  item: ClientLibraryItem | null | undefined,
): item is ClientLibraryItem => Boolean(item && item.type === 'template' && item.templateId);
