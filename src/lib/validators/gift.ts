import { z } from "zod/v4";
import { sanitizeText } from "@/lib/sanitize";

export const giftItemCreateSchema = z.object({
  title: z.string().min(2).max(100).transform(sanitizeText),
  description: z.string().max(500).transform(sanitizeText).optional(),
  targetAmount: z.number().min(10).max(50000),
  category: z.enum(["lua_de_mel", "casa", "experiencia", "livre"]).optional(),
  imageUrl: z.url("URL de imagem inválida").optional(),
});

export const giftPaymentSchema = z.object({
  guestName: z.string().min(2).max(100).transform(sanitizeText),
  guestEmail: z.email("E-mail inválido").optional(),
  guestPhone: z.string().max(15).optional(),
  guestMessage: z.string().max(500).transform(sanitizeText).optional(),
  amount: z.number().min(10).max(50000),
  giftItemId: z.string().optional(),
});

export type GiftItemCreate = z.infer<typeof giftItemCreateSchema>;
export type GiftPayment = z.infer<typeof giftPaymentSchema>;
