"use client";

import { useLocale } from "./LocaleProvider";
import type { Locale } from "@/lib/i18n";

const LABELS: Record<Locale, string> = { ar: "العربية", fr: "Français", en: "English" };

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value as Locale)}
      aria-label="Language"
      className="rounded-full border border-brand-200 bg-transparent px-2.5 py-1 text-xs text-brand-700 dark:border-brand-700 dark:text-brand-200"
    >
      {(Object.keys(LABELS) as Locale[]).map((l) => (
        <option key={l} value={l}>
          {LABELS[l]}
        </option>
      ))}
    </select>
  );
}
