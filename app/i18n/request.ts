// i18n.ts (or i18n/request.ts)
import { getRequestConfig, GetRequestConfigParams } from 'next-intl/server';
import { notFound } from 'next/navigation';

const locales = ['en', 'ar'] as const;
type Locale = typeof locales[number];


export default getRequestConfig(async (val): Promise<{ locale: any; messages: any; }> => {
  // Await and validate the incoming requestLocale
  const locale = await val.requestLocale;
  if (!locales.includes(locale as Locale)) notFound();

  return {
    locale, // Include this for type safety and config inheritance
    messages: (await import(`../locales/${locale}.json`)).default
  };
});
