import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { LogoutButton } from "./LogoutButton";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { DEFAULT_LOCALE, LOCALE_COOKIE, getDictionary, isLocale } from "@/lib/i18n";

export async function NavBar() {
  const user = await getCurrentUser();
  const isAdmin = user?.role === "SUPER_ADMIN";
  const canList = user && ["AGENT", "PROPERTY_OWNER"].includes(user.role);

  const cookieLocale = cookies().get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
  const t = getDictionary(locale).nav;
  const appName = getDictionary(locale).appName;

  return (
    <header className="border-b border-brand-200/60 dark:border-brand-800">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2.5 font-display text-xl tracking-tight text-brand-900 dark:text-brand-50">
          <Image src="/logo/icon.svg" alt="" width={32} height={32} className="rounded-lg" priority />
          {appName}
        </Link>
        <nav className="flex items-center gap-5">
          {isAdmin && (
            <Link href="/admin" className="text-sm text-brand-700 hover:text-brand-900 dark:text-brand-200 dark:hover:text-brand-50">
              {t.admin}
            </Link>
          )}
          {canList && (
            <Link href="/list-property" className="text-sm text-brand-700 hover:text-brand-900 dark:text-brand-200 dark:hover:text-brand-50">
              {t.listProperty}
            </Link>
          )}
          {user ? (
            <>
              {!isAdmin && (
                <>
                  <Link href="/dashboard/messages" className="text-sm text-brand-700 hover:text-brand-900 dark:text-brand-200 dark:hover:text-brand-50">
                    {t.messages}
                  </Link>
                  <Link href="/dashboard" className="text-sm text-brand-700 hover:text-brand-900 dark:text-brand-200 dark:hover:text-brand-50">
                    {t.myReservations}
                  </Link>
                </>
              )}
              <LogoutButton label={t.signOut} />
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-brand-700 hover:text-brand-900 dark:text-brand-200 dark:hover:text-brand-50">
                {t.signIn}
              </Link>
              <Link href="/register" className="btn-primary !px-4 !py-2">
                {t.createAccount}
              </Link>
            </>
          )}
          <div className="flex items-center gap-2 border-s border-brand-200/60 ps-4 dark:border-brand-800">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
