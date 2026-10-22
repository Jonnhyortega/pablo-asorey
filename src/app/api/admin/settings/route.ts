import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { getSiteSettings } from "@/lib/content";
import { validateSiteSettings } from "@/lib/site-settings";
import { getPaymentSettings } from "@/lib/payments";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const [site, payment] = await Promise.all([getSiteSettings(), getPaymentSettings()]);
  return NextResponse.json({ ...site, ...payment });
}

export async function PUT(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  const result = validateSiteSettings(body);
  if ("errors" in result) {
    return NextResponse.json({ error: "Datos inválidos", fields: result.errors }, { status: 400 });
  }

  try {
    await prisma.siteSettings.upsert({
      where: { id: 1 },
      create: { id: 1, ...result.data },
      update: result.data,
    });
  } catch (error) {
    console.error("Error guardando SiteSettings:", error);
    return NextResponse.json({ error: "No se pudo guardar la configuración" }, { status: 500 });
  }

  // La landing es estática: se regenera con los datos nuevos.
  revalidatePath("/", "layout");
  return NextResponse.json(result.data);
}
