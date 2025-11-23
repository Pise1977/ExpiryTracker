import { ProductCategory } from '@/types/product';

export interface CategoryConfig {
  color: string;
  icon: string;
  label: string;
}

export const CATEGORY_CONFIG: Record<ProductCategory, CategoryConfig> = {
  dairy: {
    color: '#60A5FA',
    icon: 'milk',
    label: 'Latticini',
  },
  meat: {
    color: '#EF4444',
    icon: 'beef',
    label: 'Carne',
  },
  fish: {
    color: '#06B6D4',
    icon: 'fish',
    label: 'Pesce',
  },
  vegetables: {
    color: '#10B981',
    icon: 'carrot',
    label: 'Verdure',
  },
  fruits: {
    color: '#F59E0B',
    icon: 'apple',
    label: 'Frutta',
  },
  bakery: {
    color: '#D97706',
    icon: 'croissant',
    label: 'Panetteria',
  },
  frozen: {
    color: '#8B5CF6',
    icon: 'snowflake',
    label: 'Surgelati',
  },
  pantry: {
    color: '#A855F7',
    icon: 'package',
    label: 'Dispensa',
  },
  beverages: {
    color: '#EC4899',
    icon: 'cup-soda',
    label: 'Bevande',
  },
  condiments: {
    color: '#84CC16',
    icon: 'package',
    label: 'Condimenti',
  },
  other: {
    color: '#6B7280',
    icon: 'shopping-basket',
    label: 'Altro',
  },
};
