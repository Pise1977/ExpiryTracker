import { Product } from '@/types/product';
import * as Print from 'expo-print';


import { Platform } from 'react-native';

export type GroupedProducts = Record<string, Product[]>;

export function groupByPurchaseDate(products: Product[]): GroupedProducts {
  const grouped: GroupedProducts = {};
  for (const p of products) {
    const key = (p.purchaseDate ?? '').toString();
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(p);
  }
  return Object.keys(grouped)
    .sort() // ascending dates
    .reduce((acc, key) => {
      acc[key] = grouped[key].sort((a, b) => (a.name.localeCompare(b.name)));
      return acc;
    }, {} as GroupedProducts);
}

export function exportProductsToCSV(products: Product[]): string {
  const grouped = groupByPurchaseDate(products);
  const headers = ['purchaseDate','name','category','expiryDate','quantity','barcode','nutritionGrade'];
  const rows: string[] = [];
  rows.push(headers.join(','));
  for (const date of Object.keys(grouped)) {
    for (const p of grouped[date]) {
      const values = [
        date,
        escapeCsv(p.name),
        p.category,
        p.expiryDate,
        String(p.quantity ?? 1),
        p.barcode ?? '',
        (p.nutritionGrade ?? '').toUpperCase(),
      ];
      rows.push(values.map(safeCsv).join(','));
    }
  }
  return rows.join('\n');
}

function escapeCsv(input: string): string {
  return input.replace(/"/g, '""');
}
function safeCsv(input: string): string {
  const mustQuote = /[",\n]/.test(input);
  const v = escapeCsv(input);
  return mustQuote ? `"${v}"` : v;
}

export function exportProductsToPDFHtml(products: Product[]): string {
  const grouped = groupByPurchaseDate(products);
  const html = `<!doctype html>
<html>
<head>
  <meta charset=\"utf-8\" />
  <title>Dispensa - Esportazione Prodotti</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif; margin: 24px; color: #111827; }
    h1 { font-size: 20px; margin: 0 0 16px; }
    .date { background: #ECFDF5; color: #065F46; padding: 8px 12px; border-radius: 8px; display: inline-block; margin: 24px 0 8px; font-weight: 700; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
    th, td { font-size: 12px; padding: 10px; border-bottom: 1px solid #E5E7EB; text-align: left; }
    th { background: #F9FAFB; font-weight: 700; }
    .qty { text-align: center; }
    .muted { color: #6B7280; }
    footer { margin-top: 24px; font-size: 10px; color: #6B7280; }
  </style>
</head>
<body>
  <h1>Esportazione Prodotti per Data di Acquisto</h1>
  ${Object.keys(grouped).map(date => `
    <div class=\"date\">${date}</div>
    <table>
      <thead>
        <tr>
          <th>Nome</th>
          <th>Categoria</th>
          <th>Scadenza</th>
          <th class=\"qty\">Quantità</th>
          <th>Barcode</th>
          <th>Qualità</th>
        </tr>
      </thead>
      <tbody>
        ${grouped[date].map(p => `
          <tr>
            <td>${escapeHtml(p.name)}</td>
            <td class=\"muted\">${escapeHtml(p.category)}</td>
            <td>${escapeHtml(p.expiryDate)}</td>
            <td class=\"qty\">${String(p.quantity ?? 1)}</td>
            <td class=\"muted\">${escapeHtml(p.barcode ?? '')}</td>
            <td>${escapeHtml((p.nutritionGrade ?? '').toUpperCase())}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `).join('')}
  <footer>Generato da La mia Dispensa</footer>
</body>
</html>`;
  return html;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function buildWebDataUrl(content: string, mime: string): string {
  if (typeof window === 'undefined') return '';
  const encoded = encodeURIComponent(content);
  return `data:${mime};charset=utf-8,${encoded}`;
}

export async function saveProductsPdfToApp(products: Product[]): Promise<{ uri: string }> {
  const html = exportProductsToPDFHtml(products);
  if (Platform.OS === 'web') {
    throw new Error('saveProductsPdfToApp non supportato sul web');
  }
  const { uri } = await Print.printToFileAsync({ html });
  return { uri };
}
