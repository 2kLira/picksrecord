import "server-only";
import { cookies } from "next/headers";
import { getDict, normalizeLocale, type Dict, type Locale, LOCALE_COOKIE } from "./i18n";

/** Current locale from the cookie (server). */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  return normalizeLocale(store.get(LOCALE_COOKIE)?.value);
}

/** Dictionary for the current locale (server components). */
export async function getT(): Promise<Dict> {
  return getDict(await getLocale());
}
