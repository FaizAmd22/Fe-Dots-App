import { useContext } from "react";
import { LanguageContext } from "./context";

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation harus dipakai di dalam <LanguageProvider>.");
  }
  return context;
};
