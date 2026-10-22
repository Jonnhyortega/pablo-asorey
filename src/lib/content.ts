import { cache } from "react";
import { siteConfig } from "@/config/site";
import prisma from "@/lib/prisma";
import { applySiteSettings, withDefaults, type SiteContent, type SiteSettingsValues } from "@/lib/site-settings";

export type { SiteContent };

export const getSiteSettings = cache(async (): Promise<SiteSettingsValues> => {
  try {
    return withDefaults(await prisma.siteSettings.findUnique({ where: { id: 1 } }));
  } catch (error) {
    // Sin base (por ejemplo en un build sin DATABASE_URL) la landing usa el config.
    console.error("Error leyendo SiteSettings:", error);
    return withDefaults(null);
  }
});

// Punto único de lectura de los textos de la landing (solo en el servidor).
// Los componentes cliente usan useSiteContent() de SiteContentProvider.
export const getSiteContent = cache(async (): Promise<SiteContent> => {
  return applySiteSettings(siteConfig, await getSiteSettings());
});
