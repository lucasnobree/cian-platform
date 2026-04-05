import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { clientCreateSchema } from "@/lib/validators/client";
import { logAudit } from "@/lib/services/audit";
import { applyRateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  try {
    // Defense-in-depth: verify session even though middleware checks auth
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Internal server error", debug: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Defense-in-depth: verify session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit: 20 creates per minute per IP
    const limited = applyRateLimit(request, { maxRequests: 20, windowMs: 60_000 }, "clients:create");
    if (limited) return limited;

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

    const userId = (session.user as unknown as { id: string }).id;
    logAudit({ action: "create", entity: "client", entityId: client.id, userId });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error("[POST /api/clients]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
