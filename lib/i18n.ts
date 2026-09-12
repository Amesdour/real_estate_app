export const LOCALES = ["ar", "fr", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ar";
export const LOCALE_COOKIE = "locale";

export function dirFor(locale: Locale) {
  return locale === "ar" ? "rtl" : "ltr";
}

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

const dictionaries = {
  ar: {
    appName: "تراسو",
    nav: {
      admin: "الإدارة",
      listProperty: "أضف عقارًا",
      messages: "الرسائل",
      myReservations: "حجوزاتي",
      signIn: "تسجيل الدخول",
      createAccount: "إنشاء حساب",
      signOut: "تسجيل الخروج",
    },
    home: {
      title: "ابحث عن عقارك واحجزه",
      subtitle: "تصفح العقارات وضع حجزًا مؤقتًا برسوم بسيطة.",
      empty: "لا توجد عقارات مطابقة لبحثك حاليًا.",
    },
    filters: {
      title: "الفلاتر",
      city: "المدينة",
      saleOrRent: "بيع أو كراء",
      forSale: "للبيع",
      forRent: "للكراء",
      anyType: "أي نوع",
      anyBedrooms: "أي عدد غرف",
      bedroomsPlus: "غرف فأكثر",
      maxPrice: "أقصى سعر (دج)",
      apply: "تطبيق الفلاتر",
      clear: "مسح الكل",
    },
    property: {
      forSale: "للبيع",
      forRent: "للكراء",
      bedroomsShort: "غرف",
    },
    auth: {
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      passwordHint: "8 أحرف على الأقل.",
      role: "أنا...",
      buyer: "مشتري / مستأجر",
      owner: "مالك عقار",
      agent: "وكيل عقاري",
      signIn: "تسجيل الدخول",
      createAccount: "إنشاء حساب",
    },
    theme: {
      light: "فاتح",
      dark: "داكن",
    },
  },
  fr: {
    appName: "Terraço",
    nav: {
      admin: "Admin",
      listProperty: "Publier une annonce",
      messages: "Messages",
      myReservations: "Mes réservations",
      signIn: "Se connecter",
      createAccount: "Créer un compte",
      signOut: "Déconnexion",
    },
    home: {
      title: "Trouvez et réservez votre bien",
      subtitle: "Parcourez les annonces et posez une option temporaire pour de petits frais.",
      empty: "Aucun bien ne correspond à votre recherche pour le moment.",
    },
    filters: {
      title: "Filtres",
      city: "Ville",
      saleOrRent: "Vente ou location",
      forSale: "À vendre",
      forRent: "À louer",
      anyType: "Tout type",
      anyBedrooms: "Chambres",
      bedroomsPlus: "chambres et +",
      maxPrice: "Prix max (DA)",
      apply: "Appliquer",
      clear: "Tout effacer",
    },
    property: {
      forSale: "À vendre",
      forRent: "À louer",
      bedroomsShort: "ch.",
    },
    auth: {
      email: "E-mail",
      password: "Mot de passe",
      passwordHint: "8 caractères minimum.",
      role: "Je suis...",
      buyer: "Acheteur / locataire",
      owner: "Propriétaire",
      agent: "Agent immobilier",
      signIn: "Se connecter",
      createAccount: "Créer un compte",
    },
    theme: {
      light: "Clair",
      dark: "Sombre",
    },
  },
  en: {
    appName: "Terraço",
    nav: {
      admin: "Admin",
      listProperty: "List a property",
      messages: "Messages",
      myReservations: "My reservations",
      signIn: "Sign in",
      createAccount: "Create account",
      signOut: "Log out",
    },
    home: {
      title: "Find and reserve a place",
      subtitle: "Browse listings and place a time-limited hold for a small fee.",
      empty: "No listings match your search right now.",
    },
    filters: {
      title: "Filters",
      city: "City",
      saleOrRent: "Sale or rent",
      forSale: "For sale",
      forRent: "For rent",
      anyType: "Any type",
      anyBedrooms: "Any bedrooms",
      bedroomsPlus: "+ bedrooms",
      maxPrice: "Max price (DA)",
      apply: "Apply filters",
      clear: "Clear all",
    },
    property: {
      forSale: "For sale",
      forRent: "For rent",
      bedroomsShort: "bd",
    },
    auth: {
      email: "Email",
      password: "Password",
      passwordHint: "At least 8 characters.",
      role: "I am a...",
      buyer: "Buyer / tenant",
      owner: "Property owner",
      agent: "Agent",
      signIn: "Sign in",
      createAccount: "Create account",
    },
    theme: {
      light: "Light",
      dark: "Dark",
    },
  },
} as const;

export type Dictionary = (typeof dictionaries)["en"];

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
