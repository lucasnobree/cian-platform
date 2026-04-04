import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      activeWeddings,
      nextWedding,
      pendingGifts,
      monthGifts,
      recentClients,
      upcomingDeadlines,
      pipelineCounts,
    ] = await Promise.all([
      // Active weddings
      prisma.client.count({
        where: { pipelineStage: { in: ["contract_signed", "in_production"] } },
      }),
      // Next wedding
      prisma.client.findFirst({
        where: { weddingDate: { gte: now } },
        orderBy: { weddingDate: "asc" },
        select: { id: true, brideFullName: true, groomFullName: true, weddingDate: true },
      }),
      // Pending payments
      prisma.gift.aggregate({
        where: { paymentStatus: "pending" },
        _count: true,
        _sum: { amount: true },
      }),
      // Month revenue
      prisma.gift.aggregate({
        where: { paymentStatus: "paid", paidAt: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      // Recent clients
      prisma.client.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, brideFullName: true, groomFullName: true, pipelineStage: true, weddingDate: true },
      }),
      // Upcoming deadlines
      prisma.client.findMany({
        where: { weddingDate: { gte: now } },
        take: 5,
        orderBy: { weddingDate: "asc" },
        select: { id: true, brideFullName: true, groomFullName: true, weddingDate: true },
      }),
      // Pipeline counts
      prisma.client.groupBy({
        by: ["pipelineStage"],
        _count: true,
      }),
    ]);

    const daysUntilNext = nextWedding
      ? Math.ceil((nextWedding.weddingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return NextResponse.json({
      activeWeddings,
      nextWedding: nextWedding ? { ...nextWedding, daysUntil: daysUntilNext } : null,
      pendingPayments: {
        count: pendingGifts._count,
        total: pendingGifts._sum.amount || 0,
      },
      monthRevenue: monthGifts._sum.amount || 0,
      recentClients,
      upcomingDeadlines: upcomingDeadlines.map((c: { id: string; brideFullName: string; groomFullName: string; weddingDate: Date }) => ({
        ...c,
        daysUntil: Math.ceil((c.weddingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      })),
      pipelineCounts: Object.fromEntries(pipelineCounts.map((p: { pipelineStage: string; _count: number }) => [p.pipelineStage, p._count])),
    });
  } catch (error) {
    console.error("[GET /api/dashboard/stats]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
