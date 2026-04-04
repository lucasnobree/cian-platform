import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clientCreateSchema } from "@/lib/validators/client";
import { logAudit } from "@/lib/services/audit";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const stage = searchParams.get("stage") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { brideFullName: { contains: search, mode: "insensitive" } },
        { groomFullName: { contains: search, mode: "insensitive" } },
        { brideEmail: { contains: search, mode: "insensitive" } },
        { coupleHashtag: { contains: search, mode: "insensitive" } },
      ];
    }

    if (stage) where.pipelineStage = stage;

    const [data, total] = await Promise.all([
      prisma.client.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
      prisma.client.count({ where }),
    ]);

    return NextResponse.json({ data, total, page, limit });
  } catch (error) {
    console.error("[GET /api/clients]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = clientCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 400 });
    }

    const client = await prisma.client.create({
      data: {
        ...parsed.data,
        weddingDate: new Date(parsed.data.weddingDate),
        contractValue: parsed.data.contractValue ?? undefined,
      },
    });

    logAudit({ action: "create", entity: "client", entityId: client.id });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error("[POST /api/clients]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
