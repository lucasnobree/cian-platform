import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pipelineStageSchema } from "@/lib/validators/client";
import { logAudit } from "@/lib/services/audit";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
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

    logAudit({
      action: "update",
      entity: "client",
      entityId: id,
      details: { field: "pipelineStage", from: current.pipelineStage, to: parsed.data.stage },
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error("[PUT /api/clients/[id]/stage]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
