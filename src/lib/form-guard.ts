import { createHash } from "crypto";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Protección anti-bots para los formularios públicos, en tres capas:
// 1. Campo trampa ("website"): invisible para personas, los bots lo completan.
// 2. Tiempo mínimo: una persona tarda unos segundos en completar el formulario.
// 3. Límite de envíos por IP en una ventana de tiempo.
// A los bots detectados por 1 y 2 se les responde éxito falso para que no reintenten.

export type PublicForm = "newsletter" | "contact" | "aplicar";

const LIMITS: Record<PublicForm, { max: number; windowMinutes: number; minSeconds: number }> = {
  newsletter: { max: 3, windowMinutes: 10, minSeconds: 2 },
  contact: { max: 3, windowMinutes: 10, minSeconds: 3 },
  aplicar: { max: 3, windowMinutes: 60, minSeconds: 10 },
};

function clientIpHash(request: Request): string {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  // Hash con el secreto del sitio: no se guarda la IP real.
  return createHash("sha256").update(`${ip}:${process.env.JWT_SECRET ?? ""}`).digest("hex");
}

// Devuelve una respuesta si el envío debe cortarse, o null si puede seguir.
export async function guardPublicForm(
  request: Request,
  body: Record<string, unknown> | null,
  form: PublicForm,
  fakeSuccess: () => NextResponse,
): Promise<NextResponse | null> {
  const limits = LIMITS[form];

  const honeypot = typeof body?.website === "string" ? body.website.trim() : "";
  const startedAt = Number(body?.startedAt);
  const elapsedMs = Date.now() - startedAt;
  if (honeypot || !Number.isFinite(startedAt) || elapsedMs < limits.minSeconds * 1000) {
    return fakeSuccess();
  }

  const ipHash = clientIpHash(request);
  const since = new Date(Date.now() - limits.windowMinutes * 60_000);
  const recent = await prisma.formSubmission.count({
    where: { form, ipHash, createdAt: { gte: since } },
  });
  if (recent >= limits.max) {
    return NextResponse.json(
      { message: "Recibimos varios envíos seguidos. Probá de nuevo en unos minutos.", error: "Demasiados envíos" },
      { status: 429 },
    );
  }

  await prisma.formSubmission.create({ data: { form, ipHash } });
  // Limpieza: los registros solo sirven para la ventana del límite.
  await prisma.formSubmission.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 24 * 60 * 60_000) } } });
  return null;
}
