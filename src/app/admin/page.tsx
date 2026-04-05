"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LayoutDashboard,
  CalendarHeart,
  CreditCard,
  TrendingUp,
  Clock,
  Users,
  Plus,
  Globe,
} from "lucide-react";

interface DashboardData {
  activeWeddings: number;
  nextWedding: {
    id: string;
    brideFullName: string;
    groomFullName: string;
    weddingDate: string;
    daysUntil: number;
  } | null;
  pendingPayments: {
    count: number;
    total: number;
  };
  monthRevenue: number;
  recentClients: {
    id: string;
    brideFullName: string;
    groomFullName: string;
    pipelineStage: string;
    weddingDate: string;
  }[];
  upcomingDeadlines: {
    id: string;
    brideFullName: string;
    groomFullName: string;
    weddingDate: string;
    daysUntil: number;
  }[];
  pipelineCounts: Record<string, number>;
}

const pipelineStageLabels: Record<string, string> = {
  lead: "Lead",
  contacted: "Contatado",
  proposal_sent: "Proposta",
  contract_signed: "Contrato",
  in_production: "Produção",
  delivered: "Entregue",
  completed: "Concluído",
};

const pipelineStageColors: Record<string, string> = {
  lead: "bg-slate-400",
  contacted: "bg-sky-400",
  proposal_sent: "bg-amber-400",
  contract_signed: "bg-cian-500",
  in_production: "bg-violet-500",
  delivered: "bg-lime-500",
  completed: "bg-emerald-500",
};

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72 mt-2" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(4)].map((_, j) => (
                  <Skeleton key={j} className="h-12 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/dashboard/stats");
        if (!res.ok) throw new Error("Erro ao carregar dados");
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sand-500 text-sm mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
      </div>
    );
  }

  if (!data) return null;

  const totalPipeline = Object.values(data.pipelineCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-cian-600 font-medium mb-1">{getGreeting()} &#10045;</p>
          <h1
            className="text-2xl font-bold text-sand-800"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Bem-vinda ao CIAN
          </h1>
          <p className="text-sand-500 text-sm mt-1">
            Visão geral dos seus casamentos e finanças
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/clientes/novo">
            <Button size="sm" className="shadow-md hover:shadow-lg transition-shadow bg-linear-to-r from-cian-600 to-cian-700">
              <Plus size={16} strokeWidth={1.5} />
              Novo Cliente
            </Button>
          </Link>
          <Link href="/admin/sites/novo">
            <Button variant="secondary" size="sm" className="shadow-sm hover:shadow-md transition-shadow">
              <Globe size={16} strokeWidth={1.5} />
              Novo Site
            </Button>
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="stat-card-glass border-sand-100 hover:shadow-md transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-sand-500 uppercase tracking-wide">
                  Casamentos Ativos
                </p>
                <p className="text-2xl font-bold text-sand-800 mt-1">
                  {data.activeWeddings}
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-linear-to-br from-cian-400 to-cian-600 flex items-center justify-center shadow-sm">
                <LayoutDashboard size={20} className="text-white" strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card-glass border-sand-100 hover:shadow-md transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-sand-500 uppercase tracking-wide">
                  Próximo Casamento
                </p>
                {data.nextWedding ? (
                  <>
                    <p className="text-lg font-bold text-sand-800 mt-1">
                      {data.nextWedding.brideFullName.split(" ")[0]} &{" "}
                      {data.nextWedding.groomFullName.split(" ")[0]}
                    </p>
                    <p className="text-xs text-amber-600 font-medium">
                      {data.nextWedding.daysUntil} dias
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-sand-400 mt-1">Nenhum agendado</p>
                )}
              </div>
              <div className="w-11 h-11 rounded-xl bg-linear-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-sm">
                <CalendarHeart size={20} className="text-white" strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card-glass border-sand-100 hover:shadow-md transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-sand-500 uppercase tracking-wide">
                  Pagamentos Pendentes
                </p>
                <p className="text-2xl font-bold text-sand-800 mt-1">
                  {data.pendingPayments.count}
                </p>
                <p className="text-xs text-sand-500">
                  {formatCurrency(data.pendingPayments.total)}
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-linear-to-br from-amber-300 to-amber-500 flex items-center justify-center shadow-sm">
                <CreditCard size={20} className="text-white" strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card-glass border-sand-100 hover:shadow-md transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-sand-500 uppercase tracking-wide">
                  Recebido este Mês
                </p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {formatCurrency(data.monthRevenue)}
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm">
                <TrendingUp size={20} className="text-white" strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximos Prazos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock size={16} className="text-cian-600" strokeWidth={1.5} />
              Próximos Prazos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.upcomingDeadlines.length === 0 ? (
              <div className="text-sm text-sand-400 text-center py-8 empty-state-wave rounded-lg">
                Nenhum prazo próximo
              </div>
            ) : (
              <div className="space-y-1">
                {data.upcomingDeadlines.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2.5 px-3 rounded-lg row-hover-accent"
                  >
                    <div>
                      <p className="text-sm font-medium text-sand-700">
                        {item.brideFullName.split(" ")[0]} &{" "}
                        {item.groomFullName.split(" ")[0]}
                      </p>
                      <p className="text-xs text-sand-400">
                        {formatDate(item.weddingDate)}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        item.daysUntil <= 15
                          ? "bg-amber-100 text-amber-700"
                          : "bg-sand-100 text-sand-500"
                      }`}
                    >
                      D-{item.daysUntil}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Últimos Clientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users size={16} className="text-cian-600" strokeWidth={1.5} />
              Últimos Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentClients.length === 0 ? (
              <div className="text-sm text-sand-400 text-center py-8 empty-state-wave rounded-lg">
                Nenhum cliente cadastrado
              </div>
            ) : (
              <div className="space-y-1">
                {data.recentClients.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2.5 px-3 rounded-lg row-hover-accent"
                  >
                    <div>
                      <p className="text-sm font-medium text-sand-700">
                        {item.brideFullName.split(" ")[0]} &{" "}
                        {item.groomFullName.split(" ")[0]}
                      </p>
                      <p className="text-xs text-sand-400">
                        {formatDate(item.weddingDate)}
                      </p>
                    </div>
                    <Badge stage={item.pipelineStage} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Bar */}
      {totalPipeline > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <LayoutDashboard size={16} className="text-cian-600" strokeWidth={1.5} />
              Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-3.5 rounded-full overflow-hidden bg-sand-100 pipeline-shine">
              {Object.entries(pipelineStageLabels).map(([stage]) => {
                const count = data.pipelineCounts[stage] || 0;
                if (count === 0) return null;
                const pct = (count / totalPipeline) * 100;
                return (
                  <div
                    key={stage}
                    className={`${pipelineStageColors[stage] || "bg-sand-300"} transition-all`}
                    style={{ width: `${pct}%` }}
                    title={`${pipelineStageLabels[stage]}: ${count}`}
                  />
                );
              })}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
              {Object.entries(pipelineStageLabels).map(([stage, label]) => {
                const count = data.pipelineCounts[stage] || 0;
                if (count === 0) return null;
                return (
                  <div key={stage} className="flex items-center gap-1.5 text-xs text-sand-600">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        pipelineStageColors[stage] || "bg-sand-300"
                      }`}
                    />
                    {label}: {count}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
