"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Eye,
  Pencil,
  Globe,
  Palette,
  Image,
  Heart,
  MapPin,
  Shirt,
  ToggleLeft,
  Search as SearchIcon,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Upload,
  FileArchive,
  Package,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// ────────────────── Types ──────────────────

interface WebsiteConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontHeading: string;
  fontBody: string;
  monogram: string;
  heroTitle: string;
  heroDate: string;
  heroLocation: string;
  heroImageUrl: string;
  welcomeTitle: string;
  welcomeText: string;
  couplePhotoUrl: string;
  eventTitle: string;
  eventText: string;
  eventVenue: string;
  eventTime: string;
  dressCodeWomen: string;
  dressCodeMen: string;
  showCountdown: boolean;
  showWelcome: boolean;
  showEvent: boolean;
  showSchedule: boolean;
  showDressCode: boolean;
  showGifts: boolean;
  showRsvp: boolean;
  showTips: boolean;
  showGallery: boolean;
  metaTitle: string;
  metaDescription: string;
}

interface ClientData {
  id: string;
  brideFullName: string;
  groomFullName: string;
  weddingDate: string;
  websiteSlug: string | null;
  websiteStatus: string;
  websiteType: string;
  customDomain: string | null;
}

// ────────────────── Constants ──────────────────

const HEADING_FONTS = [
  "Pinyon Script",
  "Great Vibes",
  "Playfair Display",
  "Cormorant Garamond",
  "Dancing Script",
  "Sacramento",
  "Alex Brush",
  "Tangerine",
];

const BODY_FONTS = [
  "Cormorant SC",
  "Lora",
  "Libre Baskerville",
  "Source Serif Pro",
  "EB Garamond",
  "Crimson Text",
  "Merriweather",
  "PT Serif",
];

const DEFAULT_CONFIG: WebsiteConfig = {
  primaryColor: "#0D9488",
  secondaryColor: "#E8E0D0",
  accentColor: "#C8A855",
  backgroundColor: "#EDE6DA",
  textColor: "#2E2E2A",
  fontHeading: "Pinyon Script",
  fontBody: "Cormorant SC",
  monogram: "",
  heroTitle: "",
  heroDate: "",
  heroLocation: "",
  heroImageUrl: "",
  welcomeTitle: "",
  welcomeText: "",
  couplePhotoUrl: "",
  eventTitle: "",
  eventText: "",
  eventVenue: "",
  eventTime: "",
  dressCodeWomen: "",
  dressCodeMen: "",
  showCountdown: true,
  showWelcome: true,
  showEvent: true,
  showSchedule: true,
  showDressCode: true,
  showGifts: true,
  showRsvp: true,
  showTips: false,
  showGallery: false,
  metaTitle: "",
  metaDescription: "",
};

// ────────────────── Collapsible Section ──────────────────

function Section({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-sand-200 rounded-xl bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-sand-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon size={16} className="text-cian-600" strokeWidth={1.5} />
          <span className="text-sm font-semibold text-sand-800">{title}</span>
        </div>
        {open ? (
          <ChevronDown size={16} className="text-sand-400" />
        ) : (
          <ChevronRight size={16} className="text-sand-400" />
        )}
      </button>
      {open && <div className="px-5 pb-5 space-y-4 border-t border-sand-100 pt-4">{children}</div>}
    </div>
  );
}

// ────────────────── Field helpers ──────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-sand-600 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
  onBlur,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
}) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className="w-10 h-10 rounded-lg border border-sand-200 cursor-pointer p-0.5"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className="font-mono text-xs flex-1"
          maxLength={7}
        />
      </div>
    </Field>
  );
}

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-sand-700">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          "relative w-10 h-6 rounded-full transition-colors",
          checked ? "bg-cian-600" : "bg-sand-300"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform",
            checked ? "left-[18px]" : "left-0.5"
          )}
        />
      </button>
    </div>
  );
}

// ────────────────── Main Component ──────────────────

