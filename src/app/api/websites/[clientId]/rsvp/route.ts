import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clientId } = await params;

    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { websiteSlug: true },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    if (!client.websiteSlug) {
      return NextResponse.json({ error: "Client has no website slug" }, { status: 400 });
    }

    const rsvps = await prisma.rsvp.findMany({
      where: { websiteSlug: client.websiteSlug },
      orderBy: { createdAt: "desc" },
    });

    const total = rsvps.length;
    const confirmed = rsvps.filter((r) => r.attendance === "sim").length;
    const declined = rsvps.filter((r) => r.attendance === "nao").length;
    const maybe = rsvps.filter((r) => r.attendance === "talvez").length;

    return NextResponse.json({
      data: rsvps,
      counts: { total, confirmed, declined, maybe },
    });
  } catch (error) {
    console.error("[GET /api/websites/[clientId]/rsvp]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
