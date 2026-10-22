import { cache } from "react";
import { siteConfig } from "@/config/site";
import prisma from "@/lib/prisma";
import { applySiteSettings, withDefaults, type SiteContent, type SiteSettingsValues } from "@/lib/site-settings";
import { formatPlanPrice, parseFeatures } from "@/lib/plans";

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

type LandingPlan = SiteContent["planes"]["items"][number];

// Planes de la landing desde el catálogo del panel. Si el catálogo está vacío
// (nunca se cargó) o la base no responde, quedan los del config.
const getLandingPlans = cache(async (): Promise<LandingPlan[] | null> => {
  try {
    const plans = await prisma.plan.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] });
    if (plans.length === 0) return null;
    return plans
      .filter((plan) => plan.active && plan.showOnLanding)
      .map((plan) => ({
        id: plan.id,
        name: plan.name,
        icon: plan.icon,
        price: formatPlanPrice(plan.price),
        features: parseFeatures(plan.features),
        highlight: plan.highlight,
        ...(plan.logo ? { logo: plan.logo } : {}),
      })) as LandingPlan[];
  } catch (error) {
    console.error("Error leyendo planes:", error);
    return null;
  }
});

// Punto único de lectura de los textos de la landing (solo en el servidor).
// Los componentes cliente usan useSiteContent() de SiteContentProvider.
export const getSiteContent = cache(async (): Promise<SiteContent> => {
  const [settings, plans] = await Promise.all([getSiteSettings(), getLandingPlans()]);
  const content = applySiteSettings(siteConfig, settings);
  return plans ? { ...content, planes: { ...content.planes, items: plans } } : content;
});
