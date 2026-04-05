"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Circle,
  CheckCircle2,
  CircleDot,
  Clock,
  Lock,
  Plus,
  Trash2,
  Pencil,
  AlertTriangle,
  Loader2,
  X,
  CalendarClock,
  ListChecks,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

interface ProjectStep {
  id: string;
  clientId: string;
  name: string;
  description: string | null;
  sortOrder: number;
  status: string;
  deadline: string | null;
  revisedDeadline: string | null;
  revisionReason: string | null;
  completedAt: string | null;
  requiresStep: string | null;
  checklist: ChecklistItem[] | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pendente" },
  { value: "in_progress", label: "Em Andamento" },
  { value: "review", label: "Aprovação" },
  { value: "completed", label: "Concluído" },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-sand-400",
  in_progress: "bg-sky-500",
  review: "bg-amber-500",
  completed: "bg-emerald-500",
};

function getDeadlineInfo(deadline: string | null, revisedDeadline: string | null) {
  const effectiveDeadline = revisedDeadline || deadline;
  if (!effectiveDeadline) return null;

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const deadlineDate = new Date(effectiveDeadline);
  deadlineDate.setHours(0, 0, 0, 0);
  const diffMs = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      label: `Vencido ha ${Math.abs(diffDays)} dia${Math.abs(diffDays) !== 1 ? "s" : ""}`,
      color: "bg-red-50 text-red-700 border-red-200",
      urgent: true,
    };
  }
  if (diffDays <= 7) {
    return {
      label: `D-${diffDays}`,
      color: "bg-amber-50 text-amber-700 border-amber-200",
      urgent: false,
    };
  }
  return {
    label: formatDateShort(effectiveDeadline),
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    urgent: false,
  };
}

