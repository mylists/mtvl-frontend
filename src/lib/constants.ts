export const APP_NAME = import.meta.env.VITE_APP_NAME || 'MTVL';

export function formatPageTitle(...parts: (string | undefined | null)[]): string {
  const filtered = parts.map((p) => p?.trim()).filter(Boolean);
  if (filtered.length === 0) {
    return APP_NAME;
  }
  return `${APP_NAME} · ${filtered.join(' · ')}`;
}
