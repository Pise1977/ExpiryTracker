import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { AppBackground } from '@/components/AppBackground';
import { useProducts } from '@/contexts/ProductContext';
import { useRouter } from 'expo-router';
import { getUrgencyColor, formatDate } from '@/utils/dateUtils';
import { ArrowLeft } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

export default function ExpiringScreen() {
  const { t } = useTranslation();
  const { getExpiringProducts } = useProducts();
  const router = useRouter();
  const expiring = getExpiringProducts(8);

  return (
    <AppBackground showLogo>
    <View style={styles.container}>
      <FlatList
        data={expiring}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListEmptyComponent={
          <View style={styles.empty}> 
            <Text style={styles.emptyTitle}>{t('expiring.noProducts')}</Text>
            <Text style={styles.emptyText}>{t('expiring.checkLater')}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push({ pathname: '/(tabs)/(home)/product-details', params: { id: item.id } })}>
            <View style={[styles.dot, { backgroundColor: getUrgencyColor(item.urgency) }]} />
            {item.imageUri ? (
              <Image source={{ uri: item.imageUri }} style={styles.image} />
            ) : (
              <View style={[styles.image, { backgroundColor: '#F3F4F6' }]} />
            )}
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>{t('expiring.expires')} {formatDate(item.expiryDate)}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity style={styles.backFab} onPress={() => router.push('/(tabs)/(home)')} activeOpacity={0.8} testID="back-fab">
        <ArrowLeft size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 24 },
  empty: { padding: 40, alignItems: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '700' as const, color: '#111827', marginBottom: 6 },
  emptyText: { fontSize: 14, color: '#6B7280' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  image: { width: 54, height: 54, borderRadius: 8, marginRight: 12 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600' as const, color: '#111827', marginBottom: 2 },
  meta: { fontSize: 13, color: '#6B7280' },
  backFab: {
    position: 'absolute',
    left: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
