import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, Language } from '@/types/bac';

interface SettingsContextType {
  theme: Theme;
  language: Language;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const THEME_KEY = '@theme';
const LANGUAGE_KEY = '@language';

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [language, setLanguageState] = useState<Language>('it');
  const [translations, setTranslations] = useState<Record<string, string>>({});

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    loadTranslations();
  }, [language]);

  const loadSettings = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_KEY);
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
      
      if (savedTheme) setThemeState(savedTheme as Theme);
      if (savedLanguage) setLanguageState(savedLanguage as Language);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadTranslations = async () => {
    try {
      const { TRANSLATIONS } = await import('@/constants/drinks');
      setTranslations(TRANSLATIONS[language]);
    } catch (error) {
      console.error('Error loading translations:', error);
    }
  };

  const setTheme = async (newTheme: Theme) => {
    try {
      await AsyncStorage.setItem(THEME_KEY, newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const setLanguage = async (newLanguage: Language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, newLanguage);
      setLanguageState(newLanguage);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const t = (key: string): string => {
    return translations[key] || key;
  };

  return (
    <SettingsContext.Provider value={{ theme, language, setTheme, setLanguage, t }}>
      {children}
    </SettingsContext.Provider>
  );
}