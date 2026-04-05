"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  List,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  Users,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Client {
  id: string;
  brideFullName: string;
  groomFullName: string;
  weddingDate: string;
  city: string | null;
  state: string | null;
  pipelineStage: string;
  brideEmail: string;
  bridePhone: string;
  createdAt: string;
}

interface ApiResponse {
  data: Client[];
  total: number;
  page: number;
  limit: number;
}

const STAGES = [
  { value: "", label: "Todos" },
  { value: "lead", label: "Lead" },
  { value: "contacted", label: "Contatado" },
  { value: "proposal_sent", label: "Proposta Enviada" },
  { value: "contract_signed", label: "Contrato Assinado" },
  { value: "in_production", label: "Em Produção" },
  { value: "delivered", label: "Entregue" },
  { value: "completed", label: "Concluído" },
];

const PIPELINE_STAGES = STAGES.filter((s) => s.value !== "");

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function ClientesPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [view, setView] = useState<"list" | "kanban">("list");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, stageFilter]);

  // Fetch clients
  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (stageFilter) params.set("stage", stageFilter);
      if (view === "kanban") {
        params.set("limit", "200");
      } else {
        params.set("page", String(page));
        params.set("limit", String(limit));
      }
      const res = await fetch(`/api/clients?${params}`);
      if (!res.ok) throw new Error("Erro ao carregar clientes");
      const json: ApiResponse = await res.json();
      setClients(json.data);
      setTotal(json.total);
    } catch {
      setError("Erro ao carregar clientes. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, stageFilter, page, limit, view]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const totalPages = Math.ceil(total / limit);

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este cliente?")) return;
    try {
      const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      fetchClients();
    } catch {
      alert("Erro ao excluir cliente.");
    }
    setOpenMenu(null);
  };

  // Kanban drag and drop
  const handleDragStart = (e: React.DragEvent, clientId: string) => {
    e.dataTransfer.setData("clientId", clientId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = async (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    const clientId = e.dataTransfer.getData("clientId");
    if (!clientId) return;

    const client = clients.find((c) => c.id === clientId);
    if (!client || client.pipelineStage === stage) return;

    // Optimistic update
    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, pipelineStage: stage } : c))
    );

    try {
      const res = await fetch(`/api/clients/${clientId}/stage`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage }),
      });
      if (!res.ok) throw new Error();
    } catch {
      fetchClients(); // Revert on error
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-semibold text-sand-800"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Clientes
          </h1>
          <p className="text-sm text-sand-500 mt-1">
            {total} {total === 1 ? "cliente" : "clientes"} cadastrados
          </p>
        </div>
        <Link href="/admin/clientes/novo">
          <Button>
            <Plus size={18} strokeWidth={1.5} />
            Novo Cliente
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search
            size={18}
            strokeWidth={1.5}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-sand-400"
          />
          <Input
            placeholder="Buscar por nome, e-mail ou hashtag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={view === "list" ? "default" : "secondary"}
            size="sm"
            onClick={() => setView("list")}
            title="Visualizar em lista"
          >
            <List size={16} strokeWidth={1.5} />
          </Button>
          <Button
            variant={view === "kanban" ? "default" : "secondary"}
            size="sm"
            onClick={() => setView("kanban")}
            title="Visualizar em kanban"
          >
            <LayoutGrid size={16} strokeWidth={1.5} />
          </Button>
        </div>
      </div>

      {/* Stage Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {STAGES.map((stage) => (
          <button
            key={stage.value}
            onClick={() => setStageFilter(stage.value)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
              stageFilter === stage.value
                ? "bg-cian-600 text-white"
                : "bg-sand-100 text-sand-600 hover:bg-sand-200"
            )}
          >
            {stage.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cian-600 border-t-transparent" />
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && clients.length === 0 && (
        <Card className="flex flex-col items-center justify-center py-16 px-6">
          <Users size={48} strokeWidth={1} className="text-sand-300 mb-4" />
          <h3
            className="text-lg font-semibold text-sand-700"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Nenhum cliente encontrado
          </h3>
          <p className="text-sm text-sand-500 mt-1 text-center max-w-sm">
            {debouncedSearch || stageFilter
              ? "Tente ajustar os filtros de busca."
              : "Comece cadastrando seu primeiro casal."}
          </p>
          {!debouncedSearch && !stageFilter && (
            <Link href="/admin/clientes/novo" className="mt-4">
              <Button>
                <Plus size={18} strokeWidth={1.5} />
                Novo Cliente
              </Button>
            </Link>
          )}
        </Card>
      )}

      {/* List View */}
      {!loading && !error && clients.length > 0 && view === "list" && (
        <>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-sand-200 bg-sand-50/50">
                    <th className="text-left font-medium text-sand-500 px-4 py-3">
                      Casal
                    </th>
                    <th className="text-left font-medium text-sand-500 px-4 py-3 hidden md:table-cell">
                      Data do Casamento
                    </th>
                    <th className="text-left font-medium text-sand-500 px-4 py-3">
                      Etapa
                    </th>
                    <th className="text-left font-medium text-sand-500 px-4 py-3 hidden lg:table-cell">
                      Cidade
                    </th>
                    <th className="text-right font-medium text-sand-500 px-4 py-3">
                      Acoes
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-100">
                  {clients.map((client) => (
                    <tr
                      key={client.id}
                      className="hover:bg-sand-50/50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/admin/clientes/${client.id}`)}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-sand-800">
                          {client.brideFullName} & {client.groomFullName}
                        </div>
                        <div className="text-xs text-sand-400 mt-0.5">
                          {client.brideEmail}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-sand-600">
                        {formatDate(client.weddingDate)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge stage={client.pipelineStage} />
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-sand-600">
                        {[client.city, client.state].filter(Boolean).join(", ") || "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="relative inline-block" ref={openMenu === client.id ? menuRef : null}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenu(openMenu === client.id ? null : client.id);
                            }}
                            className="p-1.5 rounded-lg text-sand-400 hover:bg-sand-100 hover:text-sand-600 transition-colors"
                          >
                            <MoreHorizontal size={16} strokeWidth={1.5} />
                          </button>
                          {openMenu === client.id && (
                            <div className="absolute right-0 mt-1 w-40 rounded-lg border border-sand-200 bg-white shadow-lg py-1 z-10">
                              <Link
                                href={`/admin/clientes/${client.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-sand-700 hover:bg-sand-50"
                              >
                                <Eye size={14} strokeWidth={1.5} />
                                Ver detalhes
                              </Link>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(client.id);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 size={14} strokeWidth={1.5} />
                                Excluir
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-sand-500">
                Mostrando {(page - 1) * limit + 1} a{" "}
                {Math.min(page * limit, total)} de {total}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft size={16} strokeWidth={1.5} />
                  Anterior
                </Button>
                <span className="text-sm text-sand-600 px-2">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Proximo
                  <ChevronRight size={16} strokeWidth={1.5} />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Kanban View */}
      {!loading && !error && clients.length > 0 && view === "kanban" && (
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6">
          {PIPELINE_STAGES.map((stage) => {
            const stageClients = clients.filter(
              (c) => c.pipelineStage === stage.value
            );
            return (
              <div
                key={stage.value}
                className="flex-shrink-0 w-72"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.value)}
              >
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <Badge stage={stage.value} />
                    <span className="text-xs text-sand-400">
                      {stageClients.length}
                    </span>
                  </div>
                </div>
                <div className="space-y-2 min-h-[200px] rounded-lg bg-sand-100/50 p-2">
                  {stageClients.map((client) => (
                    <div
                      key={client.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, client.id)}
                      className="rounded-lg border border-sand-200 bg-white p-3 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                    >
                      <Link href={`/admin/clientes/${client.id}`} className="block">
                        <div className="flex items-start gap-2">
                          <GripVertical
                            size={14}
                            strokeWidth={1.5}
                            className="text-sand-300 mt-0.5 flex-shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm text-sand-800 truncate">
                              {client.brideFullName} & {client.groomFullName}
                            </p>
                            <div className="flex items-center gap-1 mt-1.5 text-xs text-sand-500">
                              <Calendar size={12} strokeWidth={1.5} />
                              {formatDate(client.weddingDate)}
                            </div>
                            {(client.city || client.state) && (
                              <div className="flex items-center gap-1 mt-1 text-xs text-sand-400">
                                <MapPin size={12} strokeWidth={1.5} />
                                {[client.city, client.state]
                                  .filter(Boolean)
                                  .join(", ")}
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                  {stageClients.length === 0 && (
                    <div className="flex items-center justify-center h-24 text-xs text-sand-400">
                      Arraste clientes aqui
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
