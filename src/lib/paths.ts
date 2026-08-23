export const RESERVED_PATHS = new Set(['search', 'login', 'settings', 'dashboard']);

export function normalizeCategorySlug(category: string): string {
  const key = category.toLowerCase();
  if (key === 'tv_shows' || key === 'tv-shows') return 'tvshows';
  return key;
}

export function categoryPath(category: string): string {
  return `/${normalizeCategorySlug(category)}`;
}

export function itemPath(category: string, id: number | string): string {
  return `${categoryPath(category)}/${id}`;
}

export function newItemPath(category: string): string {
  return itemPath(category, 'new');
}

export function searchPath(query?: string): string {
  const trimmed = query?.trim();
  return trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search';
}

export interface AppLocation {
  isDashboard: boolean;
  isSearch: boolean;
  category: string | null;
  itemId: string | null;
}

export function parseAppLocation(pathname: string): AppLocation {
  const parts = pathname.split('/').filter(Boolean);

  if (parts.length === 0 || parts[0] === 'dashboard') {
    return { isDashboard: true, isSearch: false, category: null, itemId: null };
  }

  if (parts[0] === 'search') {
    return { isDashboard: false, isSearch: true, category: null, itemId: null };
  }

  if (RESERVED_PATHS.has(parts[0])) {
    return { isDashboard: false, isSearch: false, category: null, itemId: null };
  }

  return {
    isDashboard: false,
    isSearch: false,
    category: normalizeCategorySlug(parts[0]),
    itemId: parts[1] ?? null,
  };
}

export function isCategoryActive(pathname: string, category: string): boolean {
  const slug = normalizeCategorySlug(category);
  return pathname === `/${slug}` || pathname.startsWith(`/${slug}/`);
}

export function itemShareUrl(category: string, id: number | string): string {
  return `${window.location.origin}${itemPath(category, id)}`;
}
