import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional().or(z.literal("")),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, name: true, email: true, role: true },
  });

  return NextResponse.json(user);
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const body = await request.json();
  const parsed = updateProfileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { name, email } = parsed.data;
  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name;
  if (email !== undefined) data.email = email || null;

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, username: true, name: true, email: true, role: true },
  });

  return NextResponse.json(user);
}
