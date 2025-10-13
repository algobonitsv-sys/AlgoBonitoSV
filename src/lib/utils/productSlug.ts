import type { Product } from '@/types/database';

const NAME_ID_SEPARATOR = '--';

const slugifyName = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const buildProductSlug = (product: Pick<Product, 'id' | 'name'>): string => {
  return buildProductSlugFromParts(product.name, product.id);
};

export const buildProductSlugFromParts = (name: string, id: string): string => {
  const base = slugifyName(name);
  if (!id) {
    return base;
  }
  return `${base}${NAME_ID_SEPARATOR}${id}`;
};

export const parseProductSlug = (slug: string): { id: string | null; nameSegment: string } => {
  if (!slug) {
    return { id: null, nameSegment: '' };
  }

  const separatorIndex = slug.lastIndexOf(NAME_ID_SEPARATOR);
  if (separatorIndex === -1) {
    return { id: null, nameSegment: slugifyName(slug) };
  }

  const nameSegment = slug.slice(0, separatorIndex) || '';
  const id = slug.slice(separatorIndex + NAME_ID_SEPARATOR.length) || null;

  return {
    id,
    nameSegment: slugifyName(nameSegment),
  };
};

export const reconstructNameFromSlug = (nameSegment: string): string => {
  if (!nameSegment) {
    return '';
  }

  return nameSegment
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};