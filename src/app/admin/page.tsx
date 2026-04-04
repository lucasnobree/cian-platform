import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard, CalendarHeart, CreditCard, TrendingUp, Clock, Users } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-sand-800" style={{ fontFamily: "var(--font-display)" }}>
          Bem-vinda ao CIAN
        </h1>
        <p className="text-sand-500 text-sm mt-1">Visão geral dos seus casamentos e finanças</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-sand-500 uppercase tracking-wide">Casamentos Ativos</p>
                <p className="text-2xl font-bold text-sand-800 mt-1">12</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-cian-50 flex items-center justify-center">
                <LayoutDashboard size={20} className="text-cian-600" strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-sand-500 uppercase tracking-wide">Próximo Casamento</p>
                <p className="text-lg font-bold text-sand-800 mt-1">Carol & Éder</p>
                <p className="text-xs text-amber-600 font-medium">45 dias</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <CalendarHeart size={20} className="text-amber-500" strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-sand-500 uppercase tracking-wide">Pagamentos Pendentes</p>
                <p className="text-2xl font-bold text-sand-800 mt-1">3</p>
                <p className="text-xs text-sand-500">R$ 4.500,00</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <CreditCard size={20} className="text-amber-500" strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-sand-500 uppercase tracking-wide">Recebido este Mês</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">R$ 12.350</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <TrendingUp size={20} className="text-emerald-500" strokeWidth={1.5} />
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
            <div className="space-y-3">
              {[
                { couple: "Carol & Éder", task: "Aprovação final do convite", days: 12 },
                { couple: "Marina & Rafael", task: "Envio das artes p/ gráfica", days: 18 },
                { couple: "Júlia & Pedro", task: "Entrega do moodboard", days: 25 },
                { couple: "Ana & Lucas", task: "Revisão da identidade visual", days: 32 },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-sand-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-sand-700">{item.couple}</p>
                    <p className="text-xs text-sand-400">{item.task}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${item.days <= 15 ? "bg-amber-100 text-amber-700" : "bg-sand-100 text-sand-500"}`}>
                    D-{item.days}
                  </span>
                </div>
              ))}
            </div>
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
            <div className="space-y-3">
              {[
                { couple: "Fernanda & Thiago", stage: "in_production", date: "15/08/2026" },
                { couple: "Carol & Éder", stage: "contract_signed", date: "22/09/2026" },
                { couple: "Beatriz & Gustavo", stage: "proposal_sent", date: "10/11/2026" },
                { couple: "Camila & André", stage: "lead", date: "05/12/2026" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-sand-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-sand-700">{item.couple}</p>
                    <p className="text-xs text-sand-400">{item.date}</p>
                  </div>
                  <Badge stage={item.stage} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
