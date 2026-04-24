import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/services/audit";
import JSZip from "jszip";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const BUCKET_NAME = "custom-sites";

export const maxDuration = 60;

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url, key };
}

async function supabaseUpload(
  config: { url: string; key: string },
  path: string,
  content: Uint8Array,
  contentType: string
) {
  const res = await fetch(
    `${config.url}/storage/v1/object/${BUCKET_NAME}/${path}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.key}`,
        "Content-Type": contentType,
        "x-upsert": "true",
      },
      body: Buffer.from(content),
    }
  );
  return res.ok;
}

async function supabaseDownload(
  config: { url: string; key: string },
  path: string
): Promise<ArrayBuffer | null> {
  const res = await fetch(
    `${config.url}/storage/v1/object/${BUCKET_NAME}/${path}`,
    {
      headers: { Authorization: `Bearer ${config.key}` },
    }
  );
  if (!res.ok) return null;
  return await res.arrayBuffer();
}

async function supabaseDeleteObject(
  config: { url: string; key: string },
  path: string
) {
  await fetch(`${config.url}/storage/v1/object/${BUCKET_NAME}/${path}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${config.key}` },
  });
}

async function supabaseDeleteFolder(
  config: { url: string; key: string },
  prefix: string
) {
  const listRes = await fetch(
    `${config.url}/storage/v1/object/list/${BUCKET_NAME}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prefix, limit: 1000 }),
    }
  );

  if (!listRes.ok) return;

  const items = await listRes.json();
  if (!Array.isArray(items) || items.length === 0) return;

  const filePaths = items
    .filter((item: { name: string; id?: string }) => item.id)
    .map((item: { name: string }) => `${prefix}/${item.name}`);

  if (filePaths.length > 0) {
    await fetch(`${config.url}/storage/v1/object/${BUCKET_NAME}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${config.key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prefixes: filePaths }),
    });
  }
}

function getContentType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  const types: Record<string, string> = {
    html: "text/html",
    htm: "text/html",
    css: "text/css",
    js: "application/javascript",
    mjs: "application/javascript",
    json: "application/json",
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
    pdf: "application/pdf",
    txt: "text/plain",
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

    const slug = client.websiteSlug;

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

    const arrayBuffer = await supabaseDownload(config, uploadPath);
    if (!arrayBuffer) {
      return NextResponse.json(
        { error: "Arquivo enviado não encontrado no storage" },
        { status: 400 }
      );
    }

    if (arrayBuffer.byteLength > MAX_FILE_SIZE) {
      await supabaseDeleteObject(config, uploadPath);
      return NextResponse.json(
        { error: "Arquivo excede o limite de 50MB" },
        { status: 400 }
      );
    }

    let zip: JSZip;
    try {
      zip = await JSZip.loadAsync(arrayBuffer);
    } catch {
      await supabaseDeleteObject(config, uploadPath);
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
        await supabaseDeleteObject(config, uploadPath);
        return NextResponse.json(
          { error: "O arquivo ZIP deve conter um index.html na raiz" },
          { status: 400 }
        );
      }
    }

    await supabaseDeleteFolder(config, slug);

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

        const ok = await supabaseUpload(config, storagePath, content, contentType);
        if (ok) {
          uploadedFiles.push(relativePath);
        } else {
          uploadErrors.push(relativePath);
        }
      } catch {
        uploadErrors.push(relativePath);
      }
    }

    await supabaseDeleteObject(config, uploadPath);

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

    const baseUrl = `${config.url}/storage/v1/object/public/${BUCKET_NAME}/${slug}/index.html`;

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

    const config = getSupabaseConfig();
    if (!config) {
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

    await supabaseDeleteFolder(config, client.websiteSlug);

    await prisma.client.update({
      where: { id: clientId },
      data: { websiteType: "template" },
    });

    logAudit({
      action: "delete_custom_site",
      entity: "website",
      entityId: clientId,
      userId: session.user.id,
      details: { slug: client.websiteSlug },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/websites/[clientId]/upload]", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
