import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Product, ProductWithUrgency } from '@/types/product';
import { getDaysUntilExpiry, getUrgencyLevel } from '@/utils/dateUtils';
import { Alert } from 'react-native';

const STORAGE_KEY = '@food_expiry_products';

export const [ProductProvider, useProducts] = createContextHook(() => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const checkingRef = useRef<boolean>(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setProducts(parsed);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProducts = async (newProducts: Product[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newProducts));
      setProducts(newProducts);
    } catch (error) {
      console.error('Error saving products:', error);
    }
  };

  const getProductsWithUrgency = useCallback((): ProductWithUrgency[] => {
    return products.map(product => {
      const daysUntilExpiry = getDaysUntilExpiry(product.expiryDate);
      const urgency = getUrgencyLevel(daysUntilExpiry);
      return {
        ...product,
        urgency,
        daysUntilExpiry,
      };
    }).sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  }, [products]);

  const getExpiringProducts = useCallback((maxDays: number = 8): ProductWithUrgency[] => {
    return getProductsWithUrgency().filter(p => 
      p.daysUntilExpiry <= maxDays && p.daysUntilExpiry >= 0
    );
  }, [getProductsWithUrgency]);

  const scheduleNotificationForProduct = useCallback(async (product: Product) => {
    console.log(`In-app notification tracking enabled for ${product.name}`);
  }, []);

  const cancelNotificationForProduct = useCallback(async (productId: string) => {
    console.log(`In-app notification tracking removed for product ${productId}`);
  }, []);

  const addProduct = useCallback(async (product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    const updated = [...products, newProduct];
    await saveProducts(updated);
    await scheduleNotificationForProduct(newProduct);
  }, [products, scheduleNotificationForProduct]);

  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    const updated = products.map(p => 
      p.id === id ? { ...p, ...updates } : p
    );
    await saveProducts(updated);
    const updatedProduct = updated.find(p => p.id === id);
    if (updatedProduct) {
      await cancelNotificationForProduct(id);
      await scheduleNotificationForProduct(updatedProduct);
    }
  }, [products, cancelNotificationForProduct, scheduleNotificationForProduct]);

  const deleteProduct = useCallback(async (id: string) => {
    const updated = products.filter(p => p.id !== id);
    await saveProducts(updated);
    await cancelNotificationForProduct(id);
  }, [products, cancelNotificationForProduct]);

  const checkExpiredProducts = useCallback(async () => {
    if (checkingRef.current || products.length === 0) return;
    
    checkingRef.current = true;
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    for (const product of products) {
      const daysUntilExpiry = getDaysUntilExpiry(product.expiryDate);
      const daysExpired = Math.abs(daysUntilExpiry);
      
      if (daysUntilExpiry >= 0) continue;
      
      const lastAlert = product.lastAlertDate ? new Date(product.lastAlertDate) : null;
      const daysSinceLastAlert = lastAlert 
        ? Math.floor((now.getTime() - lastAlert.getTime()) / (1000 * 60 * 60 * 24))
        : 999;
      
      if (daysExpired >= 15) {
        console.log(`Auto-deleting product ${product.name} - expired 15+ days ago`);
        await deleteProduct(product.id);
        continue;
      }
      
      if (daysExpired >= 10 && daysSinceLastAlert >= 1) {
        Alert.alert(
          'Prodotto Scaduto da 10 Giorni',
          `${product.name} è scaduto da ${daysExpired} giorni. Vuoi eliminarlo?`,
          [
            {
              text: 'Mantieni',
              onPress: async () => {
                await updateProduct(product.id, { 
                  lastAlertDate: today,
                  alertCount: (product.alertCount || 0) + 1 
                });
              },
              style: 'cancel'
            },
            {
              text: 'Elimina',
              onPress: async () => await deleteProduct(product.id),
              style: 'destructive'
            }
          ]
        );
      } else if (daysExpired >= 4 && daysExpired < 10 && daysSinceLastAlert >= 1) {
        Alert.alert(
          'Prodotto Scaduto da 4 Giorni',
          `${product.name} è scaduto da ${daysExpired} giorni. Vuoi eliminarlo?`,
          [
            {
              text: 'Mantieni',
              onPress: async () => {
                await updateProduct(product.id, { 
                  lastAlertDate: today,
                  alertCount: (product.alertCount || 0) + 1 
                });
              },
              style: 'cancel'
            },
            {
              text: 'Elimina',
              onPress: async () => await deleteProduct(product.id),
              style: 'destructive'
            }
          ]
        );
      }
    }
    
    checkingRef.current = false;
  }, [products, deleteProduct, updateProduct]);

  useEffect(() => {
    if (products.length > 0) {
      checkExpiredProducts();
    }
    
    const interval = setInterval(() => {
      checkExpiredProducts();
    }, 60000 * 60 * 12);
    
    return () => clearInterval(interval);
  }, [products, checkExpiredProducts]);

  return useMemo(() => ({
    products,
    isLoading,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductsWithUrgency,
    getExpiringProducts,
    scheduleNotificationForProduct,
    cancelNotificationForProduct,
    checkExpiredProducts,
  }), [products, isLoading, addProduct, updateProduct, deleteProduct, getProductsWithUrgency, getExpiringProducts, scheduleNotificationForProduct, cancelNotificationForProduct, checkExpiredProducts]);
});
