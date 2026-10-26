import rawRoutes from "@/content/routes.json";
import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { normalizeRoute } from "@/lib/i18n/urls";

const routeMap = new Map(
  rawRoutes.map((entry) => [normalizeRoute(entry.route), entry.locales as Locale[]]),
);

export function routeAvailability(route: string): Locale[] {
  return routeMap.get(normalizeRoute(route)) ?? [defaultLocale];
}
