// Catálogo de planes: tipos, validación y formato compartidos por el panel,
// la landing y la app del alumno. Sin Prisma acá para poder usarlo en el cliente.

// Íconos disponibles (deben existir en el iconMap de PlanesSection).
export const PLAN_ICONS: { value: string; label: string }[] = [
  { value: "laptop", label: "Notebook" },
  { value: "dumbbell", label: "Pesa" },
  { value: "flame", label: "Llama" },
  { value: "user-check", label: "Persona" },
  { value: "check", label: "Tilde" },
  { value: "refresh", label: "Rotación" },
  { value: "search", label: "Lupa" },
  { value: "apple", label: "Manzana" },
  { value: "video", label: "Video" },
  { value: "trophy", label: "Trofeo" },
  { value: "building", label: "Gimnasio" },
  { value: "handshake", label: "Apretón de manos" },
  { value: "calendar", label: "Calendario" },
];
const ICON_VALUES = new Set(PLAN_ICONS.map((i) => i.value));

export type PlanFeature = { text: string; icon: string };

export type PlanValues = {
  name: string;
  price: number; // ARS por mes
  icon: string;
  features: PlanFeature[];
  highlight: boolean;
  showOnLanding: boolean;
  active: boolean;
};

export type PlanRecord = PlanValues & {
  id: string;
  logo: string | null;
  order: number;
  _count?: { students: number };
};

export function formatPlanPrice(price: number): string {
  return `$${price.toLocaleString("es-AR")}`;
}

export function parseFeatures(value: unknown): PlanFeature[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((f): f is { text: unknown; icon: unknown } => !!f && typeof f === "object")
    .map((f) => ({
      text: typeof f.text === "string" ? f.text : "",
      icon: typeof f.icon === "string" && ICON_VALUES.has(f.icon) ? f.icon : "check",
    }))
    .filter((f) => f.text.trim());
}

export type PlanErrors = Partial<Record<keyof PlanValues, string>>;

export function validatePlan(input: unknown): { data: PlanValues } | { errors: PlanErrors } {
  const raw = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const data: PlanValues = {
    name: typeof raw.name === "string" ? raw.name.trim() : "",
    price: Number(raw.price),
    icon: typeof raw.icon === "string" && ICON_VALUES.has(raw.icon) ? raw.icon : "dumbbell",
    features: parseFeatures(raw.features).map((f) => ({ ...f, text: f.text.trim() })),
    highlight: raw.highlight === true,
    showOnLanding: raw.showOnLanding !== false,
    active: raw.active !== false,
  };

  const errors: PlanErrors = {};
  if (data.name.length < 2 || data.name.length > 60) errors.name = "Entre 2 y 60 caracteres";
  if (!Number.isInteger(data.price) || data.price < 0 || data.price > 100_000_000) {
    errors.price = "Ingresá el precio en pesos, sin puntos ni signos (ej: 45000)";
  }
  if (data.features.length > 15) errors.features = "Máximo 15 beneficios";
  if (data.features.some((f) => f.text.length > 120)) errors.features = "Cada beneficio puede tener hasta 120 caracteres";

  return Object.keys(errors).length ? { errors } : { data };
}
