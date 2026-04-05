"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Heart,
  User,
  CalendarDays,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FormErrors {
  [key: string]: string;
}

const CEREMONY_TYPES = [
  { value: "", label: "Selecione..." },
  { value: "civil", label: "Civil" },
  { value: "religiosa", label: "Religiosa" },
  { value: "ambas", label: "Civil e Religiosa" },
];

const LEAD_SOURCES = [
  { value: "", label: "Selecione..." },
  { value: "instagram", label: "Instagram" },
  { value: "indicacao", label: "Indicação" },
  { value: "google", label: "Google" },
  { value: "feira", label: "Feira" },
  { value: "outro", label: "Outro" },
];

const PIPELINE_STAGES = [
  { value: "lead", label: "Lead" },
  { value: "contacted", label: "Contatado" },
  { value: "proposal_sent", label: "Proposta Enviada" },
  { value: "contract_signed", label: "Contrato Assinado" },
  { value: "in_production", label: "Em Produção" },
  { value: "delivered", label: "Entregue" },
  { value: "completed", label: "Concluído" },
];

const BRAZILIAN_STATES = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA",
  "PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ title, icon, children, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-6 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cian-50 text-cian-600">
            {icon}
          </div>
          <h2
            className="text-base font-semibold text-sand-800"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {title}
          </h2>
        </div>
        {open ? (
          <ChevronUp size={18} strokeWidth={1.5} className="text-sand-400" />
        ) : (
          <ChevronDown size={18} strokeWidth={1.5} className="text-sand-400" />
        )}
      </button>
      {open && <CardContent className="pt-0 pb-6">{children}</CardContent>}
    </Card>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-sand-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const [form, setForm] = useState({
    brideFullName: "",
    brideEmail: "",
    bridePhone: "",
    brideCpf: "",
    brideInstagram: "",
    groomFullName: "",
    groomPhone: "",
    groomEmail: "",
    groomCpf: "",
    groomInstagram: "",
    weddingDate: "",
    ceremonyVenue: "",
    receptionVenue: "",
    city: "",
    state: "",
    estimatedGuests: "",
    ceremonyType: "",
    coupleHashtag: "",
    pipelineStage: "lead",
    servicePackage: "",
    contractValue: "",
    leadSource: "",
    referredBy: "",
    websiteSlug: "",
    tags: "",
    notes: "",
  });

  const fetchClient = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetch(`/api/clients/${id}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error("Cliente não encontrado");
        throw new Error("Erro ao carregar cliente");
      }
      const data = await res.json();
      setForm({
        brideFullName: data.brideFullName || "",
        brideEmail: data.brideEmail || "",
        bridePhone: data.bridePhone || "",
        brideCpf: data.brideCpf || "",
        brideInstagram: data.brideInstagram || "",
        groomFullName: data.groomFullName || "",
        groomPhone: data.groomPhone || "",
        groomEmail: data.groomEmail || "",
        groomCpf: data.groomCpf || "",
        groomInstagram: data.groomInstagram || "",
        weddingDate: data.weddingDate ? data.weddingDate.slice(0, 10) : "",
        ceremonyVenue: data.ceremonyVenue || "",
        receptionVenue: data.receptionVenue || "",
        city: data.city || "",
        state: data.state || "",
        estimatedGuests: data.estimatedGuests != null ? String(data.estimatedGuests) : "",
        ceremonyType: data.ceremonyType || "",
        coupleHashtag: data.coupleHashtag || "",
        pipelineStage: data.pipelineStage || "lead",
        servicePackage: data.servicePackage || "",
        contractValue: data.contractValue != null ? String(data.contractValue) : "",
        leadSource: data.leadSource || "",
        referredBy: data.referredBy || "",
        websiteSlug: data.websiteSlug || "",
        tags: Array.isArray(data.tags) ? data.tags.join(", ") : "",
        notes: data.notes || "",
      });
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Erro ao carregar cliente");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  const set = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};

    if (!form.brideFullName.trim() || form.brideFullName.trim().length < 2)
      errs.brideFullName = "Nome da noiva deve ter pelo menos 2 caracteres";
    if (!form.groomFullName.trim() || form.groomFullName.trim().length < 2)
      errs.groomFullName = "Nome do noivo deve ter pelo menos 2 caracteres";
    if (!form.brideEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.brideEmail))
      errs.brideEmail = "E-mail da noiva inválido";
    if (!form.bridePhone.trim() || form.bridePhone.replace(/\D/g, "").length < 10)
      errs.bridePhone = "Telefone da noiva inválido (min. 10 dígitos)";
    if (!form.weddingDate) errs.weddingDate = "Data do casamento obrigatória";

    if (form.groomEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.groomEmail))
      errs.groomEmail = "E-mail do noivo inválido";

    if (form.brideCpf) {
      const cleaned = form.brideCpf.replace(/\D/g, "");
      if (cleaned.length !== 11) errs.brideCpf = "CPF deve ter 11 dígitos";
    }
    if (form.groomCpf) {
      const cleaned = form.groomCpf.replace(/\D/g, "");
      if (cleaned.length !== 11) errs.groomCpf = "CPF deve ter 11 dígitos";
    }

    if (form.websiteSlug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(form.websiteSlug))
      errs.websiteSlug = "Slug deve conter apenas letras minúsculas, números e hífens";

    if (form.contractValue && (isNaN(Number(form.contractValue)) || Number(form.contractValue) < 0))
      errs.contractValue = "Valor inválido";

    if (form.estimatedGuests && (isNaN(Number(form.estimatedGuests)) || Number(form.estimatedGuests) < 1))
      errs.estimatedGuests = "Número de convidados inválido";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setApiError("");

    const body: Record<string, unknown> = {
      brideFullName: form.brideFullName.trim(),
      groomFullName: form.groomFullName.trim(),
      brideEmail: form.brideEmail.trim(),
      bridePhone: form.bridePhone.trim(),
      weddingDate: form.weddingDate,
    };

    // Optional strings
    if (form.brideCpf) body.brideCpf = form.brideCpf;
    if (form.brideInstagram) body.brideInstagram = form.brideInstagram.trim();
    if (form.groomPhone) body.groomPhone = form.groomPhone.trim();
    if (form.groomEmail) body.groomEmail = form.groomEmail.trim();
    if (form.groomCpf) body.groomCpf = form.groomCpf;
    if (form.groomInstagram) body.groomInstagram = form.groomInstagram.trim();
    if (form.coupleHashtag) body.coupleHashtag = form.coupleHashtag.trim();
    if (form.ceremonyVenue) body.ceremonyVenue = form.ceremonyVenue.trim();
    if (form.receptionVenue) body.receptionVenue = form.receptionVenue.trim();
    if (form.city) body.city = form.city.trim();
    if (form.state) body.state = form.state;
    if (form.estimatedGuests) body.estimatedGuests = Number(form.estimatedGuests);
    if (form.ceremonyType) body.ceremonyType = form.ceremonyType;
    if (form.pipelineStage) body.pipelineStage = form.pipelineStage;
    if (form.servicePackage) body.servicePackage = form.servicePackage.trim();
    if (form.contractValue) body.contractValue = Number(form.contractValue);
    if (form.leadSource) body.leadSource = form.leadSource;
    if (form.referredBy) body.referredBy = form.referredBy.trim();
    if (form.websiteSlug) body.websiteSlug = form.websiteSlug.trim();
    if (form.tags) body.tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
    if (form.notes) body.notes = form.notes.trim();

    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Erro ao salvar alterações");
      }

      router.push(`/admin/clientes/${id}`);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Erro ao salvar alterações");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cian-600 border-t-transparent" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <p className="text-sand-500 mb-4">{loadError}</p>
        <Link href="/admin/clientes">
          <Button variant="secondary">
            <ArrowLeft size={18} strokeWidth={1.5} />
            Voltar para clientes
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/admin/clientes/${id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft size={18} strokeWidth={1.5} />
            Voltar
          </Button>
        </Link>
        <div>
          <h1
            className="text-2xl font-semibold text-sand-800"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Editar Cliente
          </h1>
          <p className="text-sm text-sand-500 mt-0.5">
            Atualize os dados do casal
          </p>
        </div>
      </div>

      {apiError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Bride Section */}
        <Section
          title="Dados da Noiva"
          icon={<Heart size={16} strokeWidth={1.5} />}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nome completo" required error={errors.brideFullName}>
              <Input
                value={form.brideFullName}
                onChange={(e) => set("brideFullName", e.target.value)}
                placeholder="Nome completo da noiva"
              />
            </Field>
            <Field label="E-mail" required error={errors.brideEmail}>
              <Input
                type="email"
                value={form.brideEmail}
                onChange={(e) => set("brideEmail", e.target.value)}
                placeholder="email@exemplo.com"
              />
            </Field>
            <Field label="Telefone" required error={errors.bridePhone}>
              <Input
                value={form.bridePhone}
                onChange={(e) => set("bridePhone", e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </Field>
            <Field label="CPF" error={errors.brideCpf}>
              <Input
                value={form.brideCpf}
                onChange={(e) => set("brideCpf", e.target.value)}
                placeholder="000.000.000-00"
              />
            </Field>
            <Field label="Instagram">
              <Input
                value={form.brideInstagram}
                onChange={(e) => set("brideInstagram", e.target.value)}
                placeholder="@usuario"
              />
            </Field>
          </div>
        </Section>

        {/* Groom Section */}
        <Section
          title="Dados do Noivo"
          icon={<User size={16} strokeWidth={1.5} />}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nome completo" required error={errors.groomFullName}>
              <Input
                value={form.groomFullName}
                onChange={(e) => set("groomFullName", e.target.value)}
                placeholder="Nome completo do noivo"
              />
            </Field>
            <Field label="E-mail" error={errors.groomEmail}>
              <Input
                type="email"
                value={form.groomEmail}
                onChange={(e) => set("groomEmail", e.target.value)}
                placeholder="email@exemplo.com"
              />
            </Field>
            <Field label="Telefone">
              <Input
                value={form.groomPhone}
                onChange={(e) => set("groomPhone", e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </Field>
            <Field label="CPF" error={errors.groomCpf}>
              <Input
                value={form.groomCpf}
                onChange={(e) => set("groomCpf", e.target.value)}
                placeholder="000.000.000-00"
              />
            </Field>
            <Field label="Instagram">
              <Input
                value={form.groomInstagram}
                onChange={(e) => set("groomInstagram", e.target.value)}
                placeholder="@usuario"
              />
            </Field>
          </div>
        </Section>

        {/* Wedding Section */}
        <Section
          title="Casamento"
          icon={<CalendarDays size={16} strokeWidth={1.5} />}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Data do casamento" required error={errors.weddingDate}>
              <Input
                type="date"
                value={form.weddingDate}
                onChange={(e) => set("weddingDate", e.target.value)}
              />
            </Field>
            <Field label="Tipo de cerimônia">
              <Select
                value={form.ceremonyType}
                onChange={(e) => set("ceremonyType", e.target.value)}
              >
                {CEREMONY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Local da cerimônia">
              <Input
                value={form.ceremonyVenue}
                onChange={(e) => set("ceremonyVenue", e.target.value)}
                placeholder="Igreja, cartorio, etc."
              />
            </Field>
            <Field label="Local da recepção">
              <Input
                value={form.receptionVenue}
                onChange={(e) => set("receptionVenue", e.target.value)}
                placeholder="Salao, fazenda, etc."
              />
            </Field>
            <Field label="Cidade">
              <Input
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder="Cidade"
              />
            </Field>
            <Field label="Estado">
              <Select
                value={form.state}
                onChange={(e) => set("state", e.target.value)}
              >
                <option value="">Selecione...</option>
                {BRAZILIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Convidados estimados" error={errors.estimatedGuests}>
              <Input
                type="number"
                min="1"
                max="5000"
                value={form.estimatedGuests}
                onChange={(e) => set("estimatedGuests", e.target.value)}
                placeholder="150"
              />
            </Field>
            <Field label="Hashtag do casal">
              <Input
                value={form.coupleHashtag}
                onChange={(e) => set("coupleHashtag", e.target.value)}
                placeholder="#NoivaENoivo2026"
              />
            </Field>
          </div>
        </Section>

        {/* Commercial Section */}
        <Section
          title="Comercial"
          icon={<Briefcase size={16} strokeWidth={1.5} />}
          defaultOpen={false}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Etapa do pipeline">
              <Select
                value={form.pipelineStage}
                onChange={(e) => set("pipelineStage", e.target.value)}
              >
                {PIPELINE_STAGES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Origem do lead">
              <Select
                value={form.leadSource}
                onChange={(e) => set("leadSource", e.target.value)}
              >
                {LEAD_SOURCES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Pacote de serviço">
              <Input
                value={form.servicePackage}
                onChange={(e) => set("servicePackage", e.target.value)}
                placeholder="Ex: Pacote Premium"
              />
            </Field>
            <Field label="Valor do contrato" error={errors.contractValue}>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.contractValue}
                onChange={(e) => set("contractValue", e.target.value)}
                placeholder="5000.00"
              />
            </Field>
            <Field label="Indicado por">
              <Input
                value={form.referredBy}
                onChange={(e) => set("referredBy", e.target.value)}
                placeholder="Nome de quem indicou"
              />
            </Field>
            <Field label="Slug do site" error={errors.websiteSlug}>
              <Input
                value={form.websiteSlug}
                onChange={(e) => set("websiteSlug", e.target.value)}
                placeholder="noiva-e-noivo"
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Tags (separadas por virgula)">
                <Input
                  value={form.tags}
                  onChange={(e) => set("tags", e.target.value)}
                  placeholder="vip, prioridade, 2026"
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Observações">
                <Textarea
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Anotacoes sobre o casal..."
                  rows={4}
                />
              </Field>
            </div>
          </div>
        </Section>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link href={`/admin/clientes/${id}`}>
            <Button type="button" variant="secondary">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {submitting ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </form>
    </div>
  );
}
