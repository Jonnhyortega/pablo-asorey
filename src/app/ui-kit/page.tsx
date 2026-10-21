import { notFound } from "next/navigation";
import UiKit from "./UiKit";

// Vitrina de componentes, solo para desarrollo
export default function UiKitPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <UiKit />;
}
