import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const notifications = await prisma.adminNotification.findMany({
      orderBy: { createdAt: "desc" },
      take: 50 // Traeremos las últimas 50 para empezar
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}