export default function SiteEditorPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.clientId as string;

  const [client, setClient] = useState<ClientData | null>(null);
  const [config, setConfig] = useState<WebsiteConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");
  const [uploadingZip, setUploadingZip] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadDragOver, setUploadDragOver] = useState(false);
  const zipInputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Load data
  useEffect(() => {
    async function loadData() {
      try {
        // Fetch client data
        const clientRes = await fetch(`/api/clients/${clientId}`);
        if (!clientRes.ok) throw new Error("Cliente não encontrado");
        const clientData = await clientRes.json();
        setClient(clientData);

        // Fetch website config
        const configRes = await fetch(`/api/websites/${clientId}`);
        if (configRes.ok) {
          const configData = await configRes.json();
          setConfig((prev) => ({ ...prev, ...configData }));
        }
      } catch {
        // Client doesn't exist or no config yet — use defaults
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [clientId]);

  // Save function
  const save = useCallback(async () => {
    setSaveStatus("saving");
    try {
      const res = await fetch(`/api/websites/${clientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error("Erro ao salvar");
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  }, [clientId, config]);

  // Debounced save on config change (after initial load)
  const isFirstLoad = useRef(true);
  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      save();
    }, 1500);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [config, save]);

  // Update a field
  function update<K extends keyof WebsiteConfig>(key: K, value: WebsiteConfig[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  // Publish / Unpublish
  async function togglePublish() {
    if (!client) return;
    const action = client.websiteStatus === "published" ? "unpublish" : "publish";
    try {
      const res = await fetch(`/api/websites/${clientId}/publish`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error("Erro ao publicar");
      setClient((prev) =>
        prev
          ? {
              ...prev,
              websiteStatus: action === "publish" ? "published" : "draft",
            }
          : prev
      );
    } catch {
      // Silently fail — could show toast
    }
  }

  // Switch website type
  async function switchWebsiteType(type: "template" | "custom") {
    if (!client) return;
    try {
      await fetch(`/api/clients/${client.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ websiteType: type }),
      });
      setClient((prev) => (prev ? { ...prev, websiteType: type } : prev));
    } catch {
      // Silently fail
    }
  }

  // Upload custom site ZIP
  async function handleZipUpload(file: File) {
    if (!file) return;
    setUploadingZip(true);
    setUploadError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/websites/${clientId}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao enviar arquivo");
      }

      setClient((prev) => (prev ? { ...prev, websiteType: "custom" } : prev));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Erro ao enviar arquivo");
    } finally {
      setUploadingZip(false);
      if (zipInputRef.current) zipInputRef.current.value = "";
    }
  }

  // Delete custom site
  async function handleDeleteCustomSite() {
    if (!confirm("Remover o site customizado? O site voltará ao template dinâmico.")) return;
    try {
      const res = await fetch(`/api/websites/${clientId}/upload`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erro ao remover");
      setClient((prev) => (prev ? { ...prev, websiteType: "template" } : prev));
    } catch {
      alert("Erro ao remover site customizado");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-cian-600" />
      </div>
    );
  }

  const isPublished = client?.websiteStatus === "published";
  const previewUrl = client?.websiteSlug ? `/${client.websiteSlug}` : null;

  // Build Google Fonts URL for preview
  const fontsUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(config.fontHeading)}&family=${encodeURIComponent(config.fontBody)}:wght@400;600&display=swap`;

  const isCustomSite = client?.websiteType === "custom";

  // ────────────────── Editor Panel ──────────────────
  const editorPanel = (
    <div className="space-y-4 pb-8">
      {/* Website Type Selector */}
      <div className="border border-sand-200 rounded-xl bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-sand-100">
          <div className="flex items-center gap-3">
            <Package size={16} className="text-cian-600" strokeWidth={1.5} />
            <span className="text-sm font-semibold text-sand-800">Tipo de Site</span>
          </div>
        </div>
        <div className="px-5 py-4 space-y-4">
          {/* Type cards */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => switchWebsiteType("template")}
              className={cn(
                "rounded-xl border-2 p-4 text-left transition-all",
                !isCustomSite
                  ? "border-cian-500 bg-cian-50/40 shadow-sm"
                  : "border-sand-200 hover:border-sand-300"
              )}
            >
              <Palette
                size={20}
                className={cn("mb-2", !isCustomSite ? "text-cian-600" : "text-sand-400")}
                strokeWidth={1.5}
              />
              <p className={cn("text-sm font-semibold", !isCustomSite ? "text-cian-700" : "text-sand-700")}>
                Template Dinamico
              </p>
              <p className="text-xs text-sand-500 mt-1">
                Editor visual com cores, fontes e secoes configuráveis
              </p>
            </button>
            <button
              type="button"
              onClick={() => switchWebsiteType("custom")}
              className={cn(
                "rounded-xl border-2 p-4 text-left transition-all",
                isCustomSite
                  ? "border-cian-500 bg-cian-50/40 shadow-sm"
                  : "border-sand-200 hover:border-sand-300"
              )}
            >
              <FileArchive
                size={20}
                className={cn("mb-2", isCustomSite ? "text-cian-600" : "text-sand-400")}
                strokeWidth={1.5}
              />
              <p className={cn("text-sm font-semibold", isCustomSite ? "text-cian-700" : "text-sand-700")}>
                Site Customizado
              </p>
              <p className="text-xs text-sand-500 mt-1">
                Upload de HTML/CSS/JS em arquivo .zip
              </p>
            </button>
          </div>

          {/* Custom site upload area (shown when custom is selected) */}
          {isCustomSite && (
            <div className="space-y-3">
              {uploadError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {uploadError}
                </div>
              )}

              {/* Upload zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setUploadDragOver(true);
                }}
                onDragLeave={() => setUploadDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setUploadDragOver(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleZipUpload(file);
                }}
                className={cn(
                  "rounded-xl border-2 border-dashed p-6 text-center transition-colors",
                  uploadDragOver
                    ? "border-cian-400 bg-cian-50/30"
                    : "border-sand-200 hover:border-sand-300"
                )}
              >
                <input
                  ref={zipInputRef}
                  type="file"
                  accept=".zip,application/zip,application/x-zip-compressed"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleZipUpload(file);
                  }}
                  className="hidden"
                />
                <Upload
                  size={28}
                  strokeWidth={1.5}
                  className="mx-auto mb-2 text-sand-400"
                />
                <p className="text-sm text-sand-600 mb-1">
                  Arraste o arquivo .zip aqui ou{" "}
                  <button
                    type="button"
                    onClick={() => zipInputRef.current?.click()}
                    className="text-cian-600 font-medium hover:underline"
                    disabled={uploadingZip}
                  >
                    selecione do computador
                  </button>
                </p>
                <p className="text-xs text-sand-400">
                  Arquivo .zip com index.html na raiz — max. 50MB
                </p>
                {uploadingZip && (
                  <div className="mt-3 flex items-center justify-center gap-2 text-sm text-cian-600">
                    <Loader2 size={16} className="animate-spin" />
                    Enviando e extraindo...
                  </div>
                )}
              </div>

              {/* Status and actions */}
              {client?.websiteSlug && (
                <div className="rounded-lg bg-sand-50 border border-sand-200 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Globe size={14} className="text-cian-600" strokeWidth={1.5} />
                    <span className="text-sm font-medium text-cian-700">
                      Site customizado ativo
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`/${client.websiteSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="secondary" size="sm">
                        <ExternalLink size={14} strokeWidth={1.5} />
                        Preview
                      </Button>
                    </a>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDeleteCustomSite}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={14} strokeWidth={1.5} />
                      Remover site customizado
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Visual Identity (only show template editor when in template mode) */}
      {!isCustomSite && <>
      <Section title="Identidade Visual" icon={Palette} defaultOpen>
        <div className="grid grid-cols-2 gap-4">
          <ColorField
            label="Cor Primária"
            value={config.primaryColor}
            onChange={(v) => update("primaryColor", v)}
            onBlur={save}
          />
          <ColorField
            label="Cor Secundária"
            value={config.secondaryColor}
            onChange={(v) => update("secondaryColor", v)}
            onBlur={save}
          />
          <ColorField
            label="Cor de Destaque"
            value={config.accentColor}
            onChange={(v) => update("accentColor", v)}
            onBlur={save}
          />
          <ColorField
            label="Cor de Fundo"
            value={config.backgroundColor}
            onChange={(v) => update("backgroundColor", v)}
            onBlur={save}
          />
          <ColorField
            label="Cor do Texto"
            value={config.textColor}
            onChange={(v) => update("textColor", v)}
            onBlur={save}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Fonte Título">
            <Select
              value={config.fontHeading}
              onChange={(e) => update("fontHeading", e.target.value)}
            >
              {HEADING_FONTS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Fonte Corpo">
            <Select
              value={config.fontBody}
              onChange={(e) => update("fontBody", e.target.value)}
            >
              {BODY_FONTS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Monograma">
          <Input
            value={config.monogram}
            onChange={(e) => update("monogram", e.target.value)}
            onBlur={save}
            placeholder="Ex: A & B"
          />
        </Field>
      </Section>

      {/* Hero */}
      <Section title="Hero" icon={Image} defaultOpen>
        <Field label="Título">
          <Input
            value={config.heroTitle}
            onChange={(e) => update("heroTitle", e.target.value)}
            onBlur={save}
            placeholder="Ex: Anna & Bruno"
          />
        </Field>
        <Field label="Data">
          <Input
            value={config.heroDate}
            onChange={(e) => update("heroDate", e.target.value)}
            onBlur={save}
            placeholder="Ex: 15 de Março de 2027"
          />
        </Field>
        <Field label="Local">
          <Input
            value={config.heroLocation}
            onChange={(e) => update("heroLocation", e.target.value)}
            onBlur={save}
            placeholder="Ex: São Paulo, SP"
          />
        </Field>
        <Field label="URL da Imagem de Fundo">
          <Input
            value={config.heroImageUrl}
            onChange={(e) => update("heroImageUrl", e.target.value)}
            onBlur={save}
            placeholder="https://..."
          />
        </Field>
      </Section>

      {/* Welcome */}
      <Section title="Bem-vindos" icon={Heart}>
        <Field label="Título">
          <Input
            value={config.welcomeTitle}
            onChange={(e) => update("welcomeTitle", e.target.value)}
            onBlur={save}
            placeholder="Ex: Bem-vindos ao nosso casamento!"
          />
        </Field>
        <Field label="Texto">
          <Textarea
            value={config.welcomeText}
            onChange={(e) => update("welcomeText", e.target.value)}
            onBlur={save}
            placeholder="Texto de boas-vindas..."
            rows={4}
          />
        </Field>
        <Field label="URL da Foto do Casal">
          <Input
            value={config.couplePhotoUrl}
            onChange={(e) => update("couplePhotoUrl", e.target.value)}
            onBlur={save}
            placeholder="https://..."
          />
        </Field>
      </Section>

      {/* Event */}
      <Section title="Evento" icon={MapPin}>
        <Field label="Título">
          <Input
            value={config.eventTitle}
            onChange={(e) => update("eventTitle", e.target.value)}
            onBlur={save}
            placeholder="Ex: Cerimônia & Recepção"
          />
        </Field>
        <Field label="Descrição">
          <Textarea
            value={config.eventText}
            onChange={(e) => update("eventText", e.target.value)}
            onBlur={save}
            placeholder="Detalhes do evento..."
            rows={3}
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Local">
            <Input
              value={config.eventVenue}
              onChange={(e) => update("eventVenue", e.target.value)}
              onBlur={save}
              placeholder="Nome do espaço"
            />
          </Field>
          <Field label="Horário">
            <Input
              value={config.eventTime}
              onChange={(e) => update("eventTime", e.target.value)}
              onBlur={save}
              placeholder="Ex: 16h00"
            />
          </Field>
        </div>
      </Section>

      {/* Dress Code */}
      <Section title="Dress Code" icon={Shirt}>
        <Field label="Dress Code Feminino">
          <Textarea
            value={config.dressCodeWomen}
            onChange={(e) => update("dressCodeWomen", e.target.value)}
            onBlur={save}
            placeholder="Orientações para convidadas..."
            rows={3}
          />
        </Field>
        <Field label="Dress Code Masculino">
          <Textarea
            value={config.dressCodeMen}
            onChange={(e) => update("dressCodeMen", e.target.value)}
            onBlur={save}
            placeholder="Orientações para convidados..."
            rows={3}
          />
        </Field>
      </Section>

      {/* Active Sections */}
      <Section title="Seções Ativas" icon={ToggleLeft}>
        <ToggleField
          label="Contagem Regressiva"
          checked={config.showCountdown}
          onChange={(v) => update("showCountdown", v)}
        />
        <ToggleField
          label="Bem-vindos"
          checked={config.showWelcome}
          onChange={(v) => update("showWelcome", v)}
        />
        <ToggleField
          label="Evento"
          checked={config.showEvent}
          onChange={(v) => update("showEvent", v)}
        />
        <ToggleField
          label="Programação"
          checked={config.showSchedule}
          onChange={(v) => update("showSchedule", v)}
        />
        <ToggleField
          label="Dress Code"
          checked={config.showDressCode}
          onChange={(v) => update("showDressCode", v)}
        />
        <ToggleField
          label="Lista de Presentes"
          checked={config.showGifts}
          onChange={(v) => update("showGifts", v)}
        />
        <ToggleField
          label="RSVP"
          checked={config.showRsvp}
          onChange={(v) => update("showRsvp", v)}
        />
        <ToggleField
          label="Dicas"
          checked={config.showTips}
          onChange={(v) => update("showTips", v)}
        />
        <ToggleField
          label="Galeria"
          checked={config.showGallery}
          onChange={(v) => update("showGallery", v)}
        />
      </Section>

      {/* SEO */}
      <Section title="SEO" icon={SearchIcon}>
        <Field label="Meta Título">
          <Input
            value={config.metaTitle}
            onChange={(e) => update("metaTitle", e.target.value)}
            onBlur={save}
            placeholder="Título para mecanismos de busca"
          />
        </Field>
        <Field label="Meta Descrição">
          <Textarea
            value={config.metaDescription}
            onChange={(e) => update("metaDescription", e.target.value)}
            onBlur={save}
            placeholder="Descrição para mecanismos de busca"
            rows={3}
          />
        </Field>
      </Section>

      {/* Custom Domain */}
      <Section title="Domínio Próprio" icon={Globe}>
        <Field label="Domínio personalizado">
          <Input
            value={client?.customDomain || ""}
            onChange={(e) => {
              if (client) {
                setClient({ ...client, customDomain: e.target.value || null });
              }
            }}
            onBlur={async () => {
              if (!client) return;
              try {
                await fetch(`/api/clients/${client.id}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ customDomain: client.customDomain || undefined }),
                });
              } catch { /* ignore */ }
            }}
            placeholder="carolaeder.com.br"
          />
        </Field>
        <p className="text-xs text-sand-400 mt-2">
          Após configurar aqui, o domínio precisa ser adicionado no painel da Vercel
          e o DNS do domínio deve apontar para <code className="bg-sand-100 px-1 rounded">cname.vercel-dns.com</code>
        </p>
        {client?.customDomain && (
          <div className="mt-2 flex items-center gap-2 text-xs text-cian-600">
            <Globe size={14} strokeWidth={1.5} />
            <span>https://{client.customDomain}</span>
          </div>
        )}
      </Section>
      </>}
    </div>
  );

  // ────────────────── Preview Panel ──────────────────
  const previewPanel = (
    <div className="h-full flex flex-col">
      <div
        className="flex-1 rounded-xl border border-sand-200 overflow-hidden bg-white"
        style={{ minHeight: 500 }}
      >
        {previewUrl ? (
          <iframe
            ref={iframeRef}
            src={previewUrl}
            className="w-full h-full border-0"
            style={{ minHeight: 500 }}
            title="Preview do site"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            {/* Inline styled preview */}
            <link href={fontsUrl} rel="stylesheet" />
            <div
              className="w-full max-w-md rounded-xl overflow-hidden shadow-lg"
              style={{ backgroundColor: config.backgroundColor }}
            >
              {/* Mini hero preview */}
              <div
                className="p-8 text-center"
                style={{
                  background: config.heroImageUrl
                    ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${config.heroImageUrl}) center/cover`
                    : `linear-gradient(135deg, ${config.primaryColor}, ${config.accentColor})`,
                }}
              >
                <p
                  className="text-3xl text-white mb-2"
                  style={{ fontFamily: `'${config.fontHeading}', cursive` }}
                >
                  {config.heroTitle || "Nomes do Casal"}
                </p>
                <p
                  className="text-sm text-white/80"
                  style={{ fontFamily: `'${config.fontBody}', serif` }}
                >
                  {config.heroDate || "Data do Casamento"}
                </p>
                <p
                  className="text-xs text-white/60 mt-1"
                  style={{ fontFamily: `'${config.fontBody}', serif` }}
                >
                  {config.heroLocation || "Local"}
                </p>
              </div>
              {/* Mini welcome preview */}
              <div className="p-6 text-center" style={{ color: config.textColor }}>
                <p
                  className="text-lg mb-2"
                  style={{ fontFamily: `'${config.fontHeading}', cursive` }}
                >
                  {config.welcomeTitle || "Bem-vindos"}
                </p>
                <p
                  className="text-xs leading-relaxed opacity-70"
                  style={{ fontFamily: `'${config.fontBody}', serif` }}
                >
                  {config.welcomeText || "Texto de boas-vindas aparecerá aqui..."}
                </p>
              </div>
              {/* Mini color swatches */}
              <div className="flex gap-1 p-4 justify-center">
                {[
                  config.primaryColor,
                  config.secondaryColor,
                  config.accentColor,
                  config.backgroundColor,
                  config.textColor,
                ].map((c, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full border border-black/10"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-sand-400 mt-4">
              {client?.websiteSlug
                ? "Publique o site para ver o preview completo."
                : "Salve um slug para o cliente para habilitar o preview."}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/sites">
            <Button variant="ghost" size="sm">
              <ArrowLeft size={16} strokeWidth={1.5} />
            </Button>
          </Link>
          <div>
            <h1
              className="text-xl font-bold text-sand-800"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {client
                ? `${client.brideFullName.split(" ")[0]} & ${client.groomFullName.split(" ")[0]}`
                : "Editor de Site"}
            </h1>
            {client?.websiteSlug && (
              <p className="text-xs text-cian-600 font-mono">/{client.websiteSlug}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Save status */}
          <div className="flex items-center gap-1.5 text-xs">
            {saveStatus === "saving" && (
              <>
                <Loader2 size={14} className="animate-spin text-sand-400" />
                <span className="text-sand-400">Salvando...</span>
              </>
            )}
            {saveStatus === "saved" && (
              <>
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span className="text-emerald-600">Salvo</span>
              </>
            )}
            {saveStatus === "error" && (
              <>
                <AlertCircle size={14} className="text-red-500" />
                <span className="text-red-600">Erro ao salvar</span>
              </>
            )}
          </div>

          {/* Publish button */}
          <Button
            variant={isPublished ? "secondary" : "default"}
            size="sm"
            onClick={togglePublish}
          >
            <Globe size={14} strokeWidth={1.5} />
            {isPublished ? "Despublicar" : "Publicar"}
          </Button>

          {/* Open in new tab */}
          {isPublished && previewUrl && (
            <a href={previewUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm">
                <ExternalLink size={14} strokeWidth={1.5} />
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Mobile tab toggle */}
      <div className="flex lg:hidden border border-sand-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setActiveTab("editor")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors",
            activeTab === "editor"
              ? "bg-cian-600 text-white"
              : "bg-white text-sand-600 hover:bg-sand-50"
          )}
        >
          <Pencil size={14} strokeWidth={1.5} />
          Editor
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors",
            activeTab === "preview"
              ? "bg-cian-600 text-white"
              : "bg-white text-sand-600 hover:bg-sand-50"
          )}
        >
          <Eye size={14} strokeWidth={1.5} />
          Preview
        </button>
      </div>

      {/* Split layout */}
      <div className="flex gap-6">
        {/* Editor — left side */}
        <div
          className={cn(
            "w-full lg:w-1/2 lg:block",
            activeTab === "editor" ? "block" : "hidden"
          )}
        >
          {editorPanel}
        </div>

        {/* Preview — right side */}
        <div
          className={cn(
            "w-full lg:w-1/2 lg:block lg:sticky lg:top-6 lg:self-start",
            activeTab === "preview" ? "block" : "hidden"
          )}
        >
          {previewPanel}
        </div>
      </div>
    </div>
  );
}
