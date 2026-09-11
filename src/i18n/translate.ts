import id, { type Dictionary } from "./locales/id";
import en from "./locales/en";

export type Language = "id" | "en";

export const STORAGE_KEY = "dots-language";

const dictionaries: Record<Language, Dictionary> = { id, en };

// Locale untuk Intl (format tanggal/jam) per bahasa.
export const LOCALES: Record<Language, string> = { id: "id-ID", en: "en-US" };

// Semua kunci daun kamus dalam bentuk "bagian.kunci", misalnya "nav.home".
// Salah ketik kunci langsung menjadi error TypeScript, bukan teks kosong.
type Leaves<T, P extends string = ""> = {
  [K in keyof T & string]: T[K] extends string ? `${P}${K}` : Leaves<T[K], `${P}${K}.`>;
}[keyof T & string];

export type TranslationKey = Leaves<Dictionary>;
export type TranslateParams = Record<string, string | number>;
export type Translate = (key: TranslationKey, params?: TranslateParams) => string;

const lookup = (dictionary: unknown, key: string) =>
  key
    .split(".")
    .reduce<unknown>(
      (node, part) => (node && typeof node === "object" ? (node as Record<string, unknown>)[part] : undefined),
      dictionary
    ) as string | undefined;

// "{n} hari" + { n: 2 } -> "2 hari". Kunci yang hilang jatuh ke bahasa
// Indonesia, lalu ke kuncinya sendiri, supaya layar tidak pernah kosong.
export const translate = (language: Language, key: TranslationKey, params?: TranslateParams) => {
  const template = lookup(dictionaries[language], key) ?? lookup(dictionaries.id, key) ?? key;
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match
  );
};

// Pilihan tersimpan lebih dulu; tanpa itu mengikuti bahasa browser.
export const detectLanguage = (): Language => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "id" || saved === "en") return saved;
  } catch {
    // localStorage bisa diblokir (mode privat); pakai deteksi browser saja.
  }
  return navigator.language?.toLowerCase().startsWith("id") ? "id" : "en";
};
