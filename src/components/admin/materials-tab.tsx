"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Upload,
  Download,
  Trash2,
  Image,
  FileText,
  Loader2,
  X,
  Palette,
  Type,
  Diamond,
  PenTool,
  FileImage,
  Camera,
  ScrollText,
  FolderOpen,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number | null;
  mimeType: string | null;
  createdAt: string;
}

const CATEGORIES = [
  { value: "identidade_visual", label: "Identidade Visual", icon: Palette, color: "text-cian-600 bg-cian-50" },
  { value: "tipografia", label: "Tipografia", icon: Type, color: "text-violet-600 bg-violet-50" },
  { value: "logo_monograma", label: "Logo / Monograma", icon: Diamond, color: "text-amber-600 bg-amber-50" },
  { value: "ilustracoes", label: "Ilustrações", icon: PenTool, color: "text-rose-600 bg-rose-50" },
  { value: "papelaria", label: "Papelaria", icon: FileImage, color: "text-sky-600 bg-sky-50" },
  { value: "fotos_referencia", label: "Fotos de Referência", icon: Camera, color: "text-emerald-600 bg-emerald-50" },
  { value: "contratos", label: "Contratos", icon: ScrollText, color: "text-sand-600 bg-sand-100" },
  { value: "outros", label: "Outros", icon: FolderOpen, color: "text-sand-500 bg-sand-100" },
];

