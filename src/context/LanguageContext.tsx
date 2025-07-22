import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import {
  Language,
  homeTranslations,
  signupTranslations,
  startupTranslations,
  investorTranslations,
} from "@/utils/language";

// Combine all translations into one object
const translations = {
  ...homeTranslations,
  ...signupTranslations,
  ...startupTranslations,
  ...investorTranslations,
};

export type TranslationKey = keyof typeof translations;

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

interface LanguageProviderProps {
  children: ReactNode;
}

// Helper function to get initial language
const getInitialLanguage = (): Language => {
  try {
    // First, check localStorage for saved preference
    const savedLanguage = localStorage.getItem(
      "preferred-language"
    ) as Language;
    if (savedLanguage && ["English", "Arabic"].includes(savedLanguage)) {
      return savedLanguage;
    }

    // Fallback to browser language detection
    const browserLanguage = navigator.language || navigator.languages?.[0];
    if (browserLanguage?.startsWith("ar")) {
      return "Arabic";
    }
  } catch (error) {
    // localStorage might not be available (SSR, privacy mode, etc.)
    console.warn("Could not access localStorage for language preference");
  }

  // Default fallback
  return "English";
};

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  // Enhanced setLanguage that persists to localStorage
  const setLanguage = (newLanguage: Language) => {
    try {
      localStorage.setItem("preferred-language", newLanguage);
    } catch (error) {
      console.warn("Could not save language preference to localStorage");
    }
    setLanguageState(newLanguage);
  };

  const t = (key: TranslationKey): string => {
    return (
      (translations[key] as Record<Language, string>)?.[language] ||
      (translations[key] as Record<Language, string>)?.English ||
      key
    );
  };

  const isRTL = language === "Arabic";

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    isRTL,
  };

  return (
    <LanguageContext.Provider value={value}>
      <div dir={isRTL ? "rtl" : "ltr"} className={isRTL ? "font-arabic" : ""}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
