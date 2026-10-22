import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { validatePlan } from "@/lib/plans";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const plans = await prisma.plan.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    include: { _count: { select: { students: true } } },
  });
  return NextResponse.json(plans);
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const result = validatePlan(await request.json().catch(() => null));
  if ("errors" in result) {
    return NextResponse.json({ error: "Datos inválidos", fields: result.errors }, { status: 400 });
  }

  try {
    const last = await prisma.plan.findFirst({ orderBy: { order: "desc" }, select: { order: true } });
    const plan = await prisma.plan.create({ data: { ...result.data, order: (last?.order ?? -1) + 1 } });
    revalidatePath("/", "layout");
    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    console.error("Error creando plan:", error);
    return NextResponse.json({ error: "No se pudo crear el plan" }, { status: 500 });
  }
}
