"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Trash2,
  Calendar,
  MapPin,
  Mail,
  Phone,
  AtSign,
  CreditCard,
  Hash,
  Users,
  Church,
  PartyPopper,
  Briefcase,
  Tag,
  MessageSquare,
  DollarSign,
  Globe,
  Loader2,
  ExternalLink,
  Pencil,
  Upload,
  Download,
  Image,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { MaterialsTab } from "@/components/admin/materials-tab";
import { StepsTab } from "@/components/admin/steps-tab";

interface Client {
  id: string;
  brideFullName: string;
  groomFullName: string;
  brideEmail: string;
  bridePhone: string;
  brideCpf: string | null;
  brideInstagram: string | null;
  groomEmail: string | null;
  groomPhone: string | null;
  groomCpf: string | null;
  groomInstagram: string | null;
  weddingDate: string;
  ceremonyVenue: string | null;
  receptionVenue: string | null;
  city: string | null;
  state: string | null;
  estimatedGuests: number | null;
  ceremonyType: string | null;
  coupleHashtag: string | null;
  pipelineStage: string;
  servicePackage: string | null;
  contractValue: number | null;
  leadSource: string | null;
  referredBy: string | null;
  websiteSlug: string | null;
  trelloBoardId: string | null;
  trelloBoardUrl: string | null;
  tags: string[];
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    documents: number;
    interactions: number;
    gifts: number;
    giftItems: number;
    projectSteps: number;
  };
  websiteConfig?: { id: string } | null;
}

const PIPELINE_STAGES = [
  { value: "lead", label: "Lead" },
  { value: "contacted", label: "Contatado" },
  { value: "proposal_sent", label: "Proposta Enviada" },
  { value: "contract_signed", label: "Contrato Assinado" },
  { value: "in_production", label: "Em Produção" },
  { value: "delivered", label: "Entregue" },
  { value: "completed", label: "Concluído" },
];

const CEREMONY_LABELS: Record<string, string> = {
  civil: "Civil",
  religiosa: "Religiosa",
  ambas: "Civil e Religiosa",
};

const LEAD_SOURCE_LABELS: Record<string, string> = {
  instagram: "Instagram",
  indicacao: "Indicação",
  google: "Google",
  feira: "Feira",
  outro: "Outro",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon size={16} strokeWidth={1.5} className="text-sand-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-sand-400">{label}</p>
        <p className="text-sm text-sand-700">{value}</p>
      </div>
    </div>
  );
}

