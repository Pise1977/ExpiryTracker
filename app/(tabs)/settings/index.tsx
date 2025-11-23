import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Languages, Check } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppBackground } from '@/components/AppBackground';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { useI18n } from '@/contexts/I18nContext';
import { SupportedLang } from '@/i18n';

const languageNames: Record<SupportedLang, string> = {
  it: '🇮🇹 Italiano',
  en: '🇬🇧 English',
  fr: '🇫🇷 Français',
  es: '🇪🇸 Español',
};

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const { language, setLanguage, supported } = useI18n();
  const [showLanguageModal, setShowLanguageModal] = useState<boolean>(false);

  const handleLanguageChange = async (lang: SupportedLang) => {
    await setLanguage(lang);
    setShowLanguageModal(false);
  };

  return (
    <AppBackground showLogo showPattern>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.title}>{t('titles.settings')}</Text>
        
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity 
            style={styles.card}
            onPress={() => setShowLanguageModal(true)}
            activeOpacity={0.7}
            testID="language-selector"
          >
            <View style={styles.cardHeader}>
              <Languages size={24} color={COLORS.primary} />
              <Text style={styles.label}>{t('settings.language')}</Text>
            </View>
            <Text style={styles.value}>{languageNames[language]}</Text>
            <Text style={styles.note}>{t('settings.chooseLanguage')}</Text>
          </TouchableOpacity>
        </ScrollView>

        <TouchableOpacity 
          style={styles.backFab} 
          onPress={() => router.push('/(tabs)/(home)')} 
          activeOpacity={0.8} 
          testID="back-fab"
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Modal
          visible={showLanguageModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowLanguageModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{t('settings.chooseLanguage')}</Text>
              
              {supported.map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={[
                    styles.languageOption,
                    language === lang && styles.languageOptionActive,
                  ]}
                  onPress={() => handleLanguageChange(lang)}
                  activeOpacity={0.7}
                  testID={`language-option-${lang}`}
                >
                  <Text style={[
                    styles.languageText,
                    language === lang && styles.languageTextActive,
                  ]}>
                    {languageNames[lang]}
                  </Text>
                  {language === lang && (
                    <Check size={24} color={COLORS.white} />
                  )}
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowLanguageModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.closeButtonText}>{t('common.close')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  scrollContent: { paddingBottom: 100 },
  title: { 
    fontSize: 28, 
    fontFamily: FONTS.baloo2ExtraBold, 
    color: COLORS.black, 
    marginBottom: 20,
    textShadowColor: 'rgba(255, 209, 102, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  card: { 
    backgroundColor: COLORS.white, 
    borderRadius: 20, 
    padding: 20, 
    borderWidth: 3, 
    borderColor: 'rgba(255, 209, 102, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  label: { 
    fontSize: 16, 
    fontFamily: FONTS.fredokaSemiBold, 
    color: COLORS.gray600,
  },
  value: { 
    fontSize: 20, 
    fontFamily: FONTS.baloo2Bold, 
    color: COLORS.black, 
    marginTop: 8,
  },
  note: { 
    fontSize: 14, 
    fontFamily: FONTS.quicksandMedium,
    color: COLORS.gray600, 
    marginTop: 12,
    lineHeight: 20,
  },
  backFab: { 
    position: 'absolute', 
    left: 20, 
    bottom: 20, 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    backgroundColor: COLORS.gray800, 
    justifyContent: 'center', 
    alignItems: 'center', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 8, 
    elevation: 8,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 3,
    borderColor: 'rgba(255, 209, 102, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: FONTS.baloo2ExtraBold,
    color: COLORS.black,
    marginBottom: 20,
    textAlign: 'center',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: COLORS.gray100,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark,
  },
  languageText: {
    fontSize: 18,
    fontFamily: FONTS.fredokaSemiBold,
    color: COLORS.black,
  },
  languageTextActive: {
    color: COLORS.white,
  },
  closeButton: {
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: COLORS.gray800,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontFamily: FONTS.fredokaSemiBold,
    color: COLORS.white,
  },
});
