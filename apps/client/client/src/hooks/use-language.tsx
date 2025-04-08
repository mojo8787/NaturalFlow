import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { LanguageCode, translations, TranslationKey } from '@/lib/translations';

type LanguageContextType = {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: TranslationKey, params?: Record<string, string>) => string;
  dir: 'ltr' | 'rtl';
};

const defaultLanguage: LanguageCode = 'ar'; // Set Arabic as default

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    // Check local storage for saved language preference
    const savedLanguage = localStorage.getItem('language') as LanguageCode | null;
    return savedLanguage || defaultLanguage;
  });
  
  const dir = language === 'ar' ? 'rtl' : 'ltr';
  
  useEffect(() => {
    // Update document direction and language
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
    
    // Save language preference to local storage
    localStorage.setItem('language', language);
  }, [language, dir]);
  
  // Function to set the language
  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
  };
  
  // Translate function
  const t = (key: TranslationKey, params?: Record<string, string>): string => {
    // Check if key exists in translations
    const keyExists = key in translations[language] || key in translations.en;
    
    // Use key lookup only if it's a valid translation key
    let text = keyExists 
      ? (translations[language] as any)[key] || (translations.en as any)[key] 
      : key.toString();
    
    // Replace parameters if they exist
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        text = text.replace(`{${param}}`, value);
      });
    }
    
    return text;
  };
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  
  return context;
}