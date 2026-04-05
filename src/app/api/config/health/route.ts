import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isTrelloConfigured } from "@/lib/services/trello";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check database connectivity
    let database = false;
    try {
      await prisma.user.findFirst({ select: { id: true } });
      database = true;
    } catch {
      database = false;
    }

    return NextResponse.json({
      trello: isTrelloConfigured(),
      database,
      version: "1.0.0",
    });
  } catch (error) {
    console.error("[GET /api/config/health]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
