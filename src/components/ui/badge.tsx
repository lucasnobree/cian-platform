import { cn } from "@/lib/utils";

const stageStyles: Record<string, string> = {
  lead: "bg-slate-100 text-slate-700",
  contacted: "bg-sky-100 text-sky-700",
  proposal_sent: "bg-amber-100 text-amber-700",
  contract_signed: "bg-cian-100 text-cian-700",
  in_production: "bg-violet-100 text-violet-700",
  delivered: "bg-lime-100 text-lime-700",
  completed: "bg-emerald-100 text-emerald-700",
};

const stageLabels: Record<string, string> = {
  lead: "Lead",
  contacted: "Contatado",
  proposal_sent: "Proposta Enviada",
  contract_signed: "Contrato Assinado",
  in_production: "Em Produção",
  delivered: "Entregue",
  completed: "Concluído",
};

interface BadgeProps {
  stage: string;
  className?: string;
}

export function Badge({ stage, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        stageStyles[stage] || "bg-sand-100 text-sand-600",
        className
      )}
    >
      {stageLabels[stage] || stage}
    </span>
  );
}
