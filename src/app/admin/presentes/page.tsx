"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Gift,
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  Search,
  Download,
  Filter,
  AlertTriangle,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Mock data — purely illustrative
// ---------------------------------------------------------------------------

const MOCK_SUMMARY = {
  totalRaised: "R$ 8.450,00",
  giftsReceived: 23,
  feesGenerated: "R$ 295,75",
  pending: 5,
};

type GiftStatus = "paid" | "pending" | "expired";

interface MockGift {
  id: number;
  guest: string;
  item: string;
  value: string;
  status: GiftStatus;
  date: string;
}

const MOCK_GIFTS: MockGift[] = [
  { id: 1, guest: "Maria Silva", item: "Lua de Mel em Santorini", value: "R$ 2.000,00", status: "paid", date: "28/03/2026" },
  { id: 2, guest: "João Santos", item: "Jogo de Cama King", value: "R$ 450,00", status: "paid", date: "25/03/2026" },
  { id: 3, guest: "Ana Oliveira", item: "Jantar Romântico", value: "R$ 350,00", status: "pending", date: "22/03/2026" },
  { id: 4, guest: "Pedro Costa", item: "Kit Cozinha Gourmet", value: "R$ 780,00", status: "paid", date: "20/03/2026" },
  { id: 5, guest: "Fernanda Lima", item: "Experiência Spa", value: "R$ 520,00", status: "expired", date: "18/03/2026" },
  { id: 6, guest: "Ricardo Souza", item: "Contribuição Livre", value: "R$ 150,00", status: "pending", date: "15/03/2026" },
];

const statusConfig: Record<GiftStatus, { label: string; classes: string }> = {
  paid: { label: "Pago", classes: "bg-emerald-100 text-emerald-700" },
  pending: { label: "Pendente", classes: "bg-amber-100 text-amber-700" },
  expired: { label: "Expirado", classes: "bg-red-100 text-red-700" },
};

// ---------------------------------------------------------------------------
// Toast-like "coming soon" notice
// ---------------------------------------------------------------------------

function useComingSoon() {
  const [visible, setVisible] = useState(false);

  function show() {
    setVisible(true);
    setTimeout(() => setVisible(false), 2000);
  }

  const Toast = visible ? (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-sand-800 px-4 py-3 text-sm text-white shadow-lg animate-fade-in">
      <Clock size={16} strokeWidth={1.5} />
      Em breve
    </div>
  ) : null;

  return { show, Toast };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PresentesPage() {
  const { show: showToast, Toast } = useComingSoon();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold text-sand-800"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Lista de Presentes
          </h1>
          <p className="text-sand-500 text-sm mt-1">
            Gerencie presentes e pagamentos PIX dos seus casamentos
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" disabled onClick={showToast}>
            <Download size={16} strokeWidth={1.5} />
            Exportar
          </Button>
          <Button size="sm" disabled onClick={showToast}>
            <Gift size={16} strokeWidth={1.5} />
            Novo Presente
          </Button>
        </div>
      </div>

      {/* Development banner */}
      <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <AlertTriangle size={20} className="mt-0.5 shrink-0 text-amber-600" strokeWidth={1.5} />
        <div>
          <p className="text-sm font-semibold text-amber-800">
            Módulo em desenvolvimento
          </p>
          <p className="text-sm text-amber-700 mt-0.5">
            Os dados abaixo são ilustrativos. A integração com pagamento PIX será ativada em breve.
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-sand-500 uppercase tracking-wide">
                  Total Arrecadado
                </p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {MOCK_SUMMARY.totalRaised}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <DollarSign size={20} className="text-emerald-500" strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-sand-500 uppercase tracking-wide">
                  Presentes Recebidos
                </p>
                <p className="text-2xl font-bold text-sand-800 mt-1">
                  {MOCK_SUMMARY.giftsReceived}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-cian-50 flex items-center justify-center">
                <Gift size={20} className="text-cian-600" strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-sand-500 uppercase tracking-wide">
                  Taxa Gerada
                </p>
                <p className="text-2xl font-bold text-sand-800 mt-1">
                  {MOCK_SUMMARY.feesGenerated}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center">
                <TrendingUp size={20} className="text-violet-500" strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-sand-500 uppercase tracking-wide">
                  Pendentes
                </p>
                <p className="text-2xl font-bold text-amber-600 mt-1">
                  {MOCK_SUMMARY.pending}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <Clock size={20} className="text-amber-500" strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gifts table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users size={16} className="text-cian-600" strokeWidth={1.5} />
              Presentes Recebidos
            </CardTitle>
            <div className="flex gap-2">
              <button
                onClick={showToast}
                className="inline-flex items-center gap-1.5 rounded-lg border border-sand-300 bg-white px-3 py-1.5 text-xs text-sand-500 cursor-not-allowed opacity-60"
              >
                <Search size={14} strokeWidth={1.5} />
                Buscar...
              </button>
              <button
                onClick={showToast}
                className="inline-flex items-center gap-1.5 rounded-lg border border-sand-300 bg-white px-3 py-1.5 text-xs text-sand-500 cursor-not-allowed opacity-60"
              >
                <Filter size={14} strokeWidth={1.5} />
                Filtros
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-sand-200">
                  <th className="text-left py-3 px-2 text-xs font-medium text-sand-500 uppercase tracking-wide">
                    Convidado
                  </th>
                  <th className="text-left py-3 px-2 text-xs font-medium text-sand-500 uppercase tracking-wide">
                    Item
                  </th>
                  <th className="text-left py-3 px-2 text-xs font-medium text-sand-500 uppercase tracking-wide">
                    Valor
                  </th>
                  <th className="text-left py-3 px-2 text-xs font-medium text-sand-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-left py-3 px-2 text-xs font-medium text-sand-500 uppercase tracking-wide">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody>
                {MOCK_GIFTS.map((gift) => {
                  const { label, classes } = statusConfig[gift.status];
                  return (
                    <tr
                      key={gift.id}
                      className="border-b border-sand-100 last:border-0 hover:bg-sand-50/50 transition-colors"
                    >
                      <td className="py-3 px-2 font-medium text-sand-700">
                        {gift.guest}
                      </td>
                      <td className="py-3 px-2 text-sand-600">{gift.item}</td>
                      <td className="py-3 px-2 text-sand-700 font-medium">
                        {gift.value}
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${classes}`}
                        >
                          {label}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-sand-500">{gift.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mock pagination */}
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-sand-100">
            <p className="text-xs text-sand-400">
              Mostrando 6 de 23 registros
            </p>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  onClick={showToast}
                  className={`h-8 w-8 rounded-md text-xs font-medium transition-colors ${
                    n === 1
                      ? "bg-cian-600 text-white"
                      : "text-sand-500 hover:bg-sand-100 cursor-not-allowed opacity-60"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {Toast}
    </div>
  );
}
