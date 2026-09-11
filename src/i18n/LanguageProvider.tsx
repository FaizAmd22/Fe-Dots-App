import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { LanguageContext } from "./context";
import {
  detectLanguage,
  Language,
  LOCALES,
  STORAGE_KEY,
  translate,
  TranslateParams,
  TranslationKey,
} from "./translate";

// Menyimpan bahasa aktif. Mengganti bahasa me-render ulang semua komponen yang
// memakai useTranslation, tanpa memuat ulang halaman atau data.
const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(detectLanguage);

  // Atribut lang dipakai pembaca layar dan pemeriksa ejaan browser.
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Tetap berganti untuk sesi ini walau tidak bisa disimpan.
    }
  }, []);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      locale: LOCALES[language],
      t: (key: TranslationKey, params?: TranslateParams) => translate(language, key, params),
    }),
    [language, setLanguage]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export default LanguageProvider;