export default function ClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [stageUpdating, setStageUpdating] = useState(false);
  const [trelloCreating, setTrelloCreating] = useState(false);
  const [activeTab, setActiveTab] = useState("info");

  const fetchClient = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/clients/${id}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error("Cliente não encontrado");
        throw new Error("Erro ao carregar cliente");
      }
      const data = await res.json();
      setClient(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar cliente");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  const handleStageChange = async (stage: string) => {
    if (!client || client.pipelineStage === stage || stageUpdating) return;
    setStageUpdating(true);
    const prevStage = client.pipelineStage;
    setClient((prev) => prev ? { ...prev, pipelineStage: stage } : prev);

    try {
      const res = await fetch(`/api/clients/${id}/stage`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setClient((prev) => prev ? { ...prev, pipelineStage: prevStage } : prev);
    } finally {
      setStageUpdating(false);
    }
  };

  const handleCreateTrelloBoard = async () => {
    if (!client || trelloCreating) return;
    setTrelloCreating(true);
    try {
      // Trigger board creation by re-sending the current stage
      const res = await fetch(`/api/clients/${id}/stage`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: "contract_signed" }),
      });
      if (!res.ok) throw new Error();
      // Refetch client to get the new trello data
      await fetchClient();
    } catch {
      alert("Erro ao criar board no Trello.");
    } finally {
      setTrelloCreating(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      router.push("/admin/clientes");
    } catch {
      alert("Erro ao excluir cliente.");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cian-600 border-t-transparent" />
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <p className="text-sand-500 mb-4">{error || "Cliente não encontrado"}</p>
        <Link href="/admin/clientes">
          <Button variant="secondary">
            <ArrowLeft size={18} strokeWidth={1.5} />
            Voltar para clientes
          </Button>
        </Link>
      </div>
    );
  }

  const tabs = [
    { key: "info", label: "Informações" },
    { key: "steps", label: `Etapas${client._count?.projectSteps ? ` (${client._count.projectSteps})` : ""}` },
    { key: "docs", label: `Materiais${client._count?.documents ? ` (${client._count.documents})` : ""}` },
    { key: "interactions", label: `Interações${client._count?.interactions ? ` (${client._count.interactions})` : ""}` },
    { key: "payments", label: "Pagamentos" },
    { key: "site", label: "Site" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/clientes">
            <Button variant="ghost" size="sm">
              <ArrowLeft size={18} strokeWidth={1.5} />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1
                className="text-2xl font-semibold text-sand-800"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {client.brideFullName} & {client.groomFullName}
              </h1>
              <Badge stage={client.pipelineStage} />
            </div>
            <p className="text-sm text-sand-500 mt-1">
              Cadastrado em {formatDate(client.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {client.trelloBoardUrl && (
            <a
              href={client.trelloBoardUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="secondary" size="sm">
                <ExternalLink size={16} strokeWidth={1.5} />
                <span className="hidden sm:inline">Abrir no Trello</span>
              </Button>
            </a>
          )}
          {!client.trelloBoardUrl &&
            ["contract_signed", "in_production", "delivered", "completed"].includes(client.pipelineStage) && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCreateTrelloBoard}
                disabled={trelloCreating}
              >
                {trelloCreating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <ExternalLink size={16} strokeWidth={1.5} />
                )}
                <span className="hidden sm:inline">
                  {trelloCreating ? "Criando..." : "Criar Board no Trello"}
                </span>
              </Button>
            )}
          <Link href={`/admin/clientes/${id}/editar`}>
            <Button variant="secondary" size="sm">
              <Pencil size={16} strokeWidth={1.5} />
              <span className="hidden sm:inline">Editar</span>
            </Button>
          </Link>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 size={16} strokeWidth={1.5} />
            <span className="hidden sm:inline">Excluir</span>
          </Button>
        </div>
      </div>

      {/* Pipeline Stage Changer */}
      <Card>
        <CardContent className="p-4">
          <p className="text-xs font-medium text-sand-500 mb-3">Pipeline</p>
          <div className="flex flex-wrap gap-1.5">
            {PIPELINE_STAGES.map((stage, index) => {
              const currentIdx = PIPELINE_STAGES.findIndex(
                (s) => s.value === client.pipelineStage
              );
              const isActive = stage.value === client.pipelineStage;
              const isPast = index < currentIdx;
              return (
                <button
                  key={stage.value}
                  onClick={() => handleStageChange(stage.value)}
                  disabled={stageUpdating}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    isActive
                      ? "bg-cian-600 text-white shadow-sm"
                      : isPast
                      ? "bg-cian-100 text-cian-700"
                      : "bg-sand-100 text-sand-500 hover:bg-sand-200"
                  )}
                >
                  {stage.label}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="border-b border-sand-200">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px",
                activeTab === tab.key
                  ? "border-cian-600 text-cian-700"
                  : "border-transparent text-sand-500 hover:text-sand-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content: Info */}
      {activeTab === "info" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Bride */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-sand-600">
                Noiva
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium text-sand-800 mb-2">
                {client.brideFullName}
              </p>
              <div className="space-y-0.5">
                <InfoRow icon={Mail} label="E-mail" value={client.brideEmail} />
                <InfoRow icon={Phone} label="Telefone" value={client.bridePhone} />
                <InfoRow icon={CreditCard} label="CPF" value={client.brideCpf} />
                <InfoRow
                  icon={AtSign}
                  label="Instagram"
                  value={client.brideInstagram}
                />
              </div>
            </CardContent>
          </Card>

          {/* Groom */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-sand-600">
                Noivo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium text-sand-800 mb-2">
                {client.groomFullName}
              </p>
              <div className="space-y-0.5">
                <InfoRow icon={Mail} label="E-mail" value={client.groomEmail} />
                <InfoRow icon={Phone} label="Telefone" value={client.groomPhone} />
                <InfoRow icon={CreditCard} label="CPF" value={client.groomCpf} />
                <InfoRow
                  icon={AtSign}
                  label="Instagram"
                  value={client.groomInstagram}
                />
              </div>
            </CardContent>
          </Card>

          {/* Wedding */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-sand-600">
                Casamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-0.5">
                <InfoRow
                  icon={Calendar}
                  label="Data"
                  value={formatDate(client.weddingDate)}
                />
                <InfoRow
                  icon={Church}
                  label="Cerimônia"
                  value={
                    client.ceremonyType
                      ? CEREMONY_LABELS[client.ceremonyType] || client.ceremonyType
                      : null
                  }
                />
                <InfoRow
                  icon={Church}
                  label="Local da cerimônia"
                  value={client.ceremonyVenue}
                />
                <InfoRow
                  icon={PartyPopper}
                  label="Local da recepção"
                  value={client.receptionVenue}
                />
                <InfoRow
                  icon={MapPin}
                  label="Cidade"
                  value={
                    [client.city, client.state].filter(Boolean).join(", ") ||
                    null
                  }
                />
                <InfoRow
                  icon={Users}
                  label="Convidados estimados"
                  value={
                    client.estimatedGuests
                      ? String(client.estimatedGuests)
                      : null
                  }
                />
                <InfoRow
                  icon={Hash}
                  label="Hashtag"
                  value={client.coupleHashtag}
                />
              </div>
            </CardContent>
          </Card>

          {/* Commercial */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-sand-600">
                Comercial
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-0.5">
                <InfoRow
                  icon={Briefcase}
                  label="Pacote"
                  value={client.servicePackage}
                />
                <InfoRow
                  icon={DollarSign}
                  label="Valor do contrato"
                  value={
                    client.contractValue !== null
                      ? formatCurrency(client.contractValue)
                      : null
                  }
                />
                <InfoRow
                  icon={ExternalLink}
                  label="Origem do lead"
                  value={
                    client.leadSource
                      ? LEAD_SOURCE_LABELS[client.leadSource] ||
                        client.leadSource
                      : null
                  }
                />
                <InfoRow
                  icon={Users}
                  label="Indicado por"
                  value={client.referredBy}
                />
                <InfoRow
                  icon={Globe}
                  label="Slug do site"
                  value={client.websiteSlug}
                />
                {client.tags && client.tags.length > 0 && (
                  <div className="flex items-start gap-3 py-2">
                    <Tag
                      size={16}
                      strokeWidth={1.5}
                      className="text-sand-400 mt-0.5 shrink-0"
                    />
                    <div>
                      <p className="text-xs text-sand-400">Tags</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {client.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center rounded-full bg-sand-100 px-2 py-0.5 text-xs text-sand-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {client.notes && (
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-sand-600">
                  Observações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-sand-700 whitespace-pre-wrap">
                  {client.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Tab Content: Etapas */}
      {activeTab === "steps" && (
        <StepsTab clientId={id} />
      )}

      {/* Tab Content: Materiais */}
      {activeTab === "docs" && (
        <MaterialsTab clientId={id} onUpdate={fetchClient} />
      )}
      {activeTab === "interactions" && (
        <Card className="flex flex-col items-center justify-center py-16">
          <MessageSquare
            size={48}
            strokeWidth={1}
            className="text-sand-300 mb-4"
          />
          <p className="text-sm text-sand-500">
            Histórico de interações em breve
          </p>
        </Card>
      )}
      {activeTab === "payments" && (
        <Card className="flex flex-col items-center justify-center py-16">
          <DollarSign
            size={48}
            strokeWidth={1}
            className="text-sand-300 mb-4"
          />
          <p className="text-sm text-sand-500">
            Controle de pagamentos em breve
          </p>
        </Card>
      )}
      {activeTab === "site" && (
        <Card className="flex flex-col items-center justify-center py-16">
          <Globe size={48} strokeWidth={1} className="text-sand-300 mb-4" />
          <p className="text-sm text-sand-500">
            Configuração do site em breve
          </p>
          {client.websiteSlug && (
            <p className="text-xs text-sand-400 mt-2">
              Slug reservado: /{client.websiteSlug}
            </p>
          )}
        </Card>
      )}

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Excluir cliente</DialogTitle>
        <DialogDescription>
          Tem certeza que deseja excluir{" "}
          <strong>
            {client.brideFullName} & {client.groomFullName}
          </strong>
          ? Esta ação não pode ser desfeita.
        </DialogDescription>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => setDeleteOpen(false)}
            disabled={deleting}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting && <Loader2 size={16} className="animate-spin" />}
            {deleting ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
