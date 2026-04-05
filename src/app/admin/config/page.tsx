"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Loader2, CheckCircle, XCircle, Database, LayoutGrid, Info } from "lucide-react";

interface HealthStatus {
  trello: boolean;
  database: boolean;
  version: string;
}

function StatusBadge({ connected }: { connected: boolean }) {
  return connected ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
      <CheckCircle size={12} />
      Conectado
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
      <XCircle size={12} />
      Não configurado
    </span>
  );
}

export default function ConfigPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchHealth() {
      try {
        const res = await fetch("/api/config/health");
        if (!res.ok) throw new Error("Falha ao verificar status");
        const data = await res.json();
        setHealth(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar status");
      } finally {
        setLoading(false);
      }
    }
    fetchHealth();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={32} className="animate-spin text-cian-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <p className="text-sand-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1
          className="text-2xl font-semibold text-sand-800"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Configurações
        </h1>
        <p className="text-sm text-sand-500 mt-1">
          Status das integrações e informações do sistema
        </p>
      </div>

      {/* Integrações */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-sand-700">
            Integrações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Trello */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-lg bg-sand-50 border border-sand-100">
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-0.5">
                <LayoutGrid size={20} className="text-sand-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-sand-800">Trello</p>
                <p className="text-xs text-sand-500 mt-1">
                  Gerenciamento de projetos para acompanhar o progresso de cada casamento.
                </p>
                {!health?.trello && (
                  <div className="mt-2 flex items-start gap-2 text-xs text-sand-500">
                    <Info size={12} className="mt-0.5 shrink-0" />
                    <span>
                      Configure as variáveis <code className="bg-sand-100 px-1 rounded text-sand-700">TRELLO_API_KEY</code> e{" "}
                      <code className="bg-sand-100 px-1 rounded text-sand-700">TRELLO_TOKEN</code> no painel da Vercel.
                    </span>
                  </div>
                )}
                <a
                  href="https://trello.com/power-ups/admin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-cian-600 hover:text-cian-700 mt-2"
                >
                  Obter chave de API do Trello
                  <ExternalLink size={10} />
                </a>
              </div>
            </div>
            <StatusBadge connected={health?.trello ?? false} />
          </div>
        </CardContent>
      </Card>

      {/* Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-sand-700">
            Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Database */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-sand-50 border border-sand-100">
            <div className="flex items-center gap-3">
              <Database size={20} className="text-sand-500" />
              <div>
                <p className="text-sm font-medium text-sand-800">Banco de Dados</p>
                <p className="text-xs text-sand-500 mt-0.5">PostgreSQL (Supabase)</p>
              </div>
            </div>
            <StatusBadge connected={health?.database ?? false} />
          </div>

          {/* Version */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-sand-50 border border-sand-100">
            <div className="flex items-center gap-3">
              <Info size={20} className="text-sand-500" />
              <div>
                <p className="text-sm font-medium text-sand-800">Versão</p>
                <p className="text-xs text-sand-500 mt-0.5">CIAN Platform</p>
              </div>
            </div>
            <span className="text-sm font-mono text-sand-600">
              v{health?.version ?? "—"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
