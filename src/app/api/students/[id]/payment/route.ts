import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { approvePayment, rejectPayment } from "@/lib/payments";

// El profe acepta o rechaza el pago informado por el alumno.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const action = body?.action;
  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
  }

  try {
    const result = action === "approve" ? await approvePayment(id) : await rejectPayment(id);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error resolviendo pago:", error);
    return NextResponse.json({ error: "No se pudo resolver el pago" }, { status: 500 });
  }
}
