import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/services/audit";
import { getSupabaseAdmin, getSupabaseUrl } from "@/lib/supabase-storage";
import JSZip from "jszip";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const BUCKET_NAME = "custom-sites";

export const maxDuration = 60;

function getContentType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  const types: Record<string, string> = {
    html: "text/html; charset=utf-8",
    htm: "text/html; charset=utf-8",
    css: "text/css; charset=utf-8",
    js: "application/javascript; charset=utf-8",
    mjs: "application/javascript; charset=utf-8",
    json: "application/json; charset=utf-8",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    svg: "image/svg+xml",
    webp: "image/webp",
    ico: "image/x-icon",
    woff: "font/woff",
    woff2: "font/woff2",
    ttf: "font/ttf",
    otf: "font/otf",
    mp4: "video/mp4",
    webm: "video/webm",
    pdf: "application/pdf",
    txt: "text/plain; charset=utf-8",
  };
  return types[ext || ""] || "application/octet-stream";
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const supabaseUrl = getSupabaseUrl();
    if (!supabase || !supabaseUrl) {
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

    const slug = client.websiteSlug;
    const bucket = supabase.storage.from(BUCKET_NAME);

    const body = (await req.json()) as { uploadPath?: string };
    const uploadPath = body.uploadPath;

    if (!uploadPath || typeof uploadPath !== "string") {
      return NextResponse.json(
        { error: "uploadPath é obrigatório" },
        { status: 400 }
      );
    }

    if (!uploadPath.startsWith(`_uploads/${slug}/`) || !uploadPath.endsWith(".zip")) {
      return NextResponse.json(
        { error: "uploadPath inválido" },
        { status: 400 }
      );
    }

    const downloadRes = await bucket.download(uploadPath);
    if (downloadRes.error || !downloadRes.data) {
      return NextResponse.json(
        { error: "Arquivo enviado não encontrado no storage" },
        { status: 400 }
      );
    }
    const arrayBuffer = await downloadRes.data.arrayBuffer();

    if (arrayBuffer.byteLength > MAX_FILE_SIZE) {
      await bucket.remove([uploadPath]);
      return NextResponse.json(
        { error: "Arquivo excede o limite de 50MB" },
        { status: 400 }
      );
    }

    let zip: JSZip;
    try {
      zip = await JSZip.loadAsync(arrayBuffer);
    } catch {
      await bucket.remove([uploadPath]);
      return NextResponse.json(
        { error: "Arquivo .zip inválido ou corrompido" },
        { status: 400 }
      );
    }

    const allEntries = Object.entries(zip.files).filter(([, entry]) => !entry.dir);

    // Detect a single common root folder and strip it. Handles the common
    // case where users zip a folder ("Site/index.html") instead of its contents.
    let stripPrefix = "";
    if (!zip.file("index.html") && allEntries.length > 0) {
      const firstSegments = allEntries.map(([path]) => path.split("/")[0]);
      const allSame = firstSegments.every((s) => s === firstSegments[0] && s !== "");
      if (allSame && zip.file(`${firstSegments[0]}/index.html`)) {
        stripPrefix = `${firstSegments[0]}/`;
      } else {
        await bucket.remove([uploadPath]);
        return NextResponse.json(
          { error: "O arquivo ZIP deve conter um index.html na raiz" },
          { status: 400 }
        );
      }
    }

    // Wipe previous deploy
    const prevList = await bucket.list(slug, { limit: 1000 });
    if (prevList.data && prevList.data.length > 0) {
      const toRemove = prevList.data
        .filter((item) => item.id)
        .map((item) => `${slug}/${item.name}`);
      if (toRemove.length > 0) {
        await bucket.remove(toRemove);
      }
    }

    const uploadedFiles: string[] = [];
    const uploadErrors: string[] = [];

    const fileEntries = stripPrefix
      ? allEntries.filter(([path]) => path.startsWith(stripPrefix))
      : allEntries;

    for (const [originalPath, zipEntry] of fileEntries) {
      const relativePath = stripPrefix
        ? originalPath.slice(stripPrefix.length)
        : originalPath;
      if (!relativePath) continue;
      try {
        const content = await zipEntry.async("uint8array");
        const storagePath = `${slug}/${relativePath}`;
        const contentType = getContentType(relativePath);

        const blob = new Blob([content as BlobPart], { type: contentType });
        const upRes = await bucket.upload(storagePath, blob, {
          contentType,
          upsert: true,
          cacheControl: "3600",
        });

        if (upRes.error) {
          console.error(`[upload] ${storagePath}:`, upRes.error.message);
          uploadErrors.push(relativePath);
        } else {
          uploadedFiles.push(relativePath);
        }
      } catch (err) {
        console.error(`[upload] exception for ${relativePath}:`, err);
        uploadErrors.push(relativePath);
      }
    }

    await bucket.remove([uploadPath]);

    if (uploadedFiles.length === 0) {
      return NextResponse.json(
        { error: "Nenhum arquivo foi enviado com sucesso", details: uploadErrors },
        { status: 500 }
      );
    }

    await prisma.client.update({
      where: { id: clientId },
      data: { websiteType: "custom" },
    });

    logAudit({
      action: "upload_custom_site",
      entity: "website",
      entityId: clientId,
      userId: session.user.id,
      details: { slug, filesCount: uploadedFiles.length },
    });

    const baseUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${slug}/index.html`;

    return NextResponse.json({
      success: true,
      url: baseUrl,
      filesUploaded: uploadedFiles.length,
      errors: uploadErrors.length > 0 ? uploadErrors : undefined,
    });
  } catch (error) {
    console.error("[POST /api/websites/[clientId]/upload]", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Storage não configurado" }, { status: 500 });
    }

    const { clientId } = await params;

    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { id: true, websiteSlug: true },
    });

    if (!client?.websiteSlug) {
      return NextResponse.json({ error: "Cliente não encontrado ou sem slug" }, { status: 404 });
    }

    const slug = client.websiteSlug;
    const bucket = supabase.storage.from(BUCKET_NAME);

    const list = await bucket.list(slug, { limit: 1000 });
    if (list.data && list.data.length > 0) {
      const toRemove = list.data
        .filter((item) => item.id)
        .map((item) => `${slug}/${item.name}`);
      if (toRemove.length > 0) {
        await bucket.remove(toRemove);
      }
    }

    await prisma.client.update({
      where: { id: clientId },
      data: { websiteType: "template" },
    });

    logAudit({
      action: "delete_custom_site",
      entity: "website",
      entityId: clientId,
      userId: session.user.id,
      details: { slug },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/websites/[clientId]/upload]", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
