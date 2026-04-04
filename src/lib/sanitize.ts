export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "");
}

export function sanitizeText(input: string): string {
  return stripHtml(input).trim().replace(/\s+/g, " ");
}
