import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const client = await prisma.client.findUnique({
      where: { websiteSlug: slug },
      select: {
        id: true,
        brideFullName: true,
        groomFullName: true,
        coupleHashtag: true,
        weddingDate: true,
        ceremonyVenue: true,
        receptionVenue: true,
        city: true,
        state: true,
        websiteSlug: true,
        websiteStatus: true,
        websiteConfig: true,
        _count: { select: { giftItems: { where: { isActive: true } } } },
      },
    });

    if (!client || client.websiteStatus !== "published") {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    const { websiteStatus, ...data } = client;

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("[GET /api/public/[slug]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
