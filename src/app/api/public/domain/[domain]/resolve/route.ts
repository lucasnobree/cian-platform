import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Lightweight endpoint to resolve a custom domain to a website slug.
// Called by the middleware to rewrite custom domain requests.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ domain: string }> }
) {
  try {
    const { domain } = await params;

    const client = await prisma.client.findFirst({
      where: {
        customDomain: domain,
        websiteStatus: "published",
      },
      select: { websiteSlug: true },
    });

    if (!client?.websiteSlug) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(
      { slug: client.websiteSlug },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("[GET /api/public/domain/[domain]/resolve]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
