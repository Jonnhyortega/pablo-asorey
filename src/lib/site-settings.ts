import { siteConfig } from "@/config/site";

export type SiteContent = typeof siteConfig;

// Campos de la landing que el admin puede editar desde /admin/settings.
export type SiteSettingsValues = {
  whatsapp: string; // tal como se muestra, ej: "+54 9 11 2395-7479"
  email: string;
  instagram: string;
  youtube: string;
  tagline: string;
};

export const defaultSiteSettings: SiteSettingsValues = {
  whatsapp: siteConfig.contact.phoneDisplay,
  email: siteConfig.contact.email,
  instagram: siteConfig.social.instagram,
  youtube: siteConfig.social.youtube.trim(),
  tagline: siteConfig.tagline,
};

type StoredSettings = { [K in keyof SiteSettingsValues]?: string | null };

// Los campos vacíos de la base caen en los valores por defecto del config.
export function withDefaults(stored: StoredSettings | null): SiteSettingsValues {
  const pick = (key: keyof SiteSettingsValues) => stored?.[key]?.trim() || defaultSiteSettings[key];
  return {
    whatsapp: pick("whatsapp"),
    email: pick("email"),
    instagram: pick("instagram"),
    youtube: pick("youtube"),
    tagline: pick("tagline"),
  };
}

function instagramHandle(url: string): string | null {
  try {
    const user = new URL(url).pathname.split("/").filter(Boolean)[0];
    return user ? `@${user.toUpperCase()}` : null;
  } catch {
    return null;
  }
}

// Reemplaza en todo el contenido los links de WhatsApp y los datos de contacto.
export function applySiteSettings(base: SiteContent, settings: SiteSettingsValues): SiteContent {
  const digits = settings.whatsapp.replace(/\D/g, "");
  const waHref = `https://wa.me/${digits}`;

  const swapWhatsApp = (value: unknown): unknown => {
    if (typeof value === "string") return value.startsWith("https://wa.me/") ? waHref : value;
    if (Array.isArray(value)) return value.map(swapWhatsApp);
    if (value && typeof value === "object") {
      return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, swapWhatsApp(v)]));
    }
    return value;
  };

  const content = swapWhatsApp(base) as SiteContent;
  return {
    ...content,
    tagline: settings.tagline,
    contact: { ...content.contact, email: settings.email, phoneDisplay: settings.whatsapp, phoneLink: `+${digits}` },
    planes: {
      ...content.planes,
      contactInfo: {
        ...content.planes.contactInfo,
        whatsapp: settings.whatsapp,
        instagram: instagramHandle(settings.instagram) ?? content.planes.contactInfo.instagram,
      },
    },
    social: { ...content.social, instagram: settings.instagram, youtube: settings.youtube },
  };
}

function isHttpUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

export type SiteSettingsErrors = Partial<Record<keyof SiteSettingsValues, string>>;

export function validateSiteSettings(input: unknown): { data: SiteSettingsValues } | { errors: SiteSettingsErrors } {
  const raw = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const str = (key: keyof SiteSettingsValues) => (typeof raw[key] === "string" ? (raw[key] as string).trim() : "");
  const data: SiteSettingsValues = {
    whatsapp: str("whatsapp"),
    email: str("email"),
    instagram: str("instagram"),
    youtube: str("youtube"),
    tagline: str("tagline"),
  };

  const errors: SiteSettingsErrors = {};
  const digits = data.whatsapp.replace(/\D/g, "");
  if (!/^\+?[\d\s()-]+$/.test(data.whatsapp) || digits.length < 10 || digits.length > 15) {
    errors.whatsapp = "Ingresá el número con código de país, ej: +54 9 11 2395-7479";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = "Email inválido";
  if (!isHttpUrl(data.instagram)) errors.instagram = "Debe ser un link que empiece con https://";
  if (!isHttpUrl(data.youtube)) errors.youtube = "Debe ser un link que empiece con https://";
  if (data.tagline.length < 10 || data.tagline.length > 300) errors.tagline = "Entre 10 y 300 caracteres";

  return Object.keys(errors).length ? { errors } : { data };
}
