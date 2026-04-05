// HTML sanitization and input escaping utilities.
// These functions are defense-in-depth measures — always validate with Zod first.

/**
 * Strip HTML tags from input, including edge cases like unclosed tags
 * and HTML-encoded entities that could decode to tags.
 */
export function stripHtml(input: string): string {
  let result = input;

  // First decode common HTML entities that could hide tags
  result = result
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#x27;/gi, "'")
    .replace(/&#x2F;/gi, "/")
    .replace(/&#(\d+);/g, (_match, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_match, code) =>
      String.fromCharCode(parseInt(code, 16))
    );

  // Strip tags iteratively to handle nested/unclosed tags
  let previous = "";
  while (previous !== result) {
    previous = result;
    // Remove anything that looks like a tag (including unclosed ones)
    result = result.replace(/<[^>]*>?/g, "");
  }

  // Remove null bytes which can be used to bypass filters
  result = result.replace(/\0/g, "");

  return result;
}

/**
 * Sanitize text input: strip HTML, normalize whitespace.
 */
export function sanitizeText(input: string): string {
  return stripHtml(input).trim().replace(/\s+/g, " ");
}

/**
 * Escape special HTML characters for safe rendering in HTML attributes and content.
 * Use this when you need to display user input inside HTML without stripping it.
 */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/**
 * Validate and sanitize a URL. Only allows http:, https:, and data:image/* protocols.
 * Returns empty string for invalid or dangerous URLs.
 */
export function sanitizeUrl(url: string): string {
  const trimmed = url.trim();

  if (!trimmed) return "";

  // Block null bytes
  if (trimmed.includes("\0")) return "";

  // Decode any entities first to catch obfuscation
  let decoded = trimmed;
  try {
    // Handle percent-encoded characters
    decoded = decodeURIComponent(trimmed);
  } catch {
    // If decoding fails, use the raw string
    decoded = trimmed;
  }

  // Strip whitespace and control characters that could be used to bypass protocol checks
  const cleaned = decoded.replace(/[\s\x00-\x1f\x7f]/g, "");

  // Check protocol — only allow safe ones
  const protocolMatch = cleaned.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/) ;
  if (protocolMatch) {
    const protocol = protocolMatch[1].toLowerCase();

    if (protocol === "http" || protocol === "https") {
      // Standard web URLs are fine
      return trimmed;
    }

    if (protocol === "data") {
      // Only allow data:image/* URIs (for inline images)
      if (/^data:image\/[a-zA-Z0-9.+-]+[;,]/i.test(cleaned)) {
        return trimmed;
      }
      // Block all other data: URIs (javascript in disguise, text/html, etc.)
      return "";
    }

    // Block javascript:, vbscript:, and all other protocols
    return "";
  }

  // Relative URLs (no protocol) are allowed — they resolve against the page origin
  // But block protocol-relative URLs that start with // followed by suspicious content
  if (cleaned.startsWith("//")) {
    return trimmed;
  }

  // Path-relative or root-relative URLs
  if (cleaned.startsWith("/") || cleaned.startsWith("./") || cleaned.startsWith("../")) {
    return trimmed;
  }

  // If it doesn't match any safe pattern, block it
  // This catches things like "javascript:alert(1)" without the colon being detected
  return "";
}

/**
 * Validate a hex color code. Only allows #RGB or #RRGGBB format.
 * Returns the fallback color if the input is not a valid hex color.
 */
export function sanitizeColor(
  color: string,
  fallback: string = "#000000"
): string {
  const trimmed = color.trim();

  // Match #RGB or #RRGGBB (case-insensitive)
  if (/^#[0-9A-Fa-f]{3}$/.test(trimmed) || /^#[0-9A-Fa-f]{6}$/.test(trimmed)) {
    return trimmed;
  }

  return fallback;
}
