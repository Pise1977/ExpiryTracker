import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppBackground } from '@/components/AppBackground';
import { useProducts } from '@/contexts/ProductContext';
import { useTranslation } from 'react-i18next';
import { exportProductsToCSV, exportProductsToPDFHtml, buildWebDataUrl, groupByPurchaseDate, saveProductsPdfToApp } from '@/utils/exports';
import * as Clipboard from 'expo-clipboard';
import { FileDown, Copy, Download, ExternalLink, Save, ArrowLeft } from 'lucide-react-native';
import { Product } from '@/types/product';
import { useRouter } from 'expo-router';

export default function ExportsScreen() {
  const { t } = useTranslation();
  const { products } = useProducts();
  const [copied, setCopied] = useState<'csv' | 'pdf' | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedUri, setSavedUri] = useState<string | null>(null);

  const grouped = useMemo(() => groupByPurchaseDate(products as Product[]), [products]);
  const csv = useMemo(() => exportProductsToCSV(products as Product[]), [products]);
  const pdfHtml = useMemo(() => exportProductsToPDFHtml(products as Product[]), [products]);

  const csvUrl = useMemo(() => buildWebDataUrl(csv, 'text/csv'), [csv]);
  const pdfUrl = useMemo(() => buildWebDataUrl(pdfHtml, 'text/html'), [pdfHtml]);

  const handleCopy = async (type: 'csv' | 'pdf') => {
    try {
      if (type === 'csv') {
        await Clipboard.setStringAsync(csv);
      } else {
        await Clipboard.setStringAsync(pdfHtml);
      }
      setCopied(type);
      setTimeout(() => setCopied(null), 1500);
    } catch (e) {
      Alert.alert(t('exports.errorCopying'), t('exports.errorCopying'));
    }
  };

  const handleSavePdfInApp = async () => {
    try {
      setSaving(true);
      const res = await saveProductsPdfToApp(products as Product[]);
      setSavedUri(res.uri);
      Alert.alert(t('exports.saved'), t('exports.saved'));
    } catch (e) {
      Alert.alert(t('exports.errorSaving'), t('exports.errorSaving'));
    } finally {
      setSaving(false);
    }
  };

  const handleOpenPdf = async () => {
    try {
      if (savedUri) {
        await Linking.openURL(savedUri);
        return;
      }
      setSaving(true);
      const res = await saveProductsPdfToApp(products as Product[]);
      setSavedUri(res.uri);
      await Linking.openURL(res.uri);
    } catch (e) {
      Alert.alert(t('exports.errorOpening'), t('exports.errorOpening'));
    } finally {
      setSaving(false);
    }
  };

  const insets = useSafeAreaInsets();
  const router = useRouter();
  return (
    <AppBackground showLogo>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t('exports.title')}</Text>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.csvBtn]}
            onPress={() => handleCopy('csv')}
            testID="copy-csv"
          >
            <Copy size={18} color="#111827" />
            <Text style={styles.actionText}>{copied === 'csv' ? t('exports.copied') : t('exports.copyCsv')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.pdfBtn]}
            onPress={() => handleCopy('pdf')}
            testID="copy-pdf"
          >
            <Copy size={18} color="#111827" />
            <Text style={[styles.actionText, styles.pdfText]} numberOfLines={2}>
              {copied === 'pdf' ? t('exports.copied') : t('exports.copyHtml')}
            </Text>
          </TouchableOpacity>
        </View>

        {Platform.OS === 'web' ? (
          <View style={styles.webDownloads}>
            <a href={csvUrl} download={`dispensa_${Date.now()}.csv`} style={styles.webLink as any}>
              <Download size={18} color="#0EA5E9" />
              <Text style={styles.webLinkText}>{t('exports.downloadCsv')}</Text>
            </a>
            <a href={pdfUrl} download={`dispensa_${Date.now()}.html`} style={styles.webLink as any}>
              <FileDown size={18} color="#10B981" />
              <Text style={styles.webLinkText}>{t('exports.downloadHtml')}</Text>
            </a>
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" style={styles.webLink as any}>
              <ExternalLink size={18} color="#8B5CF6" />
              <Text style={styles.webLinkText}>{t('exports.openPdf')}</Text>
            </a>
          </View>
        ) : (
          <View style={styles.nativeActions}>
            <TouchableOpacity style={[styles.actionBtn, styles.saveBtn]} onPress={handleSavePdfInApp} disabled={saving}>
              <Save size={18} color="#111827" />
              <Text style={styles.actionText} numberOfLines={1} adjustsFontSizeToFit>{saving ? t('exports.saving') : t('exports.savePdf')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.openBtn]} onPress={handleOpenPdf} disabled={saving}>
              <ExternalLink size={18} color="#111827" />
              <Text style={styles.actionText} numberOfLines={1} adjustsFontSizeToFit>{saving ? t('exports.opening') : t('exports.openPdf')}</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.previewCard}>
          <Text style={styles.previewTitle} numberOfLines={1} adjustsFontSizeToFit>{t('exports.preview')}</Text>
          {Object.keys(grouped).length === 0 ? (
            <Text style={styles.empty}>{t('exports.empty')}</Text>
          ) : (
            Object.keys(grouped).map(date => (
              <View key={date} style={styles.group}>
                <Text style={styles.groupDate}>{date}</Text>
                {grouped[date].map((p) => (
                  <View key={p.id} style={styles.row}>
                    <Text style={styles.rowName} numberOfLines={1} adjustsFontSizeToFit>{p.name}</Text>
                    <Text style={styles.rowMeta}>{t('exports.expires')} {p.expiryDate}</Text>
                    <Text style={styles.rowQty}>x{p.quantity ?? 1}</Text>
                  </View>
                ))}
              </View>
            ))
          )}
        </View>
      </ScrollView>
      <TouchableOpacity style={styles.backFab} onPress={() => router.push('/(tabs)/(home)')} activeOpacity={0.8} testID="back-fab">
        <ArrowLeft size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 20, fontWeight: '800' as const, color: '#F9FAFB', marginBottom: 12 },
  actions: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#E5E7EB' },
  csvBtn: { borderColor: '#0EA5E9', backgroundColor: '#E0F2FE' },
  pdfBtn: { borderColor: '#10B981', backgroundColor: '#DCFCE7' },
  actionText: { fontSize: 14, fontWeight: '700' as const, color: '#111827' },
  pdfText: { fontSize: 12 },
  webDownloads: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  webLink: { display: 'flex', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 2, borderColor: '#E5E7EB', textDecorationLine: 'none' },
  webLinkText: { fontSize: 14, fontWeight: '700' as const, color: '#0F172A' },
  nativeActions: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  saveBtn: { borderColor: '#F59E0B', backgroundColor: '#FEF3C7' },
  openBtn: { borderColor: '#8B5CF6', backgroundColor: '#EDE9FE' },
  previewCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  previewTitle: { fontSize: 16, fontWeight: '700' as const, color: '#111827', marginBottom: 8 },
  empty: { color: '#6B7280' },
  group: { marginBottom: 12 },
  groupDate: { backgroundColor: '#ECFDF5', color: '#065F46', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, alignSelf: 'flex-start', fontWeight: '700' as const, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  rowName: { flex: 1, fontSize: 14, fontWeight: '600' as const, color: '#111827' },
  rowMeta: { fontSize: 12, color: '#6B7280' },
  rowQty: { fontSize: 12, fontWeight: '700' as const, color: '#111827', minWidth: 24, textAlign: 'right' },
  backFab: { position: 'absolute', left: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#374151', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
});
