import React, { useEffect, useState } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nextProvider } from 'react-i18next';
import i18n, { ensureI18nInitialized, SupportedLang, supportedLngs } from '@/i18n';

const STORAGE_KEY = 'app.language';

const [I18nContext, useI18n] = createContextHook(() => {
  const [language, setLanguageState] = useState<SupportedLang>('it');
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        const lang = (saved as SupportedLang | null) ?? undefined;
        ensureI18nInitialized(lang);
        const current = (lang ?? (i18n.language as SupportedLang)) || 'it';
        setLanguageState(current);
        setIsReady(true);
      } catch (e) {
        ensureI18nInitialized();
        setLanguageState((i18n.language as SupportedLang) || 'it');
        setIsReady(true);
      }
    };
    load();
  }, []);

  const setLanguage = async (lng: SupportedLang) => {
    try {
      await i18n.changeLanguage(lng);
      setLanguageState(lng);
      await AsyncStorage.setItem(STORAGE_KEY, lng);
    } catch (e) {
      console.log('changeLanguage error', e);
    }
  };

  return {
    isReady,
    language,
    setLanguage,
    supported: supportedLngs,
  } as const;
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <I18nextProvider i18n={i18n}>
      <I18nContext>{children}</I18nContext>
    </I18nextProvider>
  );
};

export { useI18n };

export type I18nContextType = ReturnType<typeof useI18n>;
