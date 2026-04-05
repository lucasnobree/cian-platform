import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { publishActionSchema } from "@/lib/validators/website";
import { logAudit } from "@/lib/services/audit";

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

    const body = await req.json();
    const parsed = publishActionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { action } = parsed.data;

    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        websiteSlug: true,
        websiteStatus: true,
        websiteConfig: { select: { id: true } },
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    if (action === "publish") {
      if (!client.websiteSlug) {
        return NextResponse.json(
          { error: "Client must have a website slug before publishing" },
          { status: 400 }
        );
      }
      if (!client.websiteConfig) {
        return NextResponse.json(
          { error: "Website configuration must exist before publishing" },
          { status: 400 }
        );
      }
    }

    const newStatus = action === "publish" ? "published" : "draft";

    const updated = await prisma.client.update({
      where: { id: clientId },
      data: { websiteStatus: newStatus },
      select: {
        id: true,
        websiteSlug: true,
        websiteStatus: true,
      },
    });

    const userId = (session.user as unknown as { id: string }).id;
    logAudit({
      action,
      entity: "website",
      entityId: clientId,
      userId,
      details: { newStatus },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PUT /api/websites/[clientId]/publish]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
