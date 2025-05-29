/**
 * Centrální konfigurace barev pro kategorie
 */

export const CATEGORY_COLORS = [
  { name: 'Modrá', value: '#3B82F6' },
  { name: 'Zelená', value: '#22C55E' },
  { name: 'Červená', value: '#EF4444' },
  { name: 'Žlutá', value: '#EAB308' },
  { name: 'Fialová', value: '#8B5CF6' },
  { name: 'Růžová', value: '#EC4899' },
  { name: 'Oranžová', value: '#F97316' },
  { name: 'Šedá', value: '#6B7280' },
  { name: 'Indigo', value: '#4F46E5' },
  { name: 'Tyrkysová', value: '#06B6D4' }
];

export const DEFAULT_CATEGORY_COLOR = '#6B7280';

/**
 * Získá název barvy podle hex hodnoty (s fallbackem)
 */
export function getCategoryColorName(hex?: string | null): string {
  if (!hex) return 'Šedá';
  
  const color = CATEGORY_COLORS.find(c => c.value === hex);
  return color?.name || hex; // Fallback na hex hodnotu
}

/**
 * Získá bezpečnou barvu s fallbackem
 */
export function getSafeColor(hex?: string | null): string {
  if (!hex) return DEFAULT_CATEGORY_COLOR;
  
  const isValid = CATEGORY_COLORS.some(c => c.value === hex);
  return isValid ? hex : DEFAULT_CATEGORY_COLOR;
}