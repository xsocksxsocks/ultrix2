import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { de } from "./translations/de";
import { en } from "./translations/en";

export type Language = "de" | "en";
export type Translations = typeof de;

interface LanguageContextType {
  language: Language;
  t: Translations;
  setLanguage: (lang: Language) => void;
  switchLanguage: () => void;
}

const translations: Record<Language, Translations> = {
  de,
  en,
};

// Route mapping between German and English
const routeMap: Record<string, Record<Language, string>> = {
  home: { de: "/", en: "/en" },
  vehicles: { de: "/fahrzeuge", en: "/en/vehicles" },
  vehicleInquiry: { de: "/fahrzeuganfrage", en: "/en/vehicle-inquiry" },
  sell: { de: "/verkaufen", en: "/en/sell" },
  contact: { de: "/kontakt", en: "/en/contact" },
  imprint: { de: "/impressum", en: "/en/imprint" },
  privacy: { de: "/datenschutz", en: "/en/privacy" },
};

// Get route key from path
const getRouteKeyFromPath = (path: string): string | null => {
  for (const [key, routes] of Object.entries(routeMap)) {
    if (routes.de === path || routes.en === path) {
      return key;
    }
  }
  return null;
};

// Detect language from URL
const detectLanguageFromUrl = (pathname: string): Language => {
  return pathname.startsWith("/en") ? "en" : "de";
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [language, setLanguageState] = useState<Language>(() => {
    // Check URL first
    const urlLang = detectLanguageFromUrl(window.location.pathname);
    if (urlLang === "en") return "en";
    
    // Then check localStorage
    const stored = localStorage.getItem("language") as Language | null;
    if (stored && (stored === "de" || stored === "en")) {
      return stored;
    }
    
    return "de";
  });

  // Update language when URL changes
  useEffect(() => {
    const urlLang = detectLanguageFromUrl(location.pathname);
    if (urlLang !== language) {
      setLanguageState(urlLang);
    }
  }, [location.pathname]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
    
    // Navigate to equivalent route in new language
    const routeKey = getRouteKeyFromPath(location.pathname);
    if (routeKey && routeMap[routeKey]) {
      const newPath = routeMap[routeKey][lang];
      navigate(newPath);
    } else if (lang === "en" && !location.pathname.startsWith("/en")) {
      // For unknown routes, just prefix with /en
      navigate("/en" + location.pathname);
    } else if (lang === "de" && location.pathname.startsWith("/en")) {
      // Remove /en prefix
      const newPath = location.pathname.replace(/^\/en/, "") || "/";
      navigate(newPath);
    }
  };

  const switchLanguage = () => {
    setLanguage(language === "de" ? "en" : "de");
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, t, setLanguage, switchLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

// Helper hook to get translated route
export const useLocalizedRoute = () => {
  const { language } = useLanguage();
  
  return (routeKey: keyof typeof routeMap): string => {
    return routeMap[routeKey]?.[language] || routeMap[routeKey]?.de || "/";
  };
};
