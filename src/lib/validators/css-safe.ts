// CSS injection prevention utilities.
// Used when rendering user-provided values as CSS custom properties
// on public wedding pages. These functions ensure values cannot break
// out of their CSS context.

/**
 * Allowlist of font families that can be used on public wedding pages.
 * Includes common web-safe fonts and popular Google Fonts used in wedding sites.
 */
const ALLOWED_FONTS: ReadonlySet<string> = new Set([
  // Web-safe serif
  "Georgia",
  "Times New Roman",
  "Garamond",
  "Palatino",
  "Book Antiqua",
  // Web-safe sans-serif
  "Arial",
  "Helvetica",
  "Verdana",
  "Trebuchet MS",
  "Gill Sans",
  // Web-safe monospace
  "Courier New",
  // Google Fonts - popular for weddings
  "Playfair Display",
  "Cormorant Garamond",
  "Great Vibes",
  "Dancing Script",
  "Lora",
  "Montserrat",
  "Raleway",
  "Josefin Sans",
  "Libre Baskerville",
  "EB Garamond",
  "Tangerine",
  "Pinyon Script",
  "Alex Brush",
  "Sacramento",
  "Allura",
  "Parisienne",
  "Cinzel",
  "Poppins",
  "Roboto",
  "Open Sans",
  "Lato",
  "Inter",
  "Nunito",
  "Source Sans Pro",
  "Merriweather",
  // Generic families (CSS keywords)
  "serif",
  "sans-serif",
  "monospace",
  "cursive",
  "fantasy",
  "system-ui",
]);

/**
 * Strip any CSS that could break out of a value context.
 * Removes semicolons, braces, url(), expression(), and other
 * constructs that could be used for CSS injection.
 */
export function safeCssValue(value: string): string {
  if (!value || typeof value !== "string") return "";

  let result = value;

  // Remove null bytes
  result = result.replace(/\0/g, "");

  // Remove CSS escape sequences that could be used to obfuscate
  result = result.replace(/\\[0-9a-fA-F]{1,6}\s?/g, "");

  // Remove dangerous constructs (case-insensitive)
  // url(), expression(), var() could be used for data exfiltration or injection
  result = result.replace(/url\s*\(/gi, "");
  result = result.replace(/expression\s*\(/gi, "");
  result = result.replace(/var\s*\(/gi, "");
  result = result.replace(/calc\s*\(/gi, "");
  result = result.replace(/env\s*\(/gi, "");
  result = result.replace(/attr\s*\(/gi, "");
  result = result.replace(/@import/gi, "");
  result = result.replace(/@charset/gi, "");

  // Remove characters that break out of a CSS value context
  result = result.replace(/[;{}]/g, "");

  // Remove HTML comment markers that could interfere with CSS parsing
  result = result.replace(/<!--|-->/g, "");

  // Collapse whitespace
  result = result.trim().replace(/\s+/g, " ");

  return result;
}

/**
 * Only allow valid hex colors. Returns fallback for anything else.
 * Stricter than safeCssValue — no CSS constructs allowed at all.
 */
export function safeCssColor(
  value: string,
  fallback: string = "#000000"
): string {
  if (!value || typeof value !== "string") return fallback;

  const trimmed = value.trim();

  // Only match #RGB or #RRGGBB
  if (/^#[0-9A-Fa-f]{3}$/.test(trimmed) || /^#[0-9A-Fa-f]{6}$/.test(trimmed)) {
    return trimmed;
  }

  return fallback;
}

/**
 * Only allow font family names from the allowlist.
 * Returns the fallback font if the input is not recognized.
 */
export function safeFontFamily(
  value: string,
  fallback: string = "sans-serif"
): string {
  if (!value || typeof value !== "string") return fallback;

  const trimmed = value.trim();

  // Check exact match against allowlist
  if (ALLOWED_FONTS.has(trimmed)) {
    return trimmed;
  }

  // Also try case-insensitive match
  for (const font of ALLOWED_FONTS) {
    if (font.toLowerCase() === trimmed.toLowerCase()) {
      return font; // Return the canonical casing
    }
  }

  return fallback;
}
