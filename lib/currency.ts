/**
 * Formats an amount as Algerian Dinar. We format the number ourselves (French
 * thousands-grouping, which is what's used in Algeria) and append "DA" rather
 * than relying on Intl's built-in DZD currency formatting — ICU's DZD symbol
 * support is inconsistent across Node/ICU builds, and "DA" is what people
 * actually read locally anyway.
 */
export function formatDA(amount: number | string): string {
  const n = Number(amount);
  if (n <= 0) return "Contactez l'annonceur";
  return `${new Intl.NumberFormat("fr-FR").format(n)} DA`;
}
