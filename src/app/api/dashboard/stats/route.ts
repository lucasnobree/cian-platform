import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const fourteenDaysFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const [
      activeWeddings,
      nextWedding,
      pendingGifts,
      monthGifts,
      recentClients,
      upcomingDeadlines,
      pipelineCounts,
      upcomingStepDeadlines,
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
      // Upcoming step deadlines (within 14 days, not completed)
      prisma.projectStep.findMany({
        where: {
          status: { not: "completed" },
          OR: [
            { revisedDeadline: { lte: fourteenDaysFromNow } },
            { deadline: { lte: fourteenDaysFromNow }, revisedDeadline: null },
          ],
        },
        orderBy: { deadline: "asc" },
        take: 10,
        select: {
          id: true,
          name: true,
          deadline: true,
          revisedDeadline: true,
          status: true,
          client: {
            select: { id: true, brideFullName: true, groomFullName: true },
          },
        },
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
      upcomingStepDeadlines: upcomingStepDeadlines.map((s) => {
        const effectiveDeadline = s.revisedDeadline || s.deadline;
        return {
          ...s,
          effectiveDeadline,
          daysUntil: effectiveDeadline
            ? Math.ceil((new Date(effectiveDeadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            : null,
        };
      }),
    });
  } catch (error) {
    console.error("[GET /api/dashboard/stats]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
