import { getCurrentLanguage, isLanguageSupported, SupportedLang } from '@/i18n';

export function getActiveLanguage(): SupportedLang {
  return getCurrentLanguage();
}

export function getLanguageName(lang: SupportedLang): string {
  const names: Record<SupportedLang, string> = {
    it: 'Italiano',
    en: 'English',
    fr: 'Français',
    es: 'Español',
  };
  return names[lang] || names.it;
}

export function getLanguageFlag(lang: SupportedLang): string {
  const flags: Record<SupportedLang, string> = {
    it: '🇮🇹',
    en: '🇬🇧',
    fr: '🇫🇷',
    es: '🇪🇸',
  };
  return flags[lang] || flags.it;
}

export function formatTranslationKey(namespace: string, key: string): string {
  return `${namespace}.${key}`;
}

export function isRTL(lang: SupportedLang): boolean {
  return false;
}

export function validateLanguageCode(code: string): SupportedLang {
  if (isLanguageSupported(code)) {
    return code;
  }
  const prefix = code.substring(0, 2).toLowerCase();
  if (prefix === 'it') return 'it';
  if (prefix === 'en') return 'en';
  if (prefix === 'fr') return 'fr';
  if (prefix === 'es') return 'es';
  return 'it';
}

export { getCurrentLanguage, isLanguageSupported };
export type { SupportedLang };
