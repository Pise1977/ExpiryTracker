export type ProductCategory = 
  | 'dairy'
  | 'meat'
  | 'fish'
  | 'vegetables'
  | 'fruits'
  | 'bakery'
  | 'frozen'
  | 'pantry'
  | 'beverages'
  | 'condiments'
  | 'other';

export type UrgencyLevel = 'expired' | 'critical' | 'warning' | 'caution' | 'safe';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  expiryDate: string;
  purchaseDate: string;
  barcode?: string;
  barcodeImageUri?: string;
  imageUri?: string;
  notes?: string;
  quantity?: number;
  unit?: string;
  lastAlertDate?: string;
  alertCount?: number;
  nutritionGrade?: string;
  nutriments?: Record<string, string | number>;
}

export interface ProductWithUrgency extends Product {
  urgency: UrgencyLevel;
  daysUntilExpiry: number;
}
