import { Stack } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function HomeLayout() {
  const { t } = useTranslation();

  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "La Mia Dispensa",
        }} 
      />
      <Stack.Screen 
        name="add-product" 
        options={{ 
          title: t('titles.addProduct'),
          presentation: 'modal',
          headerBackVisible: false,
        }} 
      />
      <Stack.Screen 
        name="product-details" 
        options={{ 
          title: t('titles.productDetails'),
          headerBackVisible: false,
        }} 
      />
      <Stack.Screen 
        name="expiring" 
        options={{ 
          title: t('titles.expiring'),
          headerBackVisible: false,
        }} 
      />
    </Stack>
  );
}
