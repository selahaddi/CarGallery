import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem('appLanguage');
    return saved && ['tr', 'en', 'de'].includes(saved) ? saved : 'tr';
  });

  const setLanguage = (lang) => {
    if (['tr', 'en', 'de'].includes(lang)) {
      setLanguageState(lang);
      localStorage.setItem('appLanguage', lang);
    }
  };

  const t = (key) => {
    const langDict = translations[language] || translations['tr'];
    return langDict[key] !== undefined ? langDict[key] : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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
