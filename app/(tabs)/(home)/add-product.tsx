import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Save, X, Plus, Minus, Trash2, ImageUp, Camera, ArrowLeft } from 'lucide-react-native';
import { useProducts } from '@/contexts/ProductContext';
import { ProductCategory } from '@/types/product';
import * as Haptics from 'expo-haptics';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { AppBackground } from '@/components/AppBackground';
import { useTranslation } from 'react-i18next';
import { getCategoryLabel } from '@/utils/categoryUtils';

const CATEGORIES: ProductCategory[] = [
  'dairy', 'meat', 'fish', 'vegetables', 'fruits', 'bakery', 'frozen', 'pantry', 'beverages', 'condiments', 'other'
];

export default function AddProductScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { addProduct } = useProducts();
  const params = useLocalSearchParams<{ autoScan?: string }>();

  const [showScanner, setShowScanner] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<ProductCategory>('other');
  const [day, setDay] = useState<string>('');
  const [month, setMonth] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [imageUri, setImageUri] = useState<string>('');
  const [barcode, setBarcode] = useState<string>('');
  const [nutritionGrade, setNutritionGrade] = useState<string>('');
  const [nutriments, setNutriments] = useState<Record<string, string | number>>({});
  const [showPhotoCam, setShowPhotoCam] = useState<boolean>(false);
  const [showProductCam, setShowProductCam] = useState<boolean>(false);
  const cameraRef = useRef<any>(null);
  const productCamRef = useRef<any>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const scanLockRef = useRef<boolean>(false);
  const dayInputRef = useRef<TextInput>(null);
  const monthInputRef = useRef<TextInput>(null);
  const yearInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (params.autoScan === 'true') {
      console.log('🚀 Auto-scan mode enabled');
      openScanner();
    }
  }, [params.autoScan, cameraPermission?.granted]);

  const openScanner = async () => {
    console.log('📷 Opening scanner...');

    try {
      if (!cameraPermission?.granted) {
        console.log('🔒 Requesting permission...');
        const result = await requestCameraPermission();
        if (!result?.granted) {
          console.log('❌ Permission denied');
          Alert.alert(t('addProduct.permissionRequired'), t('addProduct.cameraPermissionMessage'));
          return;
        }
        console.log('✅ Permission granted');
      }

      scanLockRef.current = false;
      setShowScanner(true);
    } catch (e) {
      console.log('❌ Permission flow error', e);
      Alert.alert(t('addProduct.errorSaving'), t('addProduct.errorOpening'));
    }
  };

  const handleBarcodeScanned = async (scanResult: { data: string }) => {
    if (scanLockRef.current) {
      console.log('⚠️ Scan in progress, ignoring...');
      return;
    }

    scanLockRef.current = true;
    console.log('📦 Barcode scanned:', scanResult.data);

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setShowScanner(false);

    try {
      console.log('🔍 Looking up product...');
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${scanResult.data}.json`,
        { headers: { 'User-Agent': 'FoodExpiryApp/1.0' } }
      );
      const data = await response.json();

      if (data.status === 1 && data.product) {
        const productName = data.product.product_name || data.product.product_name_it;
        const productImage = data.product.image_url || data.product.image_front_url;

        if (productName) {
          console.log('✅ Product found:', productName);
          setName(productName);
          setBarcode(scanResult.data);

          if (productImage) {
            console.log('✅ Image found');
            setImageUri(productImage);
          }

          const grade: string | undefined = data.product.nutrition_grade_fr;
          if (grade) {
            console.log('✅ Nutrition grade found:', grade);
            setNutritionGrade(grade);
          }
          if (data.product.nutriments) {
            setNutriments(data.product.nutriments);
          }

          autoCategorize(productName);
          setTimeout(() => dayInputRef.current?.focus(), 400);
          return;
        }
      }

      console.log('⚠️ Product not found');
      Alert.alert(t('addProduct.productNotFound'), t('addProduct.productNotFoundMessage'));
      setShowPhotoCam(true);
    } catch (error) {
      console.error('❌ Error:', error);
      Alert.alert(t('addProduct.errorSaving'), t('addProduct.errorProduct'));
    } finally {
      scanLockRef.current = false;
    }
  };

  const autoCategorize = (productName: string) => {
    const name = productName.toLowerCase();

    if (name.includes('latte') || name.includes('yogurt') || name.includes('formaggio') || name.includes('mozzarella')) {
      setCategory('dairy');
    } else if (name.includes('carne') || name.includes('manzo') || name.includes('pollo') || name.includes('maiale')) {
      setCategory('meat');
    } else if (name.includes('pesce') || name.includes('salmone') || name.includes('tonno')) {
      setCategory('fish');
    } else if (name.includes('verdur') || name.includes('insalata') || name.includes('pomodor') || name.includes('carota')) {
      setCategory('vegetables');
    } else if (name.includes('mela') || name.includes('banana') || name.includes('arancia') || name.includes('frutta')) {
      setCategory('fruits');
    } else if (name.includes('pane') || name.includes('pizza') || name.includes('focaccia')) {
      setCategory('bakery');
    } else if (name.includes('surgelat') || name.includes('gelato')) {
      setCategory('frozen');
    } else if (name.includes('pasta') || name.includes('riso') || name.includes('farina') || name.includes('olio')) {
      setCategory('pantry');
    } else if (name.includes('acqua') || name.includes('succo') || name.includes('bibita') || name.includes('vino')) {
      setCategory('beverages');
    } else {
      setCategory('other');
    }
  };

  useEffect(() => {
    const lookup = async () => {
      const term = name.trim();
      if (term.length < 3) return;
      try {
        const resp = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(term)}&search_simple=1&json=1&page_size=1`, { headers: { 'User-Agent': 'FoodExpiryApp/1.0' } });
        const json = await resp.json();
        const p = json.products?.[0];
        if (p) {
          if (!imageUri && (p.image_url || p.image_front_url)) {
            setImageUri(p.image_url || p.image_front_url);
          }
          if (!nutritionGrade && p.nutrition_grade_fr) {
            setNutritionGrade(p.nutrition_grade_fr);
          }
          if (p.nutriments && Object.keys(nutriments).length === 0) {
            setNutriments(p.nutriments);
          }
        }
      } catch (e) {
        console.log('Hidden nutrition lookup failed', e);
      }
    };
    lookup();
  }, [name]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(t('addProduct.errorSaving'), t('addProduct.enterProductName'));
      return;
    }

    if (!day.trim() || !month.trim() || !year.trim()) {
      Alert.alert(t('addProduct.errorSaving'), t('addProduct.enterCompleteDate'));
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
      Alert.alert(t('addProduct.errorSaving'), t('addProduct.invalidDate'));
      return;
    }

    const isoDate = `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    addProduct({
      name: name.trim(),
      category,
      expiryDate: isoDate,
      purchaseDate: new Date().toISOString().split('T')[0],
      imageUri: imageUri || undefined,
      quantity,
      barcode: barcode || undefined,
      nutritionGrade: nutritionGrade || undefined,
      nutriments: Object.keys(nutriments).length ? nutriments : undefined,
    });

    router.back();
  };

  const handleCancel = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  const capturePhoto = async () => {
    try {
      if (cameraRef.current?.takePicture) {
        const photo = await cameraRef.current.takePicture();
        if (photo?.uri) {
          setImageUri(photo.uri);
        }
      } else if (cameraRef.current?.takePictureAsync) {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.7, base64: false });
        if (photo?.uri) {
          setImageUri(photo.uri);
        }
      }
      setShowPhotoCam(false);
    } catch (e) {
      console.log('Photo capture failed', e);
      setShowPhotoCam(false);
    }
  };

  useEffect(() => {
    if (showPhotoCam) {
      const timer = setTimeout(() => {
        capturePhoto();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [showPhotoCam]);

  if (showScanner) {
    return (
      <>
        <Modal visible animationType="slide">
          <View style={styles.cameraContainer}>
            <CameraView
              style={styles.camera}
              facing="back"
              barcodeScannerSettings={{
                barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'],
              }}
              enableTorch={false}
              onBarcodeScanned={handleBarcodeScanned}
              testID="barcode-camera"
            >
              <View style={styles.cameraOverlay}>
                <View style={styles.cameraHeader}>
                  <Text style={styles.cameraTitle}>{t('addProduct.scanBarcode')}</Text>
                  <Text style={styles.cameraSubtitle}>{t('addProduct.scanSubtitle')}</Text>
                </View>

                <View style={styles.scanArea}>
                  <View style={[styles.corner, styles.cornerTopLeft]} />
                  <View style={[styles.corner, styles.cornerTopRight]} />
                  <View style={[styles.corner, styles.cornerBottomLeft]} />
                  <View style={[styles.corner, styles.cornerBottomRight]} />
                </View>

                <View style={styles.cameraActions}>
                  <TouchableOpacity
                    style={styles.skipButton}
                    onPress={() => {
                      console.log('⏭️ Skip to manual entry');
                      setShowScanner(false);
                      scanLockRef.current = false;
                    }}
                  >
                    <X size={24} color="#FFFFFF" />
                    <Text style={styles.skipButtonText}>{t('addProduct.insertManually')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </CameraView>
          </View>
        </Modal>

        <Modal visible={showPhotoCam} animationType="slide">
          <View style={styles.cameraContainer}>
            <CameraView ref={cameraRef} style={styles.camera} facing="back">
              <View style={styles.cameraOverlay}>
                <View style={styles.cameraHeader}>
                  <Text style={styles.cameraTitle}>{t('addProduct.photoBarcode')}</Text>
                  <Text style={styles.cameraSubtitle}>{t('addProduct.scanSubtitle')}</Text>
                </View>
                <View style={styles.scanArea} />
                <View style={styles.cameraActions}>
                  <TouchableOpacity style={styles.skipButton} onPress={() => setShowPhotoCam(false)}>
                    <X size={24} color="#FFFFFF" />
                    <Text style={styles.skipButtonText}>{t('common.cancel')}</Text>
                  </TouchableOpacity>
                  <View style={{ height: 12 }} />
                  <TouchableOpacity style={styles.skipButton} onPress={capturePhoto}>
                    <Text style={styles.skipButtonText}>{t('addProduct.takePhoto')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </CameraView>
          </View>
        </Modal>

        <Modal visible={showProductCam} animationType="slide">
          <View style={styles.cameraContainer}>
            <CameraView ref={productCamRef} style={styles.camera} facing="back">
              <View style={styles.cameraOverlay}>
                <View style={styles.cameraHeader}>
                  <Text style={styles.cameraTitle}>{t('addProduct.photoProduct')}</Text>
                  <Text style={styles.cameraSubtitle}>{t('addProduct.scanSubtitle')}</Text>
                </View>
                <View style={styles.scanArea} />
                <View style={styles.cameraActions}>
                  <TouchableOpacity style={styles.skipButton} onPress={() => setShowProductCam(false)}>
                    <X size={24} color="#FFFFFF" />
                    <Text style={styles.skipButtonText}>{t('common.cancel')}</Text>
                  </TouchableOpacity>
                  <View style={{ height: 12 }} />
                  <TouchableOpacity style={styles.skipButton} onPress={async () => {
                    try {
                      if (productCamRef.current?.takePictureAsync) {
                        const photo = await productCamRef.current.takePictureAsync({ quality: 0.7, base64: false });
                        if (photo?.uri) setImageUri(photo.uri);
                      }
                    } catch (e) {
                      console.log('Photo capture failed', e);
                    } finally {
                      setShowProductCam(false);
                    }
                  }}>
                    <Text style={styles.skipButtonText}>{t('addProduct.takePhoto')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </CameraView>
          </View>
        </Modal>
      </>
    );
  }

  return (
    <AppBackground showLogo>
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>{t('addProduct.title')}</Text>

          {imageUri && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.deletePhotoButton} onPress={() => setImageUri('')}>
                <Trash2 size={16} color="#EF4444" />
                <Text style={styles.deletePhotoText}>{t('addProduct.removeImage')}</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.formSection}>
            <Text style={styles.label}>{t('addProduct.photoProduct')}</Text>
            <View style={styles.photoActionsRow}>
              <TouchableOpacity
                style={styles.photoActionBtn}
                onPress={async () => {
                  if (Platform.OS !== 'web') {
                    await ImagePicker.requestMediaLibraryPermissionsAsync();
                  }
                  const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8, selectionLimit: 1 });
                  if (!res.canceled && res.assets && res.assets[0]?.uri) {
                    setImageUri(res.assets[0].uri);
                  }
                }}
                testID="pick-photo"
              >
                <ImageUp size={18} color="#111827" />
                <Text style={styles.photoActionText}>{t('addProduct.gallery')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.photoActionBtn}
                onPress={async () => {
                  if (!cameraPermission?.granted) {
                    const r = await requestCameraPermission();
                    if (!r?.granted) {
                      Alert.alert(t('addProduct.permissionRequired'), t('addProduct.cameraPermissionGeneric'));
                      return;
                    }
                  }
                  setShowProductCam(true);
                }}
                testID="take-photo"
              >
                <Camera size={18} color="#111827" />
                <Text style={styles.photoActionText}>{t('addProduct.camera')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>{t('addProduct.productName')} *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder={t('addProduct.productNamePlaceholder')}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>{t('addProduct.expiryDate')} *</Text>
            <View style={styles.dateInputContainer}>
              <TextInput
                ref={dayInputRef}
                style={styles.dateInput}
                value={day}
                onChangeText={(text) => {
                  setDay(text);
                  if (text.length === 2) {
                    monthInputRef.current?.focus();
                  }
                }}
                placeholder={t('addProduct.dayPlaceholder')}
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                maxLength={2}
              />
              <Text style={styles.dateSeparator}>/</Text>
              <TextInput
                ref={monthInputRef}
                style={styles.dateInput}
                value={month}
                onChangeText={(text) => {
                  setMonth(text);
                  if (text.length === 2) {
                    yearInputRef.current?.focus();
                  }
                }}
                placeholder={t('addProduct.monthPlaceholder')}
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                maxLength={2}
              />
              <Text style={styles.dateSeparator}>/</Text>
              <TextInput
                ref={yearInputRef}
                style={[styles.dateInput, styles.yearInput]}
                value={year}
                onChangeText={setYear}
                placeholder={t('addProduct.yearPlaceholder')}
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                maxLength={4}
              />
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>{t('addProduct.category')}</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryButton, category === cat && styles.categoryButtonActive]}
                  onPress={() => {
                    if (Platform.OS !== 'web') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    setCategory(cat);
                  }}
                >
                  <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>
                    {getCategoryLabel(cat)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>{t('addProduct.quantity')}</Text>
            <View style={styles.quantityRow}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setQuantity(Math.max(1, quantity - 1));
                }}
              >
                <Minus size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.quantityValue}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setQuantity(quantity + 1);
                }}
              >
                <Plus size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <X size={20} color="#6B7280" />
          <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Save size={20} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>{t('common.save')}</Text>
        </TouchableOpacity>
      </View>
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
    padding: 20,
    paddingBottom: 100,
  },
  formContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#F9FAFB',
    marginBottom: 24,
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dateInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#111827',
    textAlign: 'center',
  },
  yearInput: {
    flex: 1.5,
  },
  dateSeparator: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#6B7280',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  categoryButtonActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
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
    justifyContent: 'center',
    gap: 24,
  },
  quantityButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityValue: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#111827',
    minWidth: 60,
    textAlign: 'center',
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  deletePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    marginTop: 12,
  },
  deletePhotoText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#EF4444',
  },
  photoActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  photoActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignSelf: 'flex-start',
  },
  photoActionText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#111827',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
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
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#10B981',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
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
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#10B981',
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
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
});
