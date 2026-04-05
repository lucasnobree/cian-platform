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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number | null;
  mimeType: string | null;
  createdAt: string;
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
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "material");

      try {
        const res = await fetch(`/api/clients/${clientId}/documents`, {
          method: "POST",
          body: formData,
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || "Erro ao enviar arquivo");
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
        className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          dragOver
            ? "border-cian-400 bg-cian-50/30"
            : "border-sand-200 hover:border-sand-300"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
          onChange={(e) => handleUpload(e.target.files)}
          className="hidden"
        />
        <Upload
          size={32}
          strokeWidth={1.5}
          className="mx-auto mb-3 text-sand-400"
        />
        <p className="text-sm text-sand-600 mb-1">
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
        <p className="text-xs text-sand-400">
          JPG, PNG, WebP, GIF ou PDF — máx. 10MB por arquivo
        </p>
        {uploading && (
          <div className="mt-3 flex items-center justify-center gap-2 text-sm text-cian-600">
            <Loader2 size={16} className="animate-spin" />
            Enviando...
          </div>
        )}
      </div>

      {/* Files grid */}
      {documents.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12">
          <Image size={48} strokeWidth={1} className="text-sand-300 mb-4" />
          <p className="text-sm text-sand-500">Nenhum material adicionado</p>
          <p className="text-xs text-sand-400 mt-1">
            Envie identidades visuais, fotos de referência, contratos e mais
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {documents.map((doc) => (
            <Card key={doc.id} className="group relative overflow-hidden">
              {/* Preview / Thumbnail */}
              {isImage(doc.mimeType) ? (
                <button
                  type="button"
                  onClick={() => setPreviewUrl(doc.url)}
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

              {/* Info */}
              <CardContent className="p-2.5">
                <p
                  className="text-xs font-medium text-sand-700 truncate"
                  title={doc.name}
                >
                  {doc.name}
                </p>
                <p className="text-[10px] text-sand-400 mt-0.5">
                  {formatFileSize(doc.size)}
                </p>
              </CardContent>

              {/* Hover actions */}
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
                  onClick={() => handleDelete(doc.id, doc.name)}
                  className="p-1.5 rounded-lg bg-white/90 shadow text-sand-600 hover:text-red-500 transition-colors"
                  title="Excluir"
                >
                  <Trash2 size={14} strokeWidth={1.5} />
                </button>
              </div>
            </Card>
          ))}
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
