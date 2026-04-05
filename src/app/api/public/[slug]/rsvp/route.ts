import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rsvpCreateSchema } from "@/lib/validators/website";
import { applyRateLimit } from "@/lib/rate-limit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Rate limit: 5 per minute per IP
    const limited = applyRateLimit(
      req,
      { maxRequests: 5, windowMs: 60_000 },
      `rsvp:${slug}`
    );
    if (limited) return limited;

    const body = await req.json();
    const parsed = rsvpCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { website, ...rsvpData } = parsed.data;

    // Honeypot: if the hidden "website" field has a value, silently succeed (bot trap)
    if (website) {
      return NextResponse.json({ message: "RSVP enviado com sucesso!" }, { status: 201 });
    }

    // Verify slug exists and site is published
    const client = await prisma.client.findUnique({
      where: { websiteSlug: slug },
      select: { websiteStatus: true },
    });

    if (!client || client.websiteStatus !== "published") {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    await prisma.rsvp.create({
      data: {
        websiteSlug: slug,
        guestName: rsvpData.guestName,
        guestEmail: rsvpData.guestEmail ?? null,
        guestPhone: rsvpData.guestPhone ?? null,
        attendance: rsvpData.attendance,
        companions: rsvpData.companions,
        dietaryNotes: rsvpData.dietaryNotes ?? null,
        message: rsvpData.message ?? null,
      },
    });

    return NextResponse.json(
      { message: "RSVP enviado com sucesso!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/public/[slug]/rsvp]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
