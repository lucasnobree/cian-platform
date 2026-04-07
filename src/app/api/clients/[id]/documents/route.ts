import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ALLOWED_TYPES = [
  "image/jpeg", "image/png", "image/webp", "image/gif",
  "image/svg+xml", "application/pdf",
];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url, key };
}

// GET: List documents for a client
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

// POST: Generate signed upload URL + save document record
// The frontend uploads directly to Supabase using this URL
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const config = getSupabaseConfig();
    if (!config) {
      return NextResponse.json({ error: "Storage não configurado" }, { status: 500 });
    }

    const { id } = await params;

    const client = await prisma.client.findUnique({ where: { id }, select: { id: true } });
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const body = await req.json();
    const { fileName, fileSize, fileType, category } = body;

    if (!fileName || !fileSize || !fileType) {
      return NextResponse.json({ error: "fileName, fileSize e fileType são obrigatórios" }, { status: 400 });
    }

    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Arquivo excede 50MB" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(fileType)) {
      return NextResponse.json({
        error: "Tipo não permitido. Use JPG, PNG, WebP, GIF, SVG ou PDF.",
      }, { status: 400 });
    }

    // Generate unique storage path
    const ext = fileName.split(".").pop() || "bin";
    const storagePath = `clients/${id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    // Create signed upload URL (valid for 2 minutes)
    const signRes = await fetch(
      `${config.url}/storage/v1/object/upload/sign/materials/${storagePath}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ expiresIn: 120 }),
      }
    );

    if (!signRes.ok) {
      const errText = await signRes.text();
      console.error("[Sign URL error]", errText);
      return NextResponse.json({ error: "Erro ao gerar URL de upload" }, { status: 500 });
    }

    const signData = await signRes.json();
    const uploadUrl = `${config.url}/storage/v1${signData.url}`;
    const publicUrl = `${config.url}/storage/v1/object/public/materials/${storagePath}`;

    // Save document record in database
    const document = await prisma.document.create({
      data: {
        clientId: id,
        name: fileName,
        type: category || "outros",
        url: publicUrl,
        size: fileSize,
        mimeType: fileType,
      },
    });

    return NextResponse.json({
      document,
      uploadUrl,
      uploadHeaders: {
        "Content-Type": fileType,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/clients/[id]/documents]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: Remove document and file from storage
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
    const config = getSupabaseConfig();
    if (config && doc.url.includes("/storage/")) {
      const storagePath = doc.url.split("/materials/")[1];
      if (storagePath) {
        await fetch(
          `${config.url}/storage/v1/object/materials/${storagePath}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${config.key}` },
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
