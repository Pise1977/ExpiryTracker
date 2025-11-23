import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import it from '@/locales/it.json';
import en from '@/locales/en.json';
import fr from '@/locales/fr.json';
import es from '@/locales/es.json';

export const supportedLngs = ['it','en','fr','es'] as const;
export type SupportedLang = typeof supportedLngs[number];

function detectDeviceLang(): SupportedLang {
  const locales = Localization.getLocales();
  const primary = locales && locales.length > 0 ? locales[0].languageCode : 'it';
  const code = (primary || 'it').toLowerCase();
  if (supportedLngs.includes(code as SupportedLang)) return code as SupportedLang;
  if (code.startsWith('it')) return 'it';
  if (code.startsWith('en')) return 'en';
  if (code.startsWith('fr')) return 'fr';
  if (code.startsWith('es')) return 'es';
  return 'it';
}

export function ensureI18nInitialized(initialLang?: SupportedLang) {
  if (!i18n.isInitialized) {
    i18n
      .use(initReactI18next)
      .init({
        resources: {
          it: { translation: it },
          en: { translation: en },
          fr: { translation: fr },
          es: { translation: es },
        },
        lng: initialLang ?? detectDeviceLang(),
        fallbackLng: 'it',
        supportedLngs: Array.from(supportedLngs),
        interpolation: { escapeValue: false },
        returnEmptyString: false,
      })
      .catch((e) => console.log('i18n init error', e));
  }
  return i18n;
}

export function getCurrentLanguage(): SupportedLang {
  if (!i18n.isInitialized) {
    console.warn('i18n not initialized yet, returning default language');
    return 'it';
  }
  const current = i18n.language as SupportedLang;
  return supportedLngs.includes(current) ? current : 'it';
}

export function isLanguageSupported(lang: string): lang is SupportedLang {
  return supportedLngs.includes(lang as SupportedLang);
}

export default i18n;
