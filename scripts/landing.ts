import { PRICES, formatPrice } from '../src/lib/plans';
import { PAGES, renderGuideLinks } from './landing-pages';

export interface LandingVars {
  siteUrl: string;
  appUrl: string;
}

/** Sostituisce i segnaposto del sito (indirizzi e prezzi): i prezzi vengono sempre da src/lib/plans.ts. */
export function fillPlaceholders(text: string, vars: LandingVars): string {
  const map: Record<string, string> = {
    __SITE_URL__: vars.siteUrl.replace(/\/$/, ''),
    __APP_URL__: vars.appUrl.replace(/\/$/, ''),
    __PRICE_SMART_MONTH__: formatPrice(PRICES.smart.month),
    __PRICE_SMART_YEAR__: formatPrice(PRICES.smart.year),
    __PRICE_PRO_MONTH__: formatPrice(PRICES.pro.month),
    __PRICE_PRO_YEAR__: formatPrice(PRICES.pro.year),
  };
  map.__GUIDE_LINKS__ = renderGuideLinks();
  map['<!--PAGES-->'] = PAGES.map(
    (p) => `<url><loc>${vars.siteUrl.replace(/\/$/, '')}/${p.slug}</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>`,
  ).join('\n  ');
  return Object.entries(map).reduce((out, [key, value]) => out.split(key).join(value), text);
}
