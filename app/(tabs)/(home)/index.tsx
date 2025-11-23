import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Image,
  Animated,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Plus, Calendar, AlertCircle, Package, ChefHat, Milk, Beef, Fish, Carrot, Apple, Croissant, Snowflake, CupSoda, ShoppingBasket, ChevronDown, ChevronUp, List, X, BadgeCheck, ShoppingCart, FileDown, ArrowLeft } from 'lucide-react-native';
import { useFonts, Baloo2_700Bold } from '@expo-google-fonts/baloo-2';
import { useProducts } from '@/contexts/ProductContext';
import { ProductWithUrgency, ProductCategory } from '@/types/product';
import { CATEGORY_CONFIG } from '@/constants/categories';
import { getUrgencyColor, getUrgencyLabel, formatDate } from '@/utils/dateUtils';
import * as Haptics from 'expo-haptics';
import { AppBackground } from '@/components/AppBackground';



const CATEGORY_ICONS: Record<string, any> = {
  milk: Milk,
  beef: Beef,
  fish: Fish,
  carrot: Carrot,
  apple: Apple,
  croissant: Croissant,
  snowflake: Snowflake,
  package: Package,
  'cup-soda': CupSoda,
  'shopping-basket': ShoppingBasket,
};

export default function HomeScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { getProductsWithUrgency, isLoading } = useProducts();
  const [fontsLoaded] = useFonts({
    Baloo2_700Bold,
  });
  const [filter, setFilter] = useState<'all' | 'expiring'>('all');
  const [viewMode, setViewMode] = useState<'categories' | 'list'>('list');
  const [expandedCategories, setExpandedCategories] = useState<Set<ProductCategory>>(new Set());
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const scrollY = useRef(new Animated.Value(0)).current;
  const calendarHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.4],
    extrapolate: 'clamp',
  });

  const allProducts = getProductsWithUrgency();
  const filteredAll = allProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const expiringProducts = allProducts.filter(p => p.daysUntilExpiry <= 8 && p.daysUntilExpiry >= 0);
  const criticalProducts = allProducts.filter(p => p.daysUntilExpiry <= 2 && p.daysUntilExpiry >= 0);
  
  const displayProducts = filter === 'all' ? allProducts : expiringProducts;

  const handleAddProduct = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/(tabs)/(home)/add-product?autoScan=true');
  };

  const handleProductPress = (productId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push({
      pathname: '/(tabs)/(home)/product-details',
      params: { id: productId },
    });
  };

  const handleRecipesPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/(tabs)/recipes');
  };

  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());

  const handleCalendarPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowCalendar(true);
  };

  const toggleCategory = (category: ProductCategory) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const getCategoryProducts = (category: ProductCategory) => {
    return allProducts.filter(p => p.category === category);
  };

  const getCategoriesWithProducts = () => {
    const categories: ProductCategory[] = ['dairy', 'meat', 'fish', 'vegetables', 'fruits', 'bakery', 'frozen', 'pantry', 'beverages', 'condiments', 'other'];
    return categories.filter(cat => getCategoryProducts(cat).length > 0);
  };

  const toggleViewMode = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setViewMode(viewMode === 'categories' ? 'list' : 'categories');
  };

  const getCalendarDays = () => {
    const year = currentYear;
    const month = currentMonth;
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    
    const days: { date: Date | null; products: ProductWithUrgency[] }[] = [];
    
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ date: null, products: [] });
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const productsForDay = allProducts.filter(p => p.expiryDate === dateStr);
      days.push({ date, products: productsForDay });
    }
    
    return days;
  };

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showProductsModal, setShowProductsModal] = useState<boolean>(false);

  const renderCalendarDay = ({ item }: { item: { date: Date | null; products: ProductWithUrgency[] } }) => {
    if (!item.date) {
      return <View style={styles.calendarDay} />;
    }
    
    const isToday = item.date.toDateString() === new Date().toDateString();
    const dayNumber = item.date.getDate();
    const hasProducts = item.products.length > 0;
    
    return (
      <TouchableOpacity 
        style={[styles.calendarDay, isToday && styles.calendarDayToday]}
        onPress={() => {
          if (hasProducts) {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            setSelectedDate(item.date);
            setShowProductsModal(true);
          }
        }}
        disabled={!hasProducts}
      >
        <Text style={[styles.calendarDayNumber, isToday && styles.calendarDayTextToday]}>
          {dayNumber}
        </Text>
        {hasProducts && (
          <View style={styles.calendarDot}>
            <Text style={styles.calendarDotText}>{item.products.length}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderProduct = ({ item }: { item: ProductWithUrgency }) => {
    const urgencyColor = getUrgencyColor(item.urgency);
    const urgencyLabel = getUrgencyLabel(item.urgency, item.daysUntilExpiry);
    const grade = (item.nutritionGrade ?? '').toUpperCase();
    const gradeMap: Record<string, string> = {
      A: '#16A34A',
      B: '#22C55E',
      C: '#F59E0B',
      D: '#F97316',
      E: '#EF4444',
    };
    const gradeColor = gradeMap[grade] ?? '#9CA3AF';

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => handleProductPress(item.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.urgencyIndicator, { backgroundColor: urgencyColor }]} />
        {item.imageUri && (
          <Image source={{ uri: item.imageUri }} style={styles.productCardImage} />
        )}
        <View style={styles.productContent}>
          <View style={styles.productHeader}>
            <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
            <View style={[styles.urgencyBadge, { backgroundColor: urgencyColor + '20' }]}>
              <Text style={[styles.urgencyText, { color: urgencyColor }]}>
                {urgencyLabel}
              </Text>
            </View>
          </View>
          <View style={styles.productDetails}>
            <View style={styles.detailRow}>
              <Calendar size={16} color="#6B7280" />
              <Text style={styles.detailText}>{t('common.expiresOn')} {formatDate(item.expiryDate)}</Text>
            </View>
            <View style={styles.detailRow}>
              <ShoppingCart size={16} color="#6B7280" />
              <Text style={styles.detailText}>{t('common.quantityLabel')} {item.quantity ?? 1}</Text>
            </View>
            {item.nutritionGrade ? (
              <View style={styles.detailRow}>
                <BadgeCheck size={16} color={gradeColor} />
                <Text style={[styles.detailText, { color: gradeColor }]}>{t('quality.label', { grade: (item.nutritionGrade ?? '').toUpperCase() })}</Text>
              </View>
            ) : null}

            <View style={styles.detailRow}>
              <Package size={16} color="#6B7280" />
              <Text style={styles.detailText}>
                {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <AlertCircle size={64} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>{t('common.noProducts')}</Text>
      <Text style={styles.emptyText}>
        {filter === 'all'
          ? t('common.noProductsHint')
          : t('common.noExpiring')}
      </Text>
    </View>
  );

  if (isLoading || !fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <AppBackground showLogo={true}>
      <View style={styles.container}>
        {criticalProducts.length >= 2 && (
          <TouchableOpacity style={styles.recipeNotification} onPress={handleRecipesPress}>
            <ChefHat size={20} color="#FFFFFF" />
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle} numberOfLines={1} adjustsFontSizeToFit>{t('home.suggestedRecipes')}</Text>
              <Text style={styles.notificationText} numberOfLines={2}>
                {t('home.expiringCount', { count: criticalProducts.length })}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        <Text style={styles.pageTitle}>{t('home.pageTitle')}</Text>

        <View style={styles.headerActions} testID="header-actions">
          <TouchableOpacity style={styles.calendarButton} onPress={handleCalendarPress}>
            <Calendar size={20} color="#FFFFFF" />
            <Text style={styles.calendarButtonText} numberOfLines={1} adjustsFontSizeToFit>{t('common.calendar')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.recipesButton} onPress={() => router.push('/(tabs)/exports')}>
            <FileDown size={20} color="#FFFFFF" />
            <Text style={styles.recipesButtonText} numberOfLines={1} adjustsFontSizeToFit>{t('common.exportList')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, styles.searchFilterButton]}
            onPress={() => setShowSearch(true)}
            testID="open-search"
          >
            <Text style={[styles.filterText]}>
              {t('common.search')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, styles.expiringFilterButton, filter === 'expiring' && styles.filterButtonActive]}
            onPress={() => router.push('/(tabs)/(home)/expiring')}
          >
            <Text style={[styles.filterText, filter === 'expiring' && styles.filterTextActive]}>
              {t('home.expiringBtn', { count: expiringProducts.length })}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.viewModeButton} onPress={toggleViewMode}>
          <List size={20} color="#FFFFFF" />
          <Text style={styles.viewModeButtonText}>
            {viewMode === 'categories' ? t('home.viewList') : t('home.viewCategories')}
          </Text>
        </TouchableOpacity>

        {viewMode === 'categories' ? (
          <Animated.ScrollView
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}
            showsVerticalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true }
            )}
            scrollEventThrottle={16}
          >
            {getCategoriesWithProducts().map((category) => {
              const categoryProducts = getCategoryProducts(category);
              const config = CATEGORY_CONFIG[category];
              const IconComponent = CATEGORY_ICONS[config.icon];
              const isExpanded = expandedCategories.has(category);
              
              return (
                <View key={category} style={styles.categorySection}>
                  <TouchableOpacity
                    style={[styles.categoryHeader, { backgroundColor: config.color }]}
                    onPress={() => toggleCategory(category)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.categoryHeaderLeft}>
                      <View style={styles.categoryIconContainer}>
                        <IconComponent size={24} color="#FFFFFF" />
                      </View>
                      <View>
                        <Text style={styles.categoryTitle} numberOfLines={1} adjustsFontSizeToFit>{config.label}</Text>
                        <Text style={styles.categoryCount}>{t('home.productsCount', { count: categoryProducts.length })}</Text>
                      </View>
                    </View>
                    {isExpanded ? (
                      <ChevronUp size={24} color="#FFFFFF" />
                    ) : (
                      <ChevronDown size={24} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                  {isExpanded && (
                    <View style={styles.categoryProducts}>
                      {categoryProducts.map((product) => (
                        <TouchableOpacity
                          key={product.id}
                          style={styles.categoryProductCard}
                          onPress={() => handleProductPress(product.id)}
                          activeOpacity={0.7}
                        >
                          {product.imageUri && (
                            <Image source={{ uri: product.imageUri }} style={styles.categoryProductImage} />
                          )}
                          <View style={styles.categoryProductContent}>
                            <Text style={styles.categoryProductName} numberOfLines={2}>{product.name}</Text>
                            {product.nutritionGrade ? (
                              <View style={styles.detailRow}>
                                <BadgeCheck size={14} color={(product.nutritionGrade ?? '').toUpperCase() === 'A' ? '#16A34A' : (product.nutritionGrade ?? '').toUpperCase() === 'B' ? '#22C55E' : (product.nutritionGrade ?? '').toUpperCase() === 'C' ? '#F59E0B' : (product.nutritionGrade ?? '').toUpperCase() === 'D' ? '#F97316' : (product.nutritionGrade ?? '').toUpperCase() === 'E' ? '#EF4444' : '#9CA3AF'} />
                                <Text style={[styles.detailText, { color: (product.nutritionGrade ?? '').toUpperCase() === 'A' ? '#16A34A' : (product.nutritionGrade ?? '').toUpperCase() === 'B' ? '#22C55E' : (product.nutritionGrade ?? '').toUpperCase() === 'C' ? '#F59E0B' : (product.nutritionGrade ?? '').toUpperCase() === 'D' ? '#F97316' : (product.nutritionGrade ?? '').toUpperCase() === 'E' ? '#EF4444' : '#6B7280' }]}>{t('quality.label', { grade: (product.nutritionGrade ?? '').toUpperCase() })}</Text>
                              </View>
                            ) : null}
                            <Text style={styles.categoryProductExpiry}>{t('common.expiresOn')} {formatDate(product.expiryDate)}</Text>
                            <Text style={styles.categoryProductExpiry}>{t('common.quantityLabel')} {product.quantity ?? 1}</Text>
                          </View>
                          <View style={[styles.categoryProductUrgency, { backgroundColor: getUrgencyColor(product.urgency) }]} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </Animated.ScrollView>
        ) : (
          <Animated.FlatList
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true }
            )}
            scrollEventThrottle={16}
            data={displayProducts}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={renderEmpty}
            showsVerticalScrollIndicator={false}
          />
        )}

        <TouchableOpacity style={styles.fab} onPress={handleAddProduct} activeOpacity={0.8}>
          <Plus size={28} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.backFab} onPress={() => router.push('/(tabs)/(home)')} activeOpacity={0.8} testID="back-fab">
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>

      <Modal
        visible={showSearch}
        animationType="slide"
        transparent
        onRequestClose={() => setShowSearch(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.productsModalContent}>
            <View style={styles.productsModalHeader}>
              <Text style={styles.productsModalTitle}>{t('common.searchProducts')}</Text>
              <TouchableOpacity onPress={() => setShowSearch(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
              <View style={{ backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 }}>
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder={t('common.searchPlaceholder')}
                  placeholderTextColor="#9CA3AF"
                  style={{ fontSize: 16, color: '#111827' }}
                />
              </View>
            </View>
            <ScrollView style={{ maxHeight: 400 }}>
              {filteredAll.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={styles.productModalCard}
                  onPress={() => {
                    setShowSearch(false);
                    handleProductPress(p.id);
                  }}
                >
                  {p.imageUri && (
                    <Image source={{ uri: p.imageUri }} style={styles.productModalImage} />
                  )}
                  <View style={styles.productModalContent}>
                    <Text style={styles.productModalName}>{p.name}</Text>
                    {p.nutritionGrade ? (
                      <Text style={{ fontSize: 12, fontWeight: '700', color: (p.nutritionGrade ?? '').toUpperCase() === 'A' ? '#16A34A' : (p.nutritionGrade ?? '').toUpperCase() === 'B' ? '#22C55E' : (p.nutritionGrade ?? '').toUpperCase() === 'C' ? '#F59E0B' : (p.nutritionGrade ?? '').toUpperCase() === 'D' ? '#F97316' : (p.nutritionGrade ?? '').toUpperCase() === 'E' ? '#EF4444' : '#6B7280' }}>{t('quality.label', { grade: (p.nutritionGrade ?? '').toUpperCase() })}</Text>
                    ) : null}
                    <Text style={styles.productModalCategory}>
                      {CATEGORY_CONFIG[p.category].label}
                    </Text>
                  </View>
                  <View style={[styles.productModalUrgency, { backgroundColor: getUrgencyColor(p.urgency) }]} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showCalendar}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCalendar(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.navButton}
                onPress={() => {
                  if (currentMonth === 0) {
                    setCurrentMonth(11);
                    setCurrentYear(currentYear - 1);
                  } else {
                    setCurrentMonth(currentMonth - 1);
                  }
                }}
              >
                <Text style={styles.navButtonText}>←</Text>
              </TouchableOpacity>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalTitle}>
                  {new Date(currentYear, currentMonth).toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' })}
                </Text>
                <TouchableOpacity 
                  style={styles.todayButton}
                  onPress={() => {
                    setCurrentMonth(new Date().getMonth());
                    setCurrentYear(new Date().getFullYear());
                  }}
                >
                  <Text style={styles.todayButtonText}>{t('common.today')}</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity 
                style={styles.navButton}
                onPress={() => {
                  if (currentMonth === 11) {
                    setCurrentMonth(0);
                    setCurrentYear(currentYear + 1);
                  } else {
                    setCurrentMonth(currentMonth + 1);
                  }
                }}
              >
                <Text style={styles.navButtonText}>→</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => {
                  setShowCalendar(false);
                  setCurrentMonth(new Date().getMonth());
                  setCurrentYear(new Date().getFullYear());
                }}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.calendarWeekDays}>
              {[t('home.weekDays.sun'), t('home.weekDays.mon'), t('home.weekDays.tue'), t('home.weekDays.wed'), t('home.weekDays.thu'), t('home.weekDays.fri'), t('home.weekDays.sat')].map((day) => (
                <Text key={day} style={styles.weekDayText}>{day}</Text>
              ))}
            </View>

            <FlatList
              data={getCalendarDays()}
              renderItem={renderCalendarDay}
              keyExtractor={(item, index) => `day-${index}`}
              numColumns={7}
              scrollEnabled={true}
              contentContainerStyle={styles.calendarGridContent}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={showProductsModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowProductsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.productsModalContent}>
            <View style={styles.productsModalHeader}>
              <Text style={styles.productsModalTitle}>
                {t('modals.productsExpiringOn', { date: selectedDate?.toLocaleDateString() })}
              </Text>
              <TouchableOpacity onPress={() => setShowProductsModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.productsModalList}>
              {selectedDate && allProducts
                .filter(p => p.expiryDate === selectedDate.toISOString().split('T')[0])
                .map((product) => (
                  <TouchableOpacity
                    key={product.id}
                    style={styles.productModalCard}
                    onPress={() => {
                      setShowProductsModal(false);
                      handleProductPress(product.id);
                    }}
                  >
                    {product.imageUri && (
                      <Image source={{ uri: product.imageUri }} style={styles.productModalImage} />
                    )}
                    <View style={styles.productModalContent}>
                      <Text style={styles.productModalName}>{product.name}</Text>
                      <Text style={styles.productModalCategory}>
                        {CATEGORY_CONFIG[product.category].label}
                      </Text>
                    </View>
                    <View style={[styles.productModalUrgency, { backgroundColor: getUrgencyColor(product.urgency) }]} />
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EDE7E0',
  },
  recipeNotification: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    backgroundColor: '#9D7FF5',
    borderRadius: 20,
    shadowColor: '#9D7FF5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  notificationText: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '700' as const,
    fontStyle: 'italic' as const,
    color: '#000000',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
    fontFamily: 'Baloo2_700Bold',
  },
  headerActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 12,
  },
  calendarButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: '#FF9770',
    borderRadius: 16,
    shadowColor: '#FF9770',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  calendarButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  recipesButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: '#5B7FFF',
    borderRadius: 16,
    shadowColor: '#5B7FFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  recipesButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  calendarContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    padding: 16,
  },
  calendarHeader: {
    marginBottom: 16,
    alignItems: 'center',
  },
  calendarMonthTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
    textTransform: 'capitalize',
  },
  calendarWeekDays: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDayWrapper: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 2,
  },
  calendarDay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  calendarDayToday: {
    backgroundColor: '#10B981',
  },
  calendarDayNumber: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#111827',
  },
  calendarDayTextToday: {
    color: '#FFFFFF',
  },
  calendarDot: {
    marginTop: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarDotText: {
    fontSize: 8,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 8,
    gap: 12,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  searchFilterButton: {
    borderWidth: 0,
    backgroundColor: '#FFFFFF',
    shadowColor: '#5B7FFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  expiringFilterButton: {
    backgroundColor: '#FFF4E6',
    borderWidth: 0,
    shadowColor: '#FFB647',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  filterButtonActive: {
    backgroundColor: '#10B981',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  urgencyIndicator: {
    width: 6,
  },
  productCardImage: {
    width: 84,
    height: 84,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    marginLeft: 12,
  },
  productContent: {
    flex: 1,
    padding: 16,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
    marginRight: 8,
  },
  urgencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  urgencyText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  productDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#5B7FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#5B7FFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  backFab: {
    position: 'absolute',
    left: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#4A4E5C',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  viewModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 14,
    backgroundColor: '#FF6B9D',
    borderRadius: 16,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  viewModeButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  categoriesContainer: {
    flex: 1,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  categorySection: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  categoryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  categoryCount: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  categoryProducts: {
    backgroundColor: '#F9FAFB',
    padding: 12,
  },
  categoryProductCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  categoryProductImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginRight: 12,
  },
  categoryProductContent: {
    flex: 1,
  },
  categoryProductName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 4,
  },
  categoryProductExpiry: {
    fontSize: 13,
    color: '#6B7280',
  },
  categoryProductUrgency: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitleContainer: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#111827',
    textTransform: 'capitalize',
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#111827',
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#10B981',
    borderRadius: 8,
  },
  todayButtonText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarGridContent: {
    paddingBottom: 20,
  },
  productsModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '90%',
    maxHeight: '70%',
    padding: 20,
  },
  productsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  productsModalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
    flex: 1,
  },
  productsModalList: {
    maxHeight: 400,
  },
  productModalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  productModalImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    marginRight: 12,
  },
  productModalContent: {
    flex: 1,
  },
  productModalName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 4,
  },
  productModalCategory: {
    fontSize: 13,
    color: '#6B7280',
  },
  productModalUrgency: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
});
