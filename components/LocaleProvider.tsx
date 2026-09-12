"use client";

import { createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { LOCALE_COOKIE, type Locale, type Dictionary } from "@/lib/i18n";

const LocaleContext = createContext<{ locale: Locale; dict: Dictionary; setLocale: (l: Locale) => void } | null>(
  null
);

export function LocaleProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  children: React.ReactNode;
}) {
  const router = useRouter();

  function setLocale(next: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000`;
    router.refresh();
  }

  return <LocaleContext.Provider value={{ locale, dict, setLocale }}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
