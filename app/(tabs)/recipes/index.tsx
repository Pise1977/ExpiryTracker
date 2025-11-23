import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  TextInput,
  Modal,
  FlatList,
  Image,
} from 'react-native';
import { ChefHat, Clock, Users, Sparkles, Search, X, Check, ArrowLeft } from 'lucide-react-native';
import { useProducts } from '@/contexts/ProductContext';
import { generateText } from '@rork/toolkit-sdk';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

interface Recipe {
  name: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: string;
  servings: string;
}

export default function RecipesScreen() {
  const { t } = useTranslation();
  const { getExpiringProducts, getProductsWithUrgency } = useProducts();
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showProductModal, setShowProductModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState<'single' | 'multiple'>('single');

  const expiringProducts = getExpiringProducts(8);
  const allProducts = getProductsWithUrgency();
  const filteredProducts = allProducts.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const generateRecipes = async (productNames?: string) => {
    const ingredientsToUse = productNames || expiringProducts.map((p) => p.name).join(', ');
    
    if (!ingredientsToUse) {
      setError(t('recipes.noProductToUse'));
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Starting recipe generation with ingredients:', ingredientsToUse);
      
      const prompt = `Suggerisci 3 ricette italiane deliziose che utilizzano questi ingredienti: ${ingredientsToUse}.

Rispondi SOLO con un array JSON valido, senza testo aggiuntivo prima o dopo. Usa ESATTAMENTE questo schema:
[
  {
    "name": "Nome ricetta",
    "ingredients": ["ingrediente 1 con quantità", "ingrediente 2 con quantità"],
    "instructions": ["passo 1 dettagliato", "passo 2 dettagliato"],
    "cookingTime": "30 minuti",
    "servings": "4 persone"
  }
]

Assicurati che:
- Le ricette siano pratiche e realistiche
- Gli ingredienti includano quantità precise
- Le istruzioni siano chiare e dettagliate
- Il JSON sia valido e ben formattato`;

      const result = await generateText({
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      console.log('AI Response received successfully');
      console.log('Response length:', result.length);
      console.log('First 500 chars:', result.substring(0, 500));

      if (result.trim().startsWith('<')) {
        console.error('Received HTML response instead of JSON');
        setError('Errore del servizio AI. Riprova tra qualche secondo.');
        return;
      }

      let cleanedResult = result.trim();
      if (cleanedResult.startsWith('```json')) {
        cleanedResult = cleanedResult.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
      } else if (cleanedResult.startsWith('```')) {
        cleanedResult = cleanedResult.replace(/```\s*/g, '').replace(/```\s*$/g, '');
      }

      const jsonMatch = cleanedResult.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (jsonMatch) {
        try {
          const parsedRecipes = JSON.parse(jsonMatch[0]);
          if (Array.isArray(parsedRecipes) && parsedRecipes.length > 0) {
            setRecipes(parsedRecipes);
            setError('');
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          } else {
            console.error('Parsed result is not a valid array:', parsedRecipes);
            setError('Formato risposta non valido. Riprova.');
          }
        } catch (parseErr) {
          console.error('JSON parse error:', parseErr);
          console.error('Attempted to parse:', jsonMatch[0].substring(0, 200));
          setError('Errore nel parsing della risposta. Riprova.');
        }
      } else {
        console.error('No JSON found in response:', cleanedResult.substring(0, 500));
        setError('Formato risposta non valido. Riprova.');
      }
    } catch (err) {
      console.error('Error generating recipes:', err);
      
      let errorMessage = 'Errore sconosciuto';
      if (err instanceof Error) {
        errorMessage = err.message;
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
      }
      
      if (errorMessage.includes('JSON Parse error') || errorMessage.includes('Unexpected character')) {
        setError('Errore nel formato della risposta. Riprova.');
      } else if (errorMessage.includes('Network') || errorMessage.includes('fetch') || errorMessage.includes('Failed to fetch')) {
        setError('Errore di connessione. Verifica la tua connessione internet e riprova.');
      } else if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
        setError('Timeout della richiesta. Riprova tra qualche secondo.');
      } else if (errorMessage.includes('500') || errorMessage.includes('502') || errorMessage.includes('503')) {
        setError('Servizio temporaneamente non disponibile. Riprova tra qualche secondo.');
      } else {
        setError(`Errore durante la generazione delle ricette. Riprova.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSingleProductRecipe = (productName: string) => {
    setShowProductModal(false);
    setSearchQuery('');
    setSelectedProducts(new Set());
    generateRecipes(productName);
  };

  const toggleProductSelection = (productId: string) => {
    const newSelection = new Set(selectedProducts);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    setSelectedProducts(newSelection);
  };

  const handleMultipleProductsRecipe = () => {
    if (selectedProducts.size === 0) {
      setError(t('recipes.selectAtLeastOne'));
      return;
    }
    const selectedProductNames = allProducts
      .filter(p => selectedProducts.has(p.id))
      .map(p => p.name)
      .join(', ');
    setShowProductModal(false);
    setSearchQuery('');
    setSelectedProducts(new Set());
    generateRecipes(selectedProductNames);
  };

  const renderExpiringProducts = () => (
    <View style={styles.expiringSection}>
      <Text style={styles.sectionTitle}>{t('recipes.expiringProducts')}</Text>
      {expiringProducts.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>{t('recipes.noneIn8Days')}</Text>
        </View>
      ) : (
        <View style={styles.productsGrid}>
          {expiringProducts.slice(0, 6).map((product) => (
            <View key={product.id} style={styles.productChip}>
              <Text style={styles.productChipText}>{product.name}</Text>
              <Text style={styles.productChipDays}>{product.daysUntilExpiry}{t('recipes.daysShort')}</Text>
            </View>
          ))}
          {expiringProducts.length > 6 && (
            <View style={styles.productChip}>
              <Text style={styles.productChipText}>{t('recipes.moreOthers', { count: expiringProducts.length - 6 })}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );

  const renderRecipe = (recipe: Recipe, index: number) => (
    <View key={index} style={styles.recipeCard}>
      <View style={styles.recipeHeader}>
        <ChefHat size={24} color="#10B981" />
        <Text style={styles.recipeName} numberOfLines={2}>{recipe.name}</Text>
      </View>

      <View style={styles.recipeInfo}>
        <View style={styles.infoItem}>
          <Clock size={16} color="#6B7280" />
          <Text style={styles.infoText}>{recipe.cookingTime}</Text>
        </View>
        <View style={styles.infoItem}>
          <Users size={16} color="#6B7280" />
          <Text style={styles.infoText}>{recipe.servings}</Text>
        </View>
      </View>

      <View style={styles.recipeSection}>
        <Text style={styles.recipeSectionTitle}>{t('recipes.ingredients')}</Text>
        {recipe.ingredients.map((ingredient, i) => (
          <Text key={i} style={styles.ingredientText}>
            • {ingredient}
          </Text>
        ))}
      </View>

      <View style={styles.recipeSection}>
        <Text style={styles.recipeSectionTitle}>{t('recipes.preparation')}</Text>
        {recipe.instructions.map((instruction, i) => (
          <Text key={i} style={styles.instructionText}>
            {i + 1}. {instruction}
          </Text>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {renderExpiringProducts()}

        <View style={styles.buttonContainer}>
          {expiringProducts.length > 0 && recipes.length === 0 && (
            <TouchableOpacity
              style={styles.generateButton}
              onPress={() => generateRecipes()}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Sparkles size={24} color="#FFFFFF" />
                  <Text style={styles.generateButtonText}>{t('recipes.generateFromExpiring')}</Text>
                </>
              )}
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.singleProductButton}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              setShowProductModal(true);
            }}
            disabled={isLoading}
          >
            <Search size={20} color="#8B5CF6" />
            <Text style={styles.singleProductButtonText}>{t('recipes.searchByProduct')}</Text>
          </TouchableOpacity>
        </View>

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {recipes.length > 0 && (
          <View style={styles.recipesSection}>
            <View style={styles.recipesSectionHeader}>
              <Text style={styles.sectionTitle} numberOfLines={1} adjustsFontSizeToFit>{t('recipes.suggested')}</Text>
              <TouchableOpacity
                style={styles.regenerateButton}
                onPress={() => generateRecipes()}
                disabled={isLoading}
              >
                <Sparkles size={16} color="#10B981" />
                <Text style={styles.regenerateButtonText}>{t('recipes.regenerate')}</Text>
              </TouchableOpacity>
            </View>
            {recipes.map((recipe, index) => renderRecipe(recipe, index))}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showProductModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowProductModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectionMode === 'single' ? t('recipes.selectSingle') : t('recipes.selectMultiple')}
              </Text>
              <TouchableOpacity onPress={() => {
                setShowProductModal(false);
                setSelectedProducts(new Set());
              }}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.selectionModeContainer}>
              <TouchableOpacity
                style={[styles.selectionModeButton, selectionMode === 'single' && styles.selectionModeButtonActive]}
                onPress={() => {
                  setSelectionMode('single');
                  setSelectedProducts(new Set());
                }}
              >
                <Text style={[styles.selectionModeText, selectionMode === 'single' && styles.selectionModeTextActive]}>
                  {t('recipes.single')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.selectionModeButton, selectionMode === 'multiple' && styles.selectionModeButtonActive]}
                onPress={() => setSelectionMode('multiple')}
              >
                <Text style={[styles.selectionModeText, selectionMode === 'multiple' && styles.selectionModeTextActive]}>
                  {t('recipes.multiple')}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.searchContainer}>
              <Search size={20} color="#6B7280" />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={t('recipes.searchPlaceholder')}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <FlatList
              data={filteredProducts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.productItem,
                    selectionMode === 'multiple' && selectedProducts.has(item.id) && styles.productItemSelected
                  ]}
                  onPress={() => {
                    if (selectionMode === 'single') {
                      handleSingleProductRecipe(item.name);
                    } else {
                      toggleProductSelection(item.id);
                    }
                  }}
                >
                  {item.imageUri && (
                    <Image source={{ uri: item.imageUri }} style={styles.productItemImage} />
                  )}
                  <View style={styles.productItemContent}>
                    <Text style={styles.productItemName}>{item.name}</Text>
                    <Text style={styles.productItemCategory}>
                      {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                    </Text>
                  </View>
                  {selectionMode === 'multiple' ? (
                    <View style={[
                      styles.checkbox,
                      selectedProducts.has(item.id) && styles.checkboxSelected
                    ]}>
                      {selectedProducts.has(item.id) && (
                        <Check size={16} color="#FFFFFF" />
                      )}
                    </View>
                  ) : (
                    <ChefHat size={20} color="#8B5CF6" />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyProductList}>
                  <Text style={styles.emptyProductText}>{t('recipes.notFound')}</Text>
                </View>
              }
            />
            
            {selectionMode === 'multiple' && selectedProducts.size > 0 && (
              <TouchableOpacity
                style={styles.generateMultipleButton}
                onPress={handleMultipleProductsRecipe}
              >
                <Sparkles size={20} color="#FFFFFF" />
                <Text style={styles.generateMultipleButtonText}>
                  {t('recipes.generateMultiple', { count: selectedProducts.size })}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
      <TouchableOpacity style={{ position: 'absolute', left: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#374151', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 }} onPress={() => router.push('/(tabs)/(home)')} activeOpacity={0.8} testID="back-fab">
        <ArrowLeft size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5E6',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  expiringSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  productChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  productChipText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#111827',
  },
  productChipDays: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#F97316',
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 20,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#10B981',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  singleProductButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#8B5CF6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  singleProductButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#8B5CF6',
  },
  errorCard: {
    backgroundColor: '#FEE2E2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
  },
  recipesSection: {
    gap: 16,
  },
  recipesSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  regenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F0FDF4',
  },
  regenerateButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#10B981',
  },
  recipeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  recipeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  recipeName: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#111827',
  },
  recipeInfo: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
  },
  recipeSection: {
    marginBottom: 16,
  },
  recipeSectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 8,
  },
  ingredientText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#111827',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  productItemName: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#111827',
  },
  emptyProductList: {
    padding: 40,
    alignItems: 'center',
  },
  emptyProductText: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectionModeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  selectionModeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  selectionModeButtonActive: {
    backgroundColor: '#8B5CF6',
  },
  selectionModeText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  selectionModeTextActive: {
    color: '#FFFFFF',
  },
  productItemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginRight: 12,
  },
  productItemContent: {
    flex: 1,
  },
  productItemCategory: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  productItemSelected: {
    backgroundColor: '#F3E8FF',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  generateMultipleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    margin: 16,
    paddingVertical: 16,
    backgroundColor: '#10B981',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  generateMultipleButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});
