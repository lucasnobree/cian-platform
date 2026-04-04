import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clientUpdateSchema } from "@/lib/validators/client";
import { logAudit } from "@/lib/services/audit";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        _count: { select: { documents: true, interactions: true, gifts: true, giftItems: true } },
        websiteConfig: { select: { id: true } },
      },
    });
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });
    return NextResponse.json(client);
  } catch (error) {
    console.error("[GET /api/clients/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = clientUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 400 });
    }

    const data: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.weddingDate) data.weddingDate = new Date(parsed.data.weddingDate);

    const client = await prisma.client.update({ where: { id }, data });
    logAudit({ action: "update", entity: "client", entityId: id });
    return NextResponse.json(client);
  } catch (error) {
    console.error("[PUT /api/clients/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.client.delete({ where: { id } });
    logAudit({ action: "delete", entity: "client", entityId: id });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/clients/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
