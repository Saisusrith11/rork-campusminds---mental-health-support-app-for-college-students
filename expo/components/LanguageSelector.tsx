import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Check, Globe } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useLanguage, type SupportedLanguage } from '@/hooks/language-store';

interface LanguageSelectorProps {
  visible: boolean;
  onClose: () => void;
}

export default function LanguageSelector({ visible, onClose }: LanguageSelectorProps) {
  const { currentLanguage, changeLanguage, getAvailableLanguages, translate } = useLanguage();
  const [isChanging, setIsChanging] = useState(false);
  
  const availableLanguages = getAvailableLanguages();
  
  const handleLanguageSelect = async (languageCode: SupportedLanguage) => {
    if (languageCode === currentLanguage) {
      onClose();
      return;
    }
    
    setIsChanging(true);
    try {
      await changeLanguage(languageCode);
      setTimeout(() => {
        setIsChanging(false);
        onClose();
      }, 500);
    } catch (error) {
      console.error('Failed to change language:', error);
      setIsChanging(false);
    }
  };
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Globe size={24} color={theme.colors.primary} />
            <Text style={styles.headerTitle}>
              {translate('settings.selectLanguage', 'Select Language')}
            </Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>
              {translate('button.cancel', 'Cancel')}
            </Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.languageList} showsVerticalScrollIndicator={false}>
          {availableLanguages.map((language) => {
            const isSelected = language.code === currentLanguage;
            const isDisabled = isChanging;
            
            return (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageItem,
                  isSelected && styles.selectedLanguageItem,
                  isDisabled && styles.disabledLanguageItem
                ]}
                onPress={() => handleLanguageSelect(language.code)}
                disabled={isDisabled}
              >
                <View style={styles.languageInfo}>
                  <Text style={styles.languageFlag}>{language.flag}</Text>
                  <View style={styles.languageText}>
                    <Text style={[
                      styles.languageName,
                      isSelected && styles.selectedLanguageName
                    ]}>
                      {language.nativeName}
                    </Text>
                    <Text style={[
                      styles.languageEnglishName,
                      isSelected && styles.selectedLanguageEnglishName
                    ]}>
                      {language.name}
                    </Text>
                  </View>
                </View>
                
                {isSelected && (
                  <View style={styles.checkIcon}>
                    <Check size={20} color={theme.colors.primary} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {translate('settings.language', 'Language')} • {availableLanguages.length} available
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  closeButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  closeButtonText: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  languageList: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  selectedLanguageItem: {
    backgroundColor: theme.colors.primary + '10',
  },
  disabledLanguageItem: {
    opacity: 0.6,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  languageFlag: {
    fontSize: 24,
  },
  languageText: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  selectedLanguageName: {
    color: theme.colors.primary,
  },
  languageEnglishName: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  selectedLanguageEnglishName: {
    color: theme.colors.primary + 'CC',
  },
  checkIcon: {
    marginLeft: theme.spacing.md,
  },
  footer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  footerText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});