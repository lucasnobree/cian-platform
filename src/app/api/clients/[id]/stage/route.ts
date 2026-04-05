import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pipelineStageSchema } from "@/lib/validators/client";
import { logAudit } from "@/lib/services/audit";
import { isTrelloConfigured, setupBoardForWedding } from "@/lib/services/trello";

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

    const current = await prisma.client.findUnique({
      where: { id },
      select: {
        pipelineStage: true,
        trelloBoardId: true,
        brideFullName: true,
        groomFullName: true,
        servicePackage: true,
      },
    });
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

    // Auto-create Trello board when moving to contract_signed
    if (
      parsed.data.stage === "contract_signed" &&
      !current.trelloBoardId &&
      isTrelloConfigured()
    ) {
      try {
        const coupleName = `${current.brideFullName} & ${current.groomFullName}`;
        const { boardId, boardUrl } = await setupBoardForWedding(
          coupleName,
          current.servicePackage ?? undefined
        );

        await prisma.client.update({
          where: { id },
          data: { trelloBoardId: boardId, trelloBoardUrl: boardUrl },
        });

        logAudit({
          action: "create",
          entity: "trello_board",
          entityId: boardId,
          userId,
          details: { clientId: id, boardUrl },
        });
      } catch (trelloError) {
        // Trello failure is non-critical — don't block the stage change
        console.error("[Trello] Failed to create board for client", id, trelloError);
      }
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error("[PUT /api/clients/[id]/stage]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