function formatDateShort(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

function formatDateInput(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toISOString().split("T")[0];
}

export function StepsTab({ clientId }: { clientId: string }) {
  const [steps, setSteps] = useState<ProjectStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [creatingTemplate, setCreatingTemplate] = useState(false);

  // Add step form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
  const [newRequiresStep, setNewRequiresStep] = useState("");

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDeadline, setEditDeadline] = useState("");

  // Revision dialog
  const [revisionStepId, setRevisionStepId] = useState<string | null>(null);
  const [revisionDate, setRevisionDate] = useState("");
  const [revisionReason, setRevisionReason] = useState("");
  const [savingRevision, setSavingRevision] = useState(false);

  // Delete dialog
  const [deleteStepId, setDeleteStepId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchSteps = useCallback(async () => {
    try {
      const res = await fetch(`/api/clients/${clientId}/steps`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSteps(data);
    } catch {
      setError("Erro ao carregar etapas");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchSteps();
  }, [fetchSteps]);

  const handleCreateTemplate = async () => {
    setCreatingTemplate(true);
    try {
      const res = await fetch(`/api/clients/${clientId}/steps/template`, {
        method: "POST",
      });
      if (!res.ok) throw new Error();
      await fetchSteps();
    } catch {
      setError("Erro ao criar etapas padrao");
    } finally {
      setCreatingTemplate(false);
    }
  };

  const handleAddStep = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const body: Record<string, unknown> = { name: newName.trim() };
      if (newDescription.trim()) body.description = newDescription.trim();
      if (newDeadline) body.deadline = newDeadline;
      if (newRequiresStep) body.requiresStep = newRequiresStep;

      const res = await fetch(`/api/clients/${clientId}/steps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      setNewName("");
      setNewDescription("");
      setNewDeadline("");
      setNewRequiresStep("");
      setShowAddForm(false);
      await fetchSteps();
    } catch {
      setError("Erro ao adicionar etapa");
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async (stepId: string, data: Record<string, unknown>) => {
    // Optimistic update for checklist
    if (data.checklist) {
      setSteps((prev) =>
        prev.map((s) => (s.id === stepId ? { ...s, checklist: data.checklist as ChecklistItem[] } : s))
      );
    }
    try {
      const res = await fetch(`/api/clients/${clientId}/steps`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stepId, ...data }),
      });
      if (!res.ok) throw new Error();
    } catch {
      fetchSteps();
    }
  };

  const handleStatusChange = async (stepId: string, status: string) => {
    // Optimistic update
    setSteps((prev) =>
      prev.map((s) =>
        s.id === stepId
          ? {
              ...s,
              status,
              completedAt: status === "completed" ? new Date().toISOString() : null,
            }
          : s
      )
    );

    try {
      const res = await fetch(`/api/clients/${clientId}/steps`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stepId, status }),
      });
      if (!res.ok) throw new Error();
      // Refetch to get server-set values
      await fetchSteps();
    } catch {
      await fetchSteps();
    }
  };

  const handleToggleComplete = async (step: ProjectStep) => {
    const newStatus = step.status === "completed" ? "pending" : "completed";
    await handleStatusChange(step.id, newStatus);
  };

  const handleStartEdit = (step: ProjectStep) => {
    setEditingId(step.id);
    setEditName(step.name);
    setEditDescription(step.description || "");
    setEditDeadline(formatDateInput(step.deadline));
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editName.trim()) return;
    try {
      const body: Record<string, unknown> = {
        stepId: editingId,
        name: editName.trim(),
        description: editDescription.trim() || undefined,
      };
      if (editDeadline) {
        body.deadline = editDeadline;
      }

      const res = await fetch(`/api/clients/${clientId}/steps`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      setEditingId(null);
      await fetchSteps();
    } catch {
      setError("Erro ao salvar edicao");
    }
  };

  const handleSaveRevision = async () => {
    if (!revisionStepId || !revisionDate || !revisionReason.trim()) return;
    setSavingRevision(true);
    try {
      const res = await fetch(`/api/clients/${clientId}/steps`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepId: revisionStepId,
          revisedDeadline: revisionDate,
          revisionReason: revisionReason.trim(),
        }),
      });
      if (!res.ok) throw new Error();
      setRevisionStepId(null);
      setRevisionDate("");
      setRevisionReason("");
      await fetchSteps();
    } catch {
      setError("Erro ao salvar revisao de prazo");
    } finally {
      setSavingRevision(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteStepId) return;
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/clients/${clientId}/steps?stepId=${deleteStepId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error();
      setDeleteStepId(null);
      await fetchSteps();
    } catch {
      setError("Erro ao excluir etapa");
    } finally {
      setDeleting(false);
    }
  };

  const getStepById = (id: string) => steps.find((s) => s.id === id);

  const isStepBlocked = (step: ProjectStep): { blocked: boolean; blockerName: string | null } => {
    if (!step.requiresStep) return { blocked: false, blockerName: null };
    const required = getStepById(step.requiresStep);
    if (!required) return { blocked: false, blockerName: null };
    return {
      blocked: required.status !== "completed",
      blockerName: required.name,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={24} className="animate-spin text-cian-600" />
      </div>
    );
  }

  if (error && steps.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center py-16">
        <AlertTriangle size={48} strokeWidth={1} className="text-sand-300 mb-4" />
        <p className="text-sm text-sand-500">{error}</p>
        <Button variant="secondary" size="sm" className="mt-4" onClick={fetchSteps}>
          Tentar novamente
        </Button>
      </Card>
    );
  }

  // Empty state
  if (steps.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center py-16">
        <ListChecks size={48} strokeWidth={1} className="text-sand-300 mb-4" />
        <p className="text-sm text-sand-500 mb-4">
          Nenhuma etapa cadastrada para este projeto
        </p>
        <div className="flex gap-3">
          <Button onClick={handleCreateTemplate} disabled={creatingTemplate}>
            {creatingTemplate && <Loader2 size={16} className="animate-spin" />}
            Criar etapas padrao
          </Button>
          <Button variant="secondary" onClick={() => setShowAddForm(true)}>
            <Plus size={16} strokeWidth={1.5} />
            Adicionar etapa
          </Button>
        </div>
        {showAddForm && (
          <div className="mt-6 w-full max-w-md">
            <AddStepForm
              newName={newName}
              setNewName={setNewName}
              newDescription={newDescription}
              setNewDescription={setNewDescription}
              newDeadline={newDeadline}
              setNewDeadline={setNewDeadline}
              newRequiresStep={newRequiresStep}
              setNewRequiresStep={setNewRequiresStep}
              steps={steps}
              creating={creating}
              onSubmit={handleAddStep}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3
          className="text-lg font-semibold text-sand-800"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Etapas do Projeto
        </h3>
        <Button size="sm" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus size={16} strokeWidth={1.5} />
          Adicionar etapa
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertTriangle size={14} />
          {error}
          <button onClick={() => setError("")} className="ml-auto">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Step list */}
      <div className="space-y-2">
        {steps.map((step) => {
          const deadlineInfo = getDeadlineInfo(step.deadline, step.revisedDeadline);
          const { blocked, blockerName } = isStepBlocked(step);
          const isCompleted = step.status === "completed";
          const isEditing = editingId === step.id;

          return (
            <Card
              key={step.id}
              className={cn(
                "transition-opacity",
                isCompleted && "opacity-60"
              )}
            >
              <CardContent className="p-4">
                {isEditing ? (
                  /* Edit mode */
                  <div className="space-y-3">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Nome da etapa"
                    />
                    <Input
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Descricao (opcional)"
                    />
                    <Input
                      type="date"
                      value={editDeadline}
                      onChange={(e) => setEditDeadline(e.target.value)}
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setEditingId(null)}
                      >
                        Cancelar
                      </Button>
                      <Button size="sm" onClick={handleSaveEdit}>
                        Salvar
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* View mode */
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggleComplete(step)}
                      className="mt-0.5 shrink-0 transition-colors"
                      title={isCompleted ? "Marcar como pendente" : "Marcar como concluido"}
                    >
                      {isCompleted ? (
                        <CheckCircle2 size={22} className="text-emerald-500" />
                      ) : step.status === "in_progress" ? (
                        <CircleDot size={22} className="text-sky-500" />
                      ) : step.status === "review" ? (
                        <CircleDot size={22} className="text-amber-500" />
                      ) : (
                        <Circle size={22} className="text-sand-300" />
                      )}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Status dot */}
                        <span
                          className={cn(
                            "inline-block w-2 h-2 rounded-full shrink-0",
                            STATUS_COLORS[step.status] || "bg-sand-400"
                          )}
                        />
                        {/* Name */}
                        <span
                          className={cn(
                            "font-medium text-sm text-sand-800",
                            isCompleted && "line-through"
                          )}
                        >
                          {step.name}
                        </span>

                        {/* Deadline badges */}
                        {deadlineInfo && (
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border",
                              deadlineInfo.color
                            )}
                          >
                            <Clock size={10} />
                            {deadlineInfo.label}
                          </span>
                        )}

                        {/* Show original deadline strikethrough if revised */}
                        {step.revisedDeadline && step.deadline && (
                          <span className="text-xs text-sand-400 line-through">
                            {formatDateShort(step.deadline)}
                          </span>
                        )}

                        {/* Revised deadline tag */}
                        {step.revisedDeadline && (
                          <span
                            className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-600 border border-amber-200 cursor-help"
                            title={step.revisionReason || "Prazo revisado"}
                          >
                            <CalendarClock size={10} />
                            Prazo revisado
                          </span>
                        )}

                        {/* Blocked indicator */}
                        {blocked && blockerName && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-sand-100 px-2 py-0.5 text-xs text-sand-500 border border-sand-200">
                            <Lock size={10} />
                            Aguardando: {blockerName}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      {step.description && (
                        <p className="text-xs text-sand-400 mt-1">
                          {step.description}
                        </p>
                      )}

                      {/* Checklist */}
                      {step.checklist && step.checklist.length > 0 && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2 mb-1.5">
                            <div className="flex-1 h-1.5 rounded-full bg-sand-100 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-cian-500 transition-all duration-300"
                                style={{
                                  width: `${Math.round((step.checklist.filter((c: ChecklistItem) => c.checked).length / step.checklist.length) * 100)}%`,
                                }}
                              />
                            </div>
                            <span className="text-[10px] text-sand-400 shrink-0">
                              {step.checklist.filter((c: ChecklistItem) => c.checked).length}/{step.checklist.length}
                            </span>
                          </div>
                          <div className="space-y-0.5">
                            {step.checklist.map((item: ChecklistItem) => (
                              <label
                                key={item.id}
                                className="flex items-center gap-2 py-0.5 cursor-pointer group/check"
                              >
                                <input
                                  type="checkbox"
                                  checked={item.checked}
                                  onChange={() => {
                                    const updated = step.checklist!.map((c: ChecklistItem) =>
                                      c.id === item.id ? { ...c, checked: !c.checked } : c
                                    );
                                    handleUpdate(step.id, { checklist: updated });
                                  }}
                                  className="rounded border-sand-300 text-cian-600 focus:ring-cian-500/20 h-3.5 w-3.5"
                                />
                                <span
                                  className={cn(
                                    "text-xs transition-colors",
                                    item.checked
                                      ? "text-sand-400 line-through"
                                      : "text-sand-600 group-hover/check:text-sand-800"
                                  )}
                                >
                                  {item.text}
                                </span>
                              </label>
                            ))}
                          </div>
                          {/* Add checklist item */}
                          <button
                            type="button"
                            onClick={() => {
                              const text = prompt("Nome do item:");
                              if (!text?.trim()) return;
                              const newItem: ChecklistItem = {
                                id: `item-${Date.now()}`,
                                text: text.trim(),
                                checked: false,
                              };
                              const updated = [...(step.checklist || []), newItem];
                              handleUpdate(step.id, { checklist: updated });
                            }}
                            className="mt-1 text-[10px] text-cian-600 hover:text-cian-700 flex items-center gap-1"
                          >
                            <Plus size={10} /> Adicionar item
                          </button>
                        </div>
                      )}

                      {/* Add checklist button if no checklist */}
                      {(!step.checklist || step.checklist.length === 0) && (
                        <button
                          type="button"
                          onClick={() => {
                            const text = prompt("Nome do primeiro item:");
                            if (!text?.trim()) return;
                            const newItem: ChecklistItem = {
                              id: `item-${Date.now()}`,
                              text: text.trim(),
                              checked: false,
                            };
                            handleUpdate(step.id, { checklist: [newItem] });
                          }}
                          className="mt-1 text-[10px] text-sand-400 hover:text-cian-600 flex items-center gap-1"
                        >
                          <ListChecks size={10} /> Adicionar checklist
                        </button>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Status dropdown */}
                      <Select
                        value={step.status}
                        onChange={(e) => handleStatusChange(step.id, e.target.value)}
                        className="h-8 w-auto min-w-[120px] text-xs px-2 pr-7"
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </Select>

                      {/* Revise deadline */}
                      {step.deadline && (
                        <button
                          onClick={() => {
                            setRevisionStepId(step.id);
                            setRevisionDate("");
                            setRevisionReason("");
                          }}
                          className="p-1.5 text-sand-400 hover:text-sand-600 transition-colors"
                          title="Revisar prazo"
                        >
                          <CalendarClock size={14} />
                        </button>
                      )}

                      {/* Edit */}
                      <button
                        onClick={() => handleStartEdit(step)}
                        className="p-1.5 text-sand-400 hover:text-sand-600 transition-colors"
                        title="Editar"
                      >
                        <Pencil size={14} />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => setDeleteStepId(step.id)}
                        className="p-1.5 text-sand-400 hover:text-red-500 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add step form */}
      {showAddForm && (
        <Card>
          <CardContent className="p-4">
            <AddStepForm
              newName={newName}
              setNewName={setNewName}
              newDescription={newDescription}
              setNewDescription={setNewDescription}
              newDeadline={newDeadline}
              setNewDeadline={setNewDeadline}
              newRequiresStep={newRequiresStep}
              setNewRequiresStep={setNewRequiresStep}
              steps={steps}
              creating={creating}
              onSubmit={handleAddStep}
              onCancel={() => setShowAddForm(false)}
            />
          </CardContent>
        </Card>
      )}

      {/* Revision Dialog */}
      <Dialog
        open={revisionStepId !== null}
        onClose={() => setRevisionStepId(null)}
      >
        <DialogTitle>Revisar prazo</DialogTitle>
        <DialogDescription>
          Informe a nova data e o motivo da revisao.
        </DialogDescription>
        <div className="mt-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-sand-600 block mb-1">
              Nova data
            </label>
            <Input
              type="date"
              value={revisionDate}
              onChange={(e) => setRevisionDate(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-sand-600 block mb-1">
              Motivo
            </label>
            <Input
              value={revisionReason}
              onChange={(e) => setRevisionReason(e.target.value)}
              placeholder="Ex: Cliente solicitou mais tempo"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => setRevisionStepId(null)}
            disabled={savingRevision}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSaveRevision}
            disabled={savingRevision || !revisionDate || !revisionReason.trim()}
          >
            {savingRevision && <Loader2 size={16} className="animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteStepId !== null} onClose={() => setDeleteStepId(null)}>
        <DialogTitle>Excluir etapa</DialogTitle>
        <DialogDescription>
          Tem certeza que deseja excluir esta etapa? Esta acao nao pode ser
          desfeita.
        </DialogDescription>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => setDeleteStepId(null)}
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

/* ── Add Step Inline Form ── */
function AddStepForm({
  newName,
  setNewName,
  newDescription,
  setNewDescription,
  newDeadline,
  setNewDeadline,
  newRequiresStep,
  setNewRequiresStep,
  steps,
  creating,
  onSubmit,
  onCancel,
}: {
  newName: string;
  setNewName: (v: string) => void;
  newDescription: string;
  setNewDescription: (v: string) => void;
  newDeadline: string;
  setNewDeadline: (v: string) => void;
  newRequiresStep: string;
  setNewRequiresStep: (v: string) => void;
  steps: ProjectStep[];
  creating: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-sand-700">Nova etapa</p>
      <Input
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        placeholder="Nome da etapa *"
      />
      <Input
        value={newDescription}
        onChange={(e) => setNewDescription(e.target.value)}
        placeholder="Descricao (opcional)"
      />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-sand-500 block mb-1">Prazo</label>
          <Input
            type="date"
            value={newDeadline}
            onChange={(e) => setNewDeadline(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-sand-500 block mb-1">
            Pre-requisito
          </label>
          <Select
            value={newRequiresStep}
            onChange={(e) => setNewRequiresStep(e.target.value)}
          >
            <option value="">Nenhum</option>
            {steps.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="secondary" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          size="sm"
          onClick={onSubmit}
          disabled={creating || !newName.trim()}
        >
          {creating && <Loader2 size={16} className="animate-spin" />}
          Adicionar
        </Button>
      </div>
    </div>
  );
}
