import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useSettings } from '@/hooks/useSettings';
import { SPACING, BORDER_RADIUS, SHADOWS, FONTS } from '@/constants/theme';
import { Theme, Language } from '@/types/bac';

export default function SettingsPage() {
  const colors = useThemeColors();
  const { t, theme, language, setTheme, setLanguage } = useSettings();
  const insets = useSafeAreaInsets();

  const [modalContent, setModalContent] = useState<{ title: string; content: string } | null>(null);

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
  ];

  const openModal = (title: string, content: string) => {
    setModalContent({ title, content });
  };

  const closeModal = () => {
    setModalContent(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <Text style={[styles.title, { color: colors.text }, FONTS.playful]}>{t('tabSettings')}</Text>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: colors.cardBackground }, theme === 'light' ? SHADOWS.light : SHADOWS.dark]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('theme')}</Text>
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                { borderColor: colors.border },
                theme === 'light' && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => setTheme('light')}
            >
              <MaterialIcons 
                name="light-mode" 
                size={24} 
                color={theme === 'light' ? '#FFFFFF' : colors.text} 
              />
              <Text style={[styles.optionText, { color: theme === 'light' ? '#FFFFFF' : colors.text }]}>
                {t('lightTheme')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                { borderColor: colors.border },
                theme === 'dark' && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => setTheme('dark')}
            >
              <MaterialIcons 
                name="dark-mode" 
                size={24} 
                color={theme === 'dark' ? '#FFFFFF' : colors.text} 
              />
              <Text style={[styles.optionText, { color: theme === 'dark' ? '#FFFFFF' : colors.text }]}>
                {t('darkTheme')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBackground }, theme === 'light' ? SHADOWS.light : SHADOWS.dark]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('language')}</Text>
          <View style={styles.languageGrid}>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageButton,
                  { borderColor: colors.border },
                  language === lang.code && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}
                onPress={() => setLanguage(lang.code)}
              >
                <Text style={[
                  styles.languageText,
                  { color: language === lang.code ? '#FFFFFF' : colors.text }
                ]}>
                  {lang.flag} {lang.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: colors.cardBackground }, theme === 'light' ? SHADOWS.light : SHADOWS.dark]}
          onPress={() => openModal(
            t('aboutBAC'),
            `${t('bacInfo')}\n\n${t('formulaInfo')}\n\n${t('curiositiesInfo')}`
          )}
        >
          <View style={styles.infoRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('aboutBAC')}</Text>
            <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: colors.cardBackground }, theme === 'light' ? SHADOWS.light : SHADOWS.dark]}
          onPress={() => openModal(t('privacy'), t('privacyInfo'))}
        >
          <View style={styles.infoRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('privacy')}</Text>
            <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: colors.cardBackground }, theme === 'light' ? SHADOWS.light : SHADOWS.dark]}
          onPress={() => openModal(t('terms'), t('termsInfo'))}
        >
          <View style={styles.infoRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('terms')}</Text>
            <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
          </View>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={modalContent !== null}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{modalContent?.title}</Text>
              <TouchableOpacity onPress={closeModal}>
                <MaterialIcons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalText, { color: colors.textSecondary }]}>
                {modalContent?.content}
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  title: {
    fontSize: 32,
    textAlign: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  card: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    gap: SPACING.sm,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  languageButton: {
    minWidth: 110,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    alignItems: 'center',
  },
  languageText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  modalBody: {
    flex: 1,
  },
  modalText: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'left',
  },
});