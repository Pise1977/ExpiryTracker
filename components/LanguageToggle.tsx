import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react-native';
import { useI18n } from '@/contexts/I18nContext';
import { getLanguageFlag, SupportedLang } from '@/utils/i18nUtils';

export function LanguageToggle() {
  const { t } = useTranslation();
  const { language, setLanguage, supported } = useI18n();

  const getNextLanguage = (): SupportedLang => {
    const currentIndex = supported.indexOf(language);
    const nextIndex = (currentIndex + 1) % supported.length;
    return supported[nextIndex];
  };

  const handleToggle = async () => {
    const nextLang = getNextLanguage();
    console.log('[LanguageToggle] Switching language from', language, 'to', nextLang);
    await setLanguage(nextLang);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleToggle}
      activeOpacity={0.7}
      testID="language-toggle"
      accessibilityLabel={t('settings.language')}
      accessibilityHint={t('settings.chooseLanguage')}
    >
      <Languages size={18} color="#6B9B7E" />
      <Text style={styles.text}>
        {getLanguageFlag(language)} {language.toUpperCase()}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(107, 155, 126, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  text: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#333',
  },
});
