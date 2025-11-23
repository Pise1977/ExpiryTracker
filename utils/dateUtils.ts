import { UrgencyLevel } from '@/types/product';

export function getDaysUntilExpiry(expiryDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

export function getUrgencyLevel(daysUntilExpiry: number): UrgencyLevel {
  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 2) return 'critical';
  if (daysUntilExpiry <= 4) return 'warning';
  if (daysUntilExpiry <= 8) return 'caution';
  return 'safe';
}

export function getUrgencyColor(urgency: UrgencyLevel): string {
  switch (urgency) {
    case 'expired':
      return '#8B0000';
    case 'critical':
      return '#DC2626';
    case 'warning':
      return '#F97316';
    case 'caution':
      return '#FBBF24';
    case 'safe':
      return '#10B981';
  }
}

export function getUrgencyLabel(urgency: UrgencyLevel, days: number): string {
  if (urgency === 'expired') return 'Scaduto';
  if (days === 0) return 'Scade oggi';
  if (days === 1) return 'Scade domani';
  return `Scade tra ${days} giorni`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}
