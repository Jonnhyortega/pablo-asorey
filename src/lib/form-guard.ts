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

function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

// Hash con el secreto del sitio: no se guarda la IP (ni el email) en claro.
function secretHash(value: string): string {
  return createHash("sha256").update(`${value}:${process.env.JWT_SECRET ?? ""}`).digest("hex");
}

function clientIpHash(request: Request): string {
  return secretHash(clientIp(request));
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

// --- Login: límite de intentos fallidos ---
// Se cuentan solo los fallidos, con dos claves:
// - IP + email: 5 fallidos en 15 min. Frena a quien prueba contraseñas sobre una
//   cuenta, sin bloquear al dueño real que entra desde otro lugar.
// - IP: 20 fallidos en 15 min. Frena a quien prueba muchas cuentas distintas.
const LOGIN_WINDOW_MINUTES = 15;
const LOGIN_MAX_PER_ACCOUNT = 5;
const LOGIN_MAX_PER_IP = 20;

function loginKeys(request: Request, email: string) {
  const ip = clientIp(request);
  return { account: secretHash(`${ip}|${email}`), ip: secretHash(ip) };
}

export async function loginBlocked(request: Request, email: string): Promise<NextResponse | null> {
  const keys = loginKeys(request, email);
  const since = new Date(Date.now() - LOGIN_WINDOW_MINUTES * 60_000);
  const [account, ip] = await Promise.all([
    prisma.formSubmission.count({ where: { form: "login-account", ipHash: keys.account, createdAt: { gte: since } } }),
    prisma.formSubmission.count({ where: { form: "login-ip", ipHash: keys.ip, createdAt: { gte: since } } }),
  ]);
  if (account >= LOGIN_MAX_PER_ACCOUNT || ip >= LOGIN_MAX_PER_IP) {
    return NextResponse.json(
      { message: `Demasiados intentos fallidos. Esperá ${LOGIN_WINDOW_MINUTES} minutos y volvé a intentar.` },
      { status: 429 },
    );
  }
  return null;
}

export async function recordLoginFailure(request: Request, email: string): Promise<void> {
  const keys = loginKeys(request, email);
  await prisma.formSubmission.createMany({
    data: [
      { form: "login-account", ipHash: keys.account },
      { form: "login-ip", ipHash: keys.ip },
    ],
  });
  await prisma.formSubmission.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 24 * 60 * 60_000) } } });
}

// Al entrar bien se perdonan los fallidos de esa cuenta desde esa IP.
export async function clearLoginFailures(request: Request, email: string): Promise<void> {
  const keys = loginKeys(request, email);
  await prisma.formSubmission.deleteMany({ where: { form: "login-account", ipHash: keys.account } });
}
