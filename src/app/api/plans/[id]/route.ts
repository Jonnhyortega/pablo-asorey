import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { validatePlan } from "@/lib/plans";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const result = validatePlan(await request.json().catch(() => null));
  if ("errors" in result) {
    return NextResponse.json({ error: "Datos inválidos", fields: result.errors }, { status: 400 });
  }

  try {
    const plan = await prisma.plan.update({ where: { id }, data: result.data });
    revalidatePath("/", "layout");
    return NextResponse.json(plan);
  } catch (error) {
    console.error("Error actualizando plan:", error);
    return NextResponse.json({ error: "No se pudo actualizar el plan" }, { status: 500 });
  }
}

// Solo se borra un plan sin alumnos; si tiene alumnos se archiva desde el editor.
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  try {
    const students = await prisma.student.count({ where: { planId: id } });
    if (students > 0) {
      return NextResponse.json(
        { error: `Este plan tiene ${students} alumno${students === 1 ? "" : "s"}. Archivalo en lugar de borrarlo.` },
        { status: 409 },
      );
    }
    await prisma.plan.delete({ where: { id } });
    revalidatePath("/", "layout");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error borrando plan:", error);
    return NextResponse.json({ error: "No se pudo borrar el plan" }, { status: 500 });
  }
}
