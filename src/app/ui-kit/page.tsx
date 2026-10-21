import { notFound } from "next/navigation";
import UiKit from "./UiKit";

// Vitrina de componentes, solo para desarrollo
export default async function UiKitPage({ searchParams }: { searchParams: Promise<{ shell?: string }> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const { shell } = await searchParams;
  return <UiKit shell={shell === "bottom" || shell === "drawer" ? shell : undefined} />;
}
