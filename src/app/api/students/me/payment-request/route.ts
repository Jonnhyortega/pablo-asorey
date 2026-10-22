import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { cancelPaymentReport, reportPayment, type PaymentResult } from "@/lib/payments";

async function withStudent(action: (studentId: string) => Promise<PaymentResult>) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const student = await prisma.student.findUnique({ where: { userId: session.id }, select: { id: true } });
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    const result = await action(student.id);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error en aviso de pago:", error);
    return NextResponse.json({ error: "Failed to update payment request" }, { status: 500 });
  }
}

// El alumno informa que pagó.
export async function POST() {
  return withStudent(reportPayment);
}

// El alumno deshace el aviso (por ejemplo, si tocó "Ya pagué" sin querer).
export async function DELETE() {
  return withStudent(cancelPaymentReport);
}
