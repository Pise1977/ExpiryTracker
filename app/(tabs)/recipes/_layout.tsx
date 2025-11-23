import { Stack } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function RecipesLayout() {
  const { t } = useTranslation();
  
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: t('titles.recipes'),
          headerBackVisible: false,
        }} 
      />
    </Stack>
  );
}
