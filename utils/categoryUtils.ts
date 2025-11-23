import { ProductCategory } from '@/types/product';
import i18n from '@/i18n';

export function getCategoryLabel(category: ProductCategory): string {
  return i18n.t(`categories.${category}`);
}
