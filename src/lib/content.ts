import { siteConfig } from "@/config/site";

export type SiteContent = typeof siteConfig;

// Punto único de lectura de los textos de la landing.
// El sub-proyecto 2 (editor de contenido) reemplaza esta fuente.
export function getSiteContent(): SiteContent {
  return siteConfig;
}
