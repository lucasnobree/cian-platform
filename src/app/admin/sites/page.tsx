"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Globe, Plus, ExternalLink, Pencil, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Client {
  id: string;
  brideFullName: string;
  groomFullName: string;
  weddingDate: string;
  websiteSlug: string | null;
  websiteStatus: string;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  const isPublished = status === "published";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        isPublished
          ? "bg-emerald-100 text-emerald-700"
          : "bg-sand-200 text-sand-600"
      )}
    >
      {isPublished ? "Publicado" : "Rascunho"}
    </span>
  );
}

function SitesListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-5">
            <Skeleton className="h-5 w-40 mb-2" />
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-6 w-20 mb-4" />
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function SitesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchClients() {
      try {
        const res = await fetch("/api/clients?limit=100");
        if (!res.ok) throw new Error("Erro ao carregar clientes");
        const json = await res.json();
        setClients(json.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    }
    fetchClients();
  }, []);

  const filteredClients = clients.filter((c) => {
    if (!search) return true;
    const term = search.toLowerCase();
    const name = `${c.brideFullName} ${c.groomFullName}`.toLowerCase();
    return name.includes(term) || (c.websiteSlug || "").toLowerCase().includes(term);
  });

  const withSite = filteredClients.filter((c) => c.websiteSlug);
  const withoutSite = filteredClients.filter((c) => !c.websiteSlug);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>
        <SitesListSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sand-500 text-sm mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold text-sand-800"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Sites de Casamento
          </h1>
          <p className="text-sand-500 text-sm mt-1">
            Gerencie os sites dos seus clientes
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-sand-400"
          strokeWidth={1.5}
        />
        <Input
          placeholder="Buscar por nome ou slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Sites with website */}
      {withSite.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-sand-600 uppercase tracking-wide mb-3">
            Sites Configurados ({withSite.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {withSite.map((client) => (
              <Card key={client.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Globe size={16} className="text-cian-600" strokeWidth={1.5} />
                      <h3 className="font-semibold text-sand-800 text-sm">
                        {client.brideFullName.split(" ")[0]} &{" "}
                        {client.groomFullName.split(" ")[0]}
                      </h3>
                    </div>
                    <StatusBadge status={client.websiteStatus} />
                  </div>

                  <p className="text-xs text-sand-400 mb-1">
                    {formatDate(client.weddingDate)}
                  </p>
                  <p className="text-xs text-cian-600 font-mono mb-4">
                    /{client.websiteSlug}
                  </p>

                  <div className="flex gap-2">
                    <Link href={`/admin/sites/${client.id}`} className="flex-1">
                      <Button variant="secondary" size="sm" className="w-full">
                        <Pencil size={14} strokeWidth={1.5} />
                        Editar Site
                      </Button>
                    </Link>
                    {client.websiteStatus === "published" && client.websiteSlug && (
                      <a
                        href={`/${client.websiteSlug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="ghost" size="sm">
                          <ExternalLink size={14} strokeWidth={1.5} />
                        </Button>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Clients without website */}
      {withoutSite.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-sand-600 uppercase tracking-wide mb-3">
            Sem Site ({withoutSite.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {withoutSite.map((client) => (
              <Card key={client.id} className="border-dashed hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe size={16} className="text-sand-300" strokeWidth={1.5} />
                    <h3 className="font-semibold text-sand-800 text-sm">
                      {client.brideFullName.split(" ")[0]} &{" "}
                      {client.groomFullName.split(" ")[0]}
                    </h3>
                  </div>
                  <p className="text-xs text-sand-400 mb-4">
                    {formatDate(client.weddingDate)}
                  </p>
                  <Link href={`/admin/sites/${client.id}`}>
                    <Button size="sm" className="w-full">
                      <Plus size={14} strokeWidth={1.5} />
                      Criar Site
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {filteredClients.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Globe size={48} className="text-sand-300 mb-4" strokeWidth={1} />
          <h3
            className="text-lg font-semibold text-sand-700 mb-1"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {search ? "Nenhum resultado" : "Nenhum cliente cadastrado"}
          </h3>
          <p className="text-sand-400 text-sm mb-6">
            {search
              ? "Tente outro termo de busca."
              : "Cadastre um cliente para criar o site de casamento."}
          </p>
          {!search && (
            <Link href="/admin/clientes/novo">
              <Button>
                <Plus size={16} strokeWidth={1.5} />
                Novo Cliente
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
