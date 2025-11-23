import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  Image,
  TextInput,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Trash2, Calendar, Package, ShoppingCart, FileText, ChefHat, Edit3, Save, X, ImageUp, Camera, Plus, Minus, ArrowLeft } from 'lucide-react-native';
import { useProducts } from '@/contexts/ProductContext';
import { getUrgencyColor, getUrgencyLabel, formatDate } from '@/utils/dateUtils';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { ProductCategory } from '@/types/product';
import { CATEGORY_CONFIG } from '@/constants/categories';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { AppBackground } from '@/components/AppBackground';
import { useTranslation } from 'react-i18next';
import { getCategoryLabel } from '@/utils/categoryUtils';

export default function ProductDetailsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getProductsWithUrgency, deleteProduct, updateProduct } = useProducts();

  const product = getProductsWithUrgency().find((p) => p.id === id);

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [localName, setLocalName] = useState<string>(product?.name ?? '');
  const [localCategory, setLocalCategory] = useState<ProductCategory>(product?.category ?? 'other');
  const [localQuantity, setLocalQuantity] = useState<number>(product?.quantity ?? 1);
  const [localImageUri, setLocalImageUri] = useState<string>(product?.imageUri ?? '');
  const [day, setDay] = useState<string>(() => (product ? product.expiryDate.split('-')[2] : ''));
  const [month, setMonth] = useState<string>(() => (product ? product.expiryDate.split('-')[1] : ''));
  const [year, setYear] = useState<string>(() => (product ? product.expiryDate.split('-')[0] : ''));
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [showImageOptions, setShowImageOptions] = useState<boolean>(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);

  const urgencyColor = product ? getUrgencyColor(product.urgency) : '#10B981';
  const urgencyLabel = product ? getUrgencyLabel(product.urgency, product.daysUntilExpiry) : '';

  const [isFetchingYuka, setIsFetchingYuka] = useState<boolean>(false);

  const nutritionBadge = useMemo(() => {
    const grade = (product?.nutritionGrade ?? '').toUpperCase();
    const map: Record<string, { color: string; label: string }> = {
      A: { color: '#16A34A', label: 'Qualità A' },
      B: { color: '#22C55E', label: 'Qualità B' },
      C: { color: '#F59E0B', label: 'Qualità C' },
      D: { color: '#F97316', label: 'Qualità D' },
      E: { color: '#EF4444', label: 'Qualità E' },
    };
    return map[grade] ?? null;
  }, [product?.nutritionGrade]);

  if (!product) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{t('productDetails.productNotFound')}</Text>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      t('productDetails.deleteProduct'),
      t('productDetails.deleteConfirm', { name: product.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            deleteProduct(id);
            router.back();
          },
        },
      ]
    );
  };

  const handleRecipes = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/(tabs)/recipes');
  };

  const startEditing = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setLocalName(product.name);
    setLocalCategory(product.category);
    setLocalQuantity(product.quantity ?? 1);
    setLocalImageUri(product.imageUri ?? '');
    setDay(product.expiryDate.split('-')[2]);
    setMonth(product.expiryDate.split('-')[1]);
    setYear(product.expiryDate.split('-')[0]);
  };

  const fetchFromYuka = async () => {
    if (!product) return;
    try {
      setIsFetchingYuka(true);
      const code = product.barcode?.trim();
      let fetched: any | null = null;

      if (code) {
        const resp = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`, { headers: { 'User-Agent': 'FoodExpiryApp/1.0' } });
        const json = await resp.json();
        if (json.status === 1 && json.product) {
          fetched = json.product;
        }
      }

      if (!fetched) {
        const q = encodeURIComponent(product.name);
        const resp = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${q}&search_simple=1&json=1&page_size=1`, { headers: { 'User-Agent': 'FoodExpiryApp/1.0' } });
        const json = await resp.json();
        fetched = json.products?.[0];
      }

      if (fetched) {
        const grade: string | undefined = fetched.nutrition_grade_fr;
        const nutriments = fetched.nutriments ?? undefined;
        await updateProduct(product.id, {
          nutritionGrade: grade || undefined,
          nutriments,
        });
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        Alert.alert('Yuka', t('productDetails.yukaUpdated'));
      } else {
        Alert.alert('Yuka', t('productDetails.yukaNoResult'));
      }
    } catch (e) {
      console.log('Yuka fetch error', e);
      Alert.alert(t('addProduct.errorSaving'), t('productDetails.yukaError'));
    } finally {
      setIsFetchingYuka(false);
    }
  };

  const saveEdits = async () => {
    if (!localName.trim()) {
      Alert.alert(t('addProduct.errorSaving'), t('productDetails.enterProductName'));
      return;
    }
    if (!day || !month || !year) {
      Alert.alert(t('addProduct.errorSaving'), t('productDetails.enterCompleteDate'));
      return;
    }
    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);
    if (
      isNaN(dayNum) ||
      isNaN(monthNum) ||
      isNaN(yearNum) ||
      dayNum < 1 ||
      dayNum > 31 ||
      monthNum < 1 ||
      monthNum > 12 ||
      yearNum < 2024
    ) {
      Alert.alert(t('addProduct.errorSaving'), t('productDetails.invalidDate'));
      return;
    }
    const isoDate = `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    await updateProduct(product.id, {
      name: localName.trim(),
      category: localCategory,
      quantity: localQuantity,
      imageUri: localImageUri || undefined,
      expiryDate: isoDate,
    });
    setIsEditing(false);
  };

  const pickFromGallery = async () => {
    if (Platform.OS !== 'web') {
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      selectionLimit: 1,
    });
    if (!res.canceled && res.assets && res.assets[0]?.uri) {
      setLocalImageUri(res.assets[0].uri);
    }
  };

  const openCamera = async () => {
    if (!cameraPermission?.granted) {
      const r = await requestCameraPermission();
      if (!r?.granted) {
        Alert.alert(t('addProduct.permissionRequired'), t('addProduct.cameraPermissionGeneric'));
        return;
      }
    }
    setShowCamera(true);
  };

  const takePhoto = async () => {
    try {
      if (cameraRef.current?.takePictureAsync) {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.7, base64: false });
        if (photo?.uri) setLocalImageUri(photo.uri);
      }
    } catch (e) {
      console.log('Errore scatto foto', e);
    } finally {
      setShowCamera(false);
    }
  };

  return (
    <AppBackground showLogo>
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {((product.imageUri || localImageUri) || isEditing) && (
          <View style={styles.imageCard}>
            {product.imageUri || localImageUri ? (
              <TouchableOpacity activeOpacity={0.8} onPress={() => isEditing && setShowImageOptions(true)}>
                <Image source={{ uri: isEditing ? localImageUri || product.imageUri! : product.imageUri! }} style={styles.productImage} />
              </TouchableOpacity>
            ) : (
              isEditing ? (
                <TouchableOpacity style={styles.placeholderImage} onPress={() => setShowImageOptions(true)}>
                  <Camera size={28} color="#6B7280" />
                  <Text style={styles.placeholderText}>{t('productDetails.addPhoto')}</Text>
                </TouchableOpacity>
              ) : null
            )}
            {isEditing && (
              <View style={styles.imageActions}>
                <TouchableOpacity onPress={pickFromGallery} style={styles.imageActionBtn} testID="pick-from-gallery">
                  <ImageUp size={18} color="#111827" />
                  <Text style={styles.imageActionText}>{t('addProduct.gallery')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={openCamera} style={styles.imageActionBtn} testID="open-camera">
                  <Camera size={18} color="#111827" />
                  <Text style={styles.imageActionText}>{t('addProduct.camera')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        <Modal visible={showImageOptions} transparent animationType="fade" onRequestClose={() => setShowImageOptions(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.optionsSheet}>
              {(product.imageUri || localImageUri) ? (
                <>
                  <TouchableOpacity style={styles.optionRow} onPress={() => { setLocalImageUri(''); setShowImageOptions(false); }} testID="remove-image">
                    <Trash2 size={18} color="#DC2626" />
                    <Text style={[styles.optionText, { color: '#DC2626' }]}>{t('productDetails.removePhoto')}</Text>
                  </TouchableOpacity>
                  <View style={styles.optionDivider} />
                </>
              ) : null}
              <TouchableOpacity style={styles.optionRow} onPress={() => { setShowImageOptions(false); pickFromGallery(); }} testID="option-gallery">
                <ImageUp size={18} color="#111827" />
                <Text style={styles.optionText}>{t('productDetails.chooseGallery')}</Text>
              </TouchableOpacity>
              <View style={styles.optionDivider} />
              <TouchableOpacity style={styles.optionRow} onPress={() => { setShowImageOptions(false); openCamera(); }} testID="option-camera">
                <Camera size={18} color="#111827" />
                <Text style={styles.optionText}>{t('productDetails.takeNewPhoto')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeSheetBtn} onPress={() => setShowImageOptions(false)}>
                <X size={20} color="#6B7280" />
                <Text style={styles.closeSheetText}>{t('common.close')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <View style={[styles.urgencyCard, { backgroundColor: urgencyColor + '15' }]}>
          <View style={styles.yukaRow}>
            <TouchableOpacity style={styles.yukaButton} onPress={fetchFromYuka} disabled={isFetchingYuka} testID="yuka-refresh">
              <Text style={styles.yukaButtonText}>{isFetchingYuka ? t('productDetails.updating') : t('productDetails.updateWithYuka')}</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.urgencyLabel, { color: urgencyColor }]}>{urgencyLabel}</Text>
          {isEditing ? (
            <TextInput
              style={styles.nameInput}
              value={localName}
              onChangeText={setLocalName}
              placeholder={t('addProduct.productName')}
              placeholderTextColor="#9CA3AF"
              testID="name-input"
            />
          ) : (
            <Text style={styles.productName} numberOfLines={2} adjustsFontSizeToFit>{product.name}</Text>
          )}

          {product.nutritionGrade && (
            <View style={[styles.nutritionBadge, { backgroundColor: (nutritionBadge?.color ?? '#E5E7EB') + '30', borderColor: nutritionBadge?.color ?? '#E5E7EB' }]}>
              <Text style={[styles.nutritionText, { color: nutritionBadge?.color ?? '#6B7280' }]}>{t('productDetails.nutritionQuality', { grade: (product.nutritionGrade ?? '').toUpperCase() })}</Text>
            </View>
          )}
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <View style={styles.iconContainer}>
              <Calendar size={20} color="#10B981" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>{t('productDetails.expiryDate')}</Text>
              {isEditing ? (
                <View style={styles.dateRow}>
                  <TextInput
                    style={[styles.dateInput, styles.datePart]}
                    value={day}
                    onChangeText={setDay}
                    keyboardType="numeric"
                    maxLength={2}
                    placeholder={t('addProduct.dayPlaceholder')}
                    placeholderTextColor="#9CA3AF"
                    testID="expiry-day"
                  />
                  <Text style={styles.dateSep}>/</Text>
                  <TextInput
                    style={[styles.dateInput, styles.datePart]}
                    value={month}
                    onChangeText={setMonth}
                    keyboardType="numeric"
                    maxLength={2}
                    placeholder={t('addProduct.monthPlaceholder')}
                    placeholderTextColor="#9CA3AF"
                    testID="expiry-month"
                  />
                  <Text style={styles.dateSep}>/</Text>
                  <TextInput
                    style={[styles.dateInput, styles.dateYear]}
                    value={year}
                    onChangeText={setYear}
                    keyboardType="numeric"
                    maxLength={4}
                    placeholder={t('addProduct.yearPlaceholder')}
                    placeholderTextColor="#9CA3AF"
                    testID="expiry-year"
                  />
                </View>
              ) : (
                <Text style={styles.detailValue}>{formatDate(product.expiryDate)}</Text>
              )}
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.detailRow}>
            <View style={styles.iconContainer}>
              <Package size={20} color="#10B981" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>{t('productDetails.category')}</Text>
              {isEditing ? (
                <View style={styles.categoryGrid}>
                  {Object.keys(CATEGORY_CONFIG).map((key) => {
                    const k = key as ProductCategory;
                    return (
                      <TouchableOpacity
                        key={k}
                        style={[styles.categoryButton, localCategory === k && styles.categoryButtonActive]}
                        onPress={() => setLocalCategory(k)}
                        testID={`category-${k}`}
                      >
                        <Text style={[styles.categoryText, localCategory === k && styles.categoryTextActive]}>
                          {getCategoryLabel(k)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <Text style={styles.detailValue}>
                  {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.detailRow}>
            <View style={styles.iconContainer}>
              <ShoppingCart size={20} color="#10B981" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>{t('productDetails.quantity')}</Text>
              {isEditing ? (
                <View style={styles.quantityRow}>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => setLocalQuantity(Math.max(1, localQuantity - 1))} testID="qty-decrease">
                    <Minus size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                  <Text style={styles.quantityValue} testID="qty-value">{localQuantity}</Text>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => setLocalQuantity(localQuantity + 1)} testID="qty-increase">
                    <Plus size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.detailValue}>{product.quantity ?? 1}</Text>
              )}
            </View>
          </View>

          {product.notes && !isEditing && (
            <>
              <View style={styles.separator} />
              <View style={styles.detailRow}>
                <View style={styles.iconContainer}>
                  <FileText size={20} color="#10B981" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>{t('productDetails.notes')}</Text>
                  <Text style={styles.detailValue}>{product.notes}</Text>
                </View>
              </View>
            </>
          )}
        </View>

        <TouchableOpacity style={styles.recipesButton} onPress={handleRecipes} testID="recipes-btn">
          <ChefHat size={20} color="#FFFFFF" />
          <Text style={styles.recipesButtonText}>{t('productDetails.findRecipes', { name: product.name })}</Text>
        </TouchableOpacity>

        {!isEditing ? (
          <TouchableOpacity style={styles.editButton} onPress={startEditing} testID="edit-btn">
            <Edit3 size={20} color="#111827" />
            <Text style={styles.editButtonText}>{t('common.edit')}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.editActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={cancelEditing} testID="cancel-edit">
              <X size={20} color="#6B7280" />
              <Text style={styles.cancelText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={saveEdits} testID="save-edit">
              <Save size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>{t('common.save')}</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} testID="delete-btn">
          <Trash2 size={20} color="#DC2626" />
          <Text style={styles.deleteButtonText}>{t('productDetails.deleteProduct')}</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showCamera} animationType="slide">
        <View style={styles.cameraContainer}>
          <CameraView ref={cameraRef} style={styles.camera} facing="back">
            <View style={styles.cameraOverlay}>
              <View style={styles.cameraHeader}>
                <Text style={styles.cameraTitle}>{t('productDetails.takePhoto')}</Text>
                <Text style={styles.cameraSubtitle}>{t('productDetails.alignCenter')}</Text>
              </View>
              <View style={styles.scanArea} />
              <View style={styles.cameraActions}>
                <TouchableOpacity style={styles.skipButton} onPress={() => setShowCamera(false)}>
                  <X size={24} color="#FFFFFF" />
                  <Text style={styles.skipButtonText}>{t('common.close')}</Text>
                </TouchableOpacity>
                <View style={{ height: 12 }} />
                <TouchableOpacity style={styles.skipButton} onPress={takePhoto}>
                  <Text style={styles.skipButtonText}>{t('addProduct.takePhoto')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </CameraView>
        </View>
      </Modal>
      <TouchableOpacity style={styles.backFab} onPress={() => router.push('/(tabs)/(home)')} activeOpacity={0.8} testID="back-fab">
        <ArrowLeft size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  imageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  productImage: {
    width: 250,
    height: 250,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  placeholderImage: {
    width: 250,
    height: 250,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600' as const,
  },
  imageActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  imageActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  imageActionText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#111827',
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 32,
  },
  urgencyCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  urgencyLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  productName: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#111827',
    textAlign: 'center',
  },
  nameInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
    textAlign: 'center',
  },
  nutritionBadge: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
  },
  nutritionText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
    textAlign: 'center',
  },
  datePart: {
    width: 60,
  },
  dateYear: {
    width: 90,
  },
  dateSep: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#6B7280',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  categoryButtonActive: {
    backgroundColor: '#5B7FFF',
    borderColor: '#5B7FFF',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  yukaRow: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  yukaIcon: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  yukaButton: {
    alignSelf: 'stretch',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  yukaButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#111827',
    textAlign: 'center',
  },
  qtyBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#5B7FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#111827',
    minWidth: 40,
    textAlign: 'center',
  },
  recipesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#9D7FF5',
    borderWidth: 0,
    shadowColor: '#9D7FF5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    marginBottom: 12,
  },
  recipesButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#5B7FFF',
    shadowColor: '#5B7FFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#DC2626',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000000',
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
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  cameraHeader: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  cameraTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  cameraSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  scanArea: {
    alignSelf: 'center',
    width: 280,
    height: 180,
  },
  cameraActions: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    backgroundColor: 'rgba(107, 114, 128, 0.9)',
    borderRadius: 12,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  optionsSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
  },
  optionDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  closeSheetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  closeSheetText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
});
