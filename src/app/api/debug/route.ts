import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await prisma.user.findFirst({
      select: { id: true, username: true, name: true, role: true, isActive: true },
    });

    return NextResponse.json({
      status: "connected",
      user: user ?? "no users found",
      dbUrl: process.env.DATABASE_URL?.replace(/:[^@]+@/, ":***@"),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({
      status: "error",
      error: message,
      dbUrl: process.env.DATABASE_URL?.replace(/:[^@]+@/, ":***@"),
    }, { status: 500 });
  }
}
