import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    const documents = await prisma.document.findMany({
      where: { clientId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("[GET /api/clients/[id]/documents]", error);
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
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = (formData.get("type") as string) || "material";

    if (!file) {
      return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 });
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Arquivo excede 10MB" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Tipo de arquivo não permitido. Use JPG, PNG, WebP, GIF ou PDF." }, { status: 400 });
    }

    // Upload to Supabase Storage
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Storage não configurado" }, { status: 500 });
    }

    const ext = file.name.split(".").pop() || "bin";
    const storagePath = `clients/${id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const uploadRes = await fetch(
      `${supabaseUrl}/storage/v1/object/materials/${storagePath}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": file.type,
        },
        body: arrayBuffer,
      }
    );

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.error("[Upload error]", errText);
      return NextResponse.json({ error: "Erro ao fazer upload" }, { status: 500 });
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/materials/${storagePath}`;

    // Save document record
    const document = await prisma.document.create({
      data: {
        clientId: id,
        name: file.name,
        type,
        url: publicUrl,
        size: file.size,
        mimeType: file.type,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("[POST /api/clients/[id]/documents]", error);
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

    const { searchParams } = new URL(req.url);
    const docId = searchParams.get("docId");
    if (!docId) {
      return NextResponse.json({ error: "docId required" }, { status: 400 });
    }

    const { id } = await params;
    const doc = await prisma.document.findFirst({
      where: { id: docId, clientId: id },
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Delete from Supabase Storage
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseKey && doc.url.includes("/storage/")) {
      const storagePath = doc.url.split("/materials/")[1];
      if (storagePath) {
        await fetch(
          `${supabaseUrl}/storage/v1/object/materials/${storagePath}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${supabaseKey}` },
          }
        );
      }
    }

    await prisma.document.delete({ where: { id: docId } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/clients/[id]/documents]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
