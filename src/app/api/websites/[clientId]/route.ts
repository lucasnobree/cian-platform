import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { websiteConfigUpdateSchema } from "@/lib/validators/website";
import { logAudit } from "@/lib/services/audit";

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
      select: {
        id: true,
        brideFullName: true,
        groomFullName: true,
        weddingDate: true,
        websiteSlug: true,
        websiteStatus: true,
        customDomain: true,
        websiteConfig: true,
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error("[GET /api/websites/[clientId]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clientId } = await params;

    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { id: true },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = websiteConfigUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const config = await prisma.websiteConfig.upsert({
      where: { clientId },
      create: {
        clientId,
        ...parsed.data,
      },
      update: parsed.data,
    });

    const userId = (session.user as unknown as { id: string }).id;
    logAudit({
      action: "upsert",
      entity: "websiteConfig",
      entityId: config.id,
      userId,
      details: { clientId },
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error("[PUT /api/websites/[clientId]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
