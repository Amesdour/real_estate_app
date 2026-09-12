import type { Metadata } from "next";
import { cookies } from "next/headers";
import { NavBar } from "@/components/NavBar";
import { LocaleProvider } from "@/components/LocaleProvider";
import { ThemeProvider, ThemeScript } from "@/components/ThemeProvider";
import { DEFAULT_LOCALE, LOCALE_COOKIE, dirFor, getDictionary, isLocale } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: "Terraco — find and reserve a place",
  description: "Browse listings and place a time-limited hold with a small reservation fee.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieLocale = cookies().get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  return (
    <html lang={locale} dir={dirFor(locale)}>
      <head>
        <ThemeScript />
      </head>
      <body className="font-body min-h-screen">
        <ThemeProvider>
          <LocaleProvider locale={locale} dict={dict}>
            <NavBar />
            <main>{children}</main>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
