import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stepCreateSchema, stepUpdateSchema, stepDeleteSchema } from "@/lib/validators/project-step";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify client exists
    const client = await prisma.client.findUnique({ where: { id }, select: { id: true } });
    if (!client) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    const steps = await prisma.projectStep.findMany({
      where: { clientId: id },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(steps);
  } catch (error) {
    console.error("[GET /api/clients/[id]/steps]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify client exists
    const client = await prisma.client.findUnique({ where: { id }, select: { id: true } });
    if (!client) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = stepCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 400 });
    }

    const data = parsed.data;

    // If sortOrder not provided, put it at the end
    let sortOrder = data.sortOrder;
    if (sortOrder === undefined) {
      const lastStep = await prisma.projectStep.findFirst({
        where: { clientId: id },
        orderBy: { sortOrder: "desc" },
        select: { sortOrder: true },
      });
      sortOrder = lastStep ? lastStep.sortOrder + 1 : 0;
    }

    const step = await prisma.projectStep.create({
      data: {
        clientId: id,
        name: data.name,
        description: data.description || null,
        deadline: data.deadline ? new Date(data.deadline) : null,
        requiresStep: data.requiresStep || null,
        ...(data.checklist ? { checklist: data.checklist } : {}),
        sortOrder,
      },
    });

    return NextResponse.json(step, { status: 201 });
  } catch (error) {
    console.error("[POST /api/clients/[id]/steps]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = stepUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 400 });
    }

    const { stepId, ...updateData } = parsed.data;

    // Verify step belongs to this client
    const existing = await prisma.projectStep.findFirst({
      where: { id: stepId, clientId: id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Etapa não encontrada" }, { status: 404 });
    }

    // Build update payload
    const payload: Record<string, unknown> = {};
    if (updateData.name !== undefined) payload.name = updateData.name;
    if (updateData.description !== undefined) payload.description = updateData.description;
    if (updateData.status !== undefined) payload.status = updateData.status;
    if (updateData.sortOrder !== undefined) payload.sortOrder = updateData.sortOrder;
    if (updateData.revisionReason !== undefined) payload.revisionReason = updateData.revisionReason;
    if (updateData.checklist !== undefined) payload.checklist = updateData.checklist;

    // Handle dates
    if (updateData.deadline !== undefined) {
      payload.deadline = updateData.deadline ? new Date(updateData.deadline) : null;
    }
    if (updateData.revisedDeadline !== undefined) {
      payload.revisedDeadline = updateData.revisedDeadline ? new Date(updateData.revisedDeadline) : null;
    }
    if (updateData.completedAt !== undefined) {
      payload.completedAt = updateData.completedAt ? new Date(updateData.completedAt) : null;
    }

    // Auto-set completedAt when status changes to completed
    if (updateData.status === "completed" && existing.status !== "completed") {
      payload.completedAt = new Date();
    }
    // Clear completedAt when status changes away from completed
    if (updateData.status && updateData.status !== "completed" && existing.status === "completed") {
      payload.completedAt = null;
    }

    const step = await prisma.projectStep.update({
      where: { id: stepId },
      data: payload,
    });

    return NextResponse.json(step);
  } catch (error) {
    console.error("[PUT /api/clients/[id]/steps]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const stepId = searchParams.get("stepId");

    const parsed = stepDeleteSchema.safeParse({ stepId });
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 400 });
    }

    // Verify step belongs to this client
    const existing = await prisma.projectStep.findFirst({
      where: { id: parsed.data.stepId, clientId: id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Etapa não encontrada" }, { status: 404 });
    }

    await prisma.projectStep.delete({ where: { id: parsed.data.stepId } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/clients/[id]/steps]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
