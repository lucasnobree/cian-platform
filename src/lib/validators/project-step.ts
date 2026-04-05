import { z } from "zod/v4";
import { sanitizeText } from "@/lib/sanitize";

const VALID_STATUSES = ["pending", "in_progress", "review", "completed"] as const;

const checklistItemSchema = z.object({
  id: z.string(),
  text: z.string().max(200),
  checked: z.boolean(),
});

export const stepCreateSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(200).transform(sanitizeText),
  description: z.string().max(1000).transform(sanitizeText).optional(),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), "Data inválida").optional(),
  requiresStep: z.string().max(100).optional(),
  sortOrder: z.number().int().min(0).max(100).optional(),
  checklist: z.array(checklistItemSchema).max(50).optional(),
});

export const stepUpdateSchema = z.object({
  stepId: z.string().min(1, "ID da etapa é obrigatório"),
  name: z.string().min(1).max(200).transform(sanitizeText).optional(),
  description: z.string().max(1000).transform(sanitizeText).optional(),
  status: z.enum(VALID_STATUSES).optional(),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), "Data inválida").optional().nullable(),
  revisedDeadline: z.string().refine((val) => !isNaN(Date.parse(val)), "Data inválida").optional().nullable(),
  revisionReason: z.string().max(500).transform(sanitizeText).optional().nullable(),
  completedAt: z.string().refine((val) => !isNaN(Date.parse(val)), "Data inválida").optional().nullable(),
  sortOrder: z.number().int().min(0).max(100).optional(),
  checklist: z.array(checklistItemSchema).max(50).optional(),
});

export const stepDeleteSchema = z.object({
  stepId: z.string().min(1, "ID da etapa é obrigatório"),
});

export type StepCreate = z.infer<typeof stepCreateSchema>;
export type StepUpdate = z.infer<typeof stepUpdateSchema>;
