import { z } from "zod/v4";
import { sanitizeText } from "@/lib/sanitize";

const RESERVED_SLUGS = [
  "admin", "api", "login", "logout", "settings", "dashboard",
  "public", "static", "_next", "register", "auth", "webhook",
];

const VALID_STAGES = [
  "lead", "contacted", "proposal_sent", "contract_signed",
  "in_production", "delivered", "completed",
] as const;

const VALID_CEREMONY_TYPES = ["civil", "religiosa", "ambas"] as const;
const VALID_LEAD_SOURCES = ["instagram", "indicacao", "google", "feira", "outro"] as const;

export function validateCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, "");
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleaned)) return false;

  const digits = cleaned.split("").map(Number);

  // First check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += digits[i] * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== digits[9]) return false;

  // Second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) sum += digits[i] * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== digits[10]) return false;

  return true;
}

const cpfSchema = z.string().optional().transform((val) => {
  if (!val) return val;
  const cleaned = val.replace(/\D/g, "");
  if (cleaned && !validateCPF(cleaned)) {
    throw new Error("CPF inválido");
  }
  return cleaned;
});

export const clientCreateSchema = z.object({
  brideFullName: z.string().min(2).max(100).transform(sanitizeText),
  groomFullName: z.string().min(2).max(100).transform(sanitizeText),
  brideCpf: cpfSchema,
  groomCpf: cpfSchema,
  bridePhone: z.string().min(10).max(15),
  brideEmail: z.email("E-mail da noiva inválido"),
  brideInstagram: z.string().max(50).optional(),
  groomPhone: z.string().min(10).max(15).optional(),
  groomEmail: z.email("E-mail do noivo inválido").optional(),
  groomInstagram: z.string().max(50).optional(),
  coupleHashtag: z.string().max(50).optional(),
  weddingDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Data inválida"),
  ceremonyVenue: z.string().max(200).optional(),
  receptionVenue: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(2).optional(),
  estimatedGuests: z.number().int().min(1).max(5000).optional(),
  ceremonyType: z.enum(VALID_CEREMONY_TYPES).optional(),
  pipelineStage: z.enum(VALID_STAGES).optional(),
  servicePackage: z.string().max(100).optional(),
  contractValue: z.number().min(0).max(999999).optional(),
  leadSource: z.enum(VALID_LEAD_SOURCES).optional(),
  referredBy: z.string().max(100).optional(),
  tags: z.array(z.string().max(30)).max(10).optional(),
  websiteSlug: z.string().min(2).max(50)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug deve conter apenas letras minúsculas, números e hífens")
    .refine((val) => !RESERVED_SLUGS.includes(val), "Slug reservado pelo sistema")
    .optional(),
  customDomain: z.string().max(253)
    .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/, "Domínio inválido")
    .optional(),
  websiteType: z.enum(["template", "custom"]).optional(),
  notes: z.string().max(5000).transform(sanitizeText).optional(),
});

export const clientUpdateSchema = clientCreateSchema.partial();

export const pipelineStageSchema = z.object({
  stage: z.enum(VALID_STAGES),
});

export type ClientCreate = z.infer<typeof clientCreateSchema>;
export type ClientUpdate = z.infer<typeof clientUpdateSchema>;
export type PipelineStageInput = z.infer<typeof pipelineStageSchema>;
