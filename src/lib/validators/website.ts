import { z } from "zod/v4";
import { sanitizeText } from "@/lib/sanitize";

const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor deve ser hexadecimal (#RRGGBB)");

export const websiteConfigUpdateSchema = z.object({
  primaryColor: hexColor.optional(),
  secondaryColor: hexColor.optional(),
  accentColor: hexColor.optional(),
  backgroundColor: hexColor.optional(),
  textColor: hexColor.optional(),
  fontHeading: z.string().max(50).optional(),
  fontBody: z.string().max(50).optional(),
  monogram: z.string().max(10).optional(),
  heroTitle: z.string().max(100).transform(sanitizeText).optional(),
  heroDate: z.string().max(20).optional(),
  heroLocation: z.string().max(100).transform(sanitizeText).optional(),
  heroImageUrl: z.string().max(500).optional(),
  welcomeTitle: z.string().max(100).transform(sanitizeText).optional(),
  welcomeText: z.string().max(2000).transform(sanitizeText).optional(),
  eventTitle: z.string().max(100).transform(sanitizeText).optional(),
  eventText: z.string().max(2000).transform(sanitizeText).optional(),
  eventVenue: z.string().max(200).transform(sanitizeText).optional(),
  eventTime: z.string().max(20).optional(),
  dressCodeWomen: z.string().max(1000).transform(sanitizeText).optional(),
  dressCodeMen: z.string().max(1000).transform(sanitizeText).optional(),
  showCountdown: z.boolean().optional(),
  showWelcome: z.boolean().optional(),
  showEvent: z.boolean().optional(),
  showSchedule: z.boolean().optional(),
  showDressCode: z.boolean().optional(),
  showGifts: z.boolean().optional(),
  showRsvp: z.boolean().optional(),
  showTips: z.boolean().optional(),
  showGallery: z.boolean().optional(),
  schedule: z.array(z.object({
    date: z.string().max(20),
    event: z.string().max(100),
    time: z.string().max(20),
    location: z.string().max(200),
  })).max(20).optional(),
  tips: z.array(z.object({
    title: z.string().max(100),
    description: z.string().max(500),
  })).max(20).optional(),
  galleryImages: z.array(z.string().max(500)).max(20).optional(),
  couplePhotoUrl: z.string().max(500).optional(),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
});

export const rsvpCreateSchema = z.object({
  guestName: z.string().min(2, "Nome é obrigatório").max(100).transform(sanitizeText),
  guestEmail: z.email("E-mail inválido").optional(),
  guestPhone: z.string().max(20).optional(),
  attendance: z.enum(["sim", "nao", "talvez"], { message: "Confirmação inválida" }),
  companions: z.number().int().min(0).max(10).default(0),
  dietaryNotes: z.string().max(500).transform(sanitizeText).optional(),
  message: z.string().max(1000).transform(sanitizeText).optional(),
  // Honeypot field — bots will fill this in
  website: z.string().optional(),
});

export const publishActionSchema = z.object({
  action: z.enum(["publish", "unpublish"]),
});

export type WebsiteConfigUpdate = z.infer<typeof websiteConfigUpdateSchema>;
export type RsvpCreate = z.infer<typeof rsvpCreateSchema>;
export type PublishAction = z.infer<typeof publishActionSchema>;
