import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pipelineStageSchema } from "@/lib/validators/client";
import { logAudit } from "@/lib/services/audit";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = pipelineStageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid stage", issues: parsed.error.issues }, { status: 400 });
    }

    const current = await prisma.client.findUnique({ where: { id }, select: { pipelineStage: true } });
    if (!current) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const client = await prisma.client.update({
      where: { id },
      data: { pipelineStage: parsed.data.stage },
    });

    const userId = (session.user as unknown as { id: string }).id;
    logAudit({
      action: "update",
      entity: "client",
      entityId: id,
      userId,
      details: { field: "pipelineStage", from: current.pipelineStage, to: parsed.data.stage },
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error("[PUT /api/clients/[id]/stage]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