function getCategoryInfo(type: string) {
  return CATEGORIES.find((c) => c.value === type) || CATEGORIES[CATEGORIES.length - 1];
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImage(mimeType: string | null): boolean {
  return mimeType?.startsWith("image/") ?? false;
}

export function MaterialsTab({
  clientId,
  onUpdate,
}: {
  clientId: string;
  onUpdate: () => void;
}) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadCategory, setUploadCategory] = useState("identidade_visual");
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch(`/api/clients/${clientId}/documents`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDocuments(data);
    } catch {
      setError("Erro ao carregar materiais");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");

    for (const file of Array.from(files)) {
      try {
        // 1. Get signed upload URL from API
        const res = await fetch(`/api/clients/${clientId}/documents`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            category: uploadCategory,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || "Erro ao preparar upload");
        }

        const { uploadUrl, uploadHeaders } = await res.json();

        // 2. Upload directly to Supabase Storage (bypasses Vercel 4.5MB limit)
        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: uploadHeaders,
          body: file,
        });

        if (!uploadRes.ok) {
          throw new Error("Erro ao enviar arquivo para o storage");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao enviar arquivo");
      }
    }

    setUploading(false);
    fetchDocuments();
    onUpdate();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async (docId: string, name: string) => {
    if (!confirm(`Excluir "${name}"?`)) return;
    try {
      const res = await fetch(
        `/api/clients/${clientId}/documents?docId=${docId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error();
      fetchDocuments();
      onUpdate();
    } catch {
      alert("Erro ao excluir arquivo");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  };

  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  // Group documents by category
  const grouped = CATEGORIES.map((cat) => ({
    ...cat,
    docs: documents.filter((d) => d.type === cat.value),
  })).filter((g) => g.docs.length > 0);

  // Docs without a known category
  const uncategorized = documents.filter(
    (d) => !CATEGORIES.some((c) => c.value === d.type) && d.type !== "material"
  );
  const legacy = documents.filter((d) => d.type === "material");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cian-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Upload area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "rounded-xl border-2 border-dashed p-6 transition-colors",
          dragOver
            ? "border-cian-400 bg-cian-50/30"
            : "border-sand-200 hover:border-sand-300"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif,application/pdf,image/svg+xml"
          onChange={(e) => handleUpload(e.target.files)}
          className="hidden"
        />
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Upload
            size={28}
            strokeWidth={1.5}
            className="text-sand-400 shrink-0"
          />
          <div className="flex-1 text-center sm:text-left">
            <p className="text-sm text-sand-600">
              Arraste arquivos aqui ou{" "}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-cian-600 font-medium hover:underline"
                disabled={uploading}
              >
                selecione do computador
              </button>
            </p>
            <p className="text-xs text-sand-400 mt-0.5">
              JPG, PNG, WebP, GIF, SVG ou PDF — máx. 50MB
            </p>
          </div>
          <div className="shrink-0">
            <label className="text-[10px] text-sand-500 block mb-1">Categoria</label>
            <Select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
              className="h-8 text-xs min-w-40"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
        {uploading && (
          <div className="mt-3 flex items-center justify-center gap-2 text-sm text-cian-600">
            <Loader2 size={16} className="animate-spin" />
            Enviando...
          </div>
        )}
      </div>

      {/* Empty state */}
      {documents.length === 0 && (
        <Card className="flex flex-col items-center justify-center py-12">
          <Image size={48} strokeWidth={1} className="text-sand-300 mb-4" />
          <p className="text-sm text-sand-500">Nenhum material adicionado</p>
          <p className="text-xs text-sand-400 mt-1">
            Envie identidades visuais, fotos de referência, contratos e mais
          </p>
        </Card>
      )}

      {/* Categorized files */}
      {grouped.map((group) => {
        const Icon = group.icon;
        const isCollapsed = collapsedCategories.has(group.value);
        return (
          <div key={group.value}>
            <button
              type="button"
              onClick={() => toggleCategory(group.value)}
              className="flex items-center gap-2 mb-2 w-full text-left group"
            >
              {isCollapsed ? (
                <ChevronRight size={14} className="text-sand-400" />
              ) : (
                <ChevronDown size={14} className="text-sand-400" />
              )}
              <div className={cn("w-6 h-6 rounded-md flex items-center justify-center", group.color)}>
                <Icon size={13} strokeWidth={1.5} />
              </div>
              <span className="text-sm font-medium text-sand-700">{group.label}</span>
              <span className="text-xs text-sand-400">({group.docs.length})</span>
            </button>

            {!isCollapsed && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 ml-6 mb-4">
                {group.docs.map((doc) => (
                  <FileCard
                    key={doc.id}
                    doc={doc}
                    onPreview={() => setPreviewUrl(doc.url)}
                    onDelete={() => handleDelete(doc.id, doc.name)}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Legacy/uncategorized files */}
      {(legacy.length > 0 || uncategorized.length > 0) && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center text-sand-500 bg-sand-100">
              <FolderOpen size={13} strokeWidth={1.5} />
            </div>
            <span className="text-sm font-medium text-sand-700">Sem categoria</span>
            <span className="text-xs text-sand-400">({legacy.length + uncategorized.length})</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 ml-6">
            {[...legacy, ...uncategorized].map((doc) => (
              <FileCard
                key={doc.id}
                doc={doc}
                onPreview={() => setPreviewUrl(doc.url)}
                onDelete={() => handleDelete(doc.id, doc.name)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Image preview modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white"
            onClick={() => setPreviewUrl(null)}
          >
            <X size={24} />
          </button>
          <img
            src={previewUrl}
            alt="Preview"
            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

function FileCard({
  doc,
  onPreview,
  onDelete,
}: {
  doc: Document;
  onPreview: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="group relative overflow-hidden">
      {isImage(doc.mimeType) ? (
        <button
          type="button"
          onClick={onPreview}
          className="block w-full aspect-square bg-sand-50"
        >
          <img
            src={doc.url}
            alt={doc.name}
            className="w-full h-full object-cover"
          />
        </button>
      ) : (
        <div className="aspect-square bg-sand-50 flex items-center justify-center">
          <FileText size={32} strokeWidth={1} className="text-sand-300" />
        </div>
      )}

      <CardContent className="p-2.5">
        <p className="text-xs font-medium text-sand-700 truncate" title={doc.name}>
          {doc.name}
        </p>
        <p className="text-[10px] text-sand-400 mt-0.5">
          {formatFileSize(doc.size)}
        </p>
      </CardContent>

      <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <a
          href={doc.url}
          download={doc.name}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-lg bg-white/90 shadow text-sand-600 hover:text-cian-600 transition-colors"
          title="Baixar"
        >
          <Download size={14} strokeWidth={1.5} />
        </a>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg bg-white/90 shadow text-sand-600 hover:text-red-500 transition-colors"
          title="Excluir"
        >
          <Trash2 size={14} strokeWidth={1.5} />
        </button>
      </div>
    </Card>
  );
}
