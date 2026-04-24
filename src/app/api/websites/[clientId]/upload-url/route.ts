import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

const BUCKET_NAME = "custom-sites";
const MAX_FILE_SIZE = 50 * 1024 * 1024;

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url, key };
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
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

    const { clientId } = await params;

    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { id: true, websiteSlug: true },
    });

    if (!client) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    if (!client.websiteSlug) {
      return NextResponse.json(
        { error: "Cliente precisa ter um slug antes de enviar site customizado" },
        { status: 400 }
      );
    }

    const uploadPath = `_uploads/${client.websiteSlug}/${randomUUID()}.zip`;

    const signRes = await fetch(
      `${config.url}/storage/v1/object/upload/sign/${BUCKET_NAME}/${uploadPath}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ expiresIn: 600 }),
      }
    );

    if (!signRes.ok) {
      const detail = await signRes.text();
      console.error("[upload-url] signed url failed", signRes.status, detail);
      return NextResponse.json(
        { error: "Não foi possível gerar URL de upload" },
        { status: 500 }
      );
    }

    const signed = (await signRes.json()) as { url?: string; token?: string };
    if (!signed.token) {
      return NextResponse.json(
        { error: "Resposta inválida do storage" },
        { status: 500 }
      );
    }

    const uploadUrl = `${config.url}/storage/v1/object/upload/sign/${BUCKET_NAME}/${uploadPath}?token=${signed.token}`;

    return NextResponse.json({
      uploadUrl,
      uploadPath,
      maxFileSize: MAX_FILE_SIZE,
    });
  } catch (error) {
    console.error("[POST /api/websites/[clientId]/upload-url]", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
