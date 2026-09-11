import { createContext } from "react";
import type { Language, Translate } from "./translate";

export interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Translate;
  // Locale Intl untuk format tanggal/jam, misalnya "id-ID".
  locale: string;
}

export const LanguageContext = createContext<LanguageContextValue | null>(null);
