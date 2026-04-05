/**
 * Servico de monitoramento de erros (Sentry).
 *
 * Degrada graciosamente quando SENTRY_DSN nao esta configurada —
 * erros sao apenas logados no console.
 *
 * TODO: Para integracao completa, instalar @sentry/nextjs e configurar
 * via sentry.client.config.ts / sentry.server.config.ts / sentry.edge.config.ts.
 * O pacote oficial oferece: source maps, performance tracing, session replay,
 * breadcrumbs automaticos, e integracao com o App Router.
 * Docs: https://docs.sentry.io/platforms/javascript/guides/nextjs/
 *
 * @module lib/sentry
 */

const SENTRY_DSN = process.env.SENTRY_DSN;

/** Parsed DSN components, cached on first use. */
let parsedDsn: { publicKey: string; projectId: string; host: string } | null = null;

/**
 * Parses a Sentry DSN string into its components.
 * DSN format: https://<PUBLIC_KEY>@<HOST>/<PROJECT_ID>
 */
function parseDsn(dsn: string): typeof parsedDsn {
  try {
    const url = new URL(dsn);
    const projectId = url.pathname.replace("/", "");
    const publicKey = url.username;
    const host = url.host;
    if (!publicKey || !projectId || !host) return null;
    return { publicKey, projectId, host };
  } catch {
    console.error("[Sentry] DSN invalido:", dsn);
    return null;
  }
}

function getDsn(): typeof parsedDsn {
  if (!SENTRY_DSN) return null;
  if (!parsedDsn) {
    parsedDsn = parseDsn(SENTRY_DSN);
  }
  return parsedDsn;
}

/**
 * Envia um envelope para a Sentry Store API.
 * Usa o formato de envelope (https://develop.sentry.dev/sdk/envelopes/).
 */
async function sendToSentry(payload: Record<string, unknown>): Promise<void> {
  const dsn = getDsn();
  if (!dsn) return;

  const envelope = [
    JSON.stringify({
      dsn: SENTRY_DSN,
      sent_at: new Date().toISOString(),
    }),
    JSON.stringify({ type: "event" }),
    JSON.stringify(payload),
  ].join("\n");

  const url = `https://${dsn.host}/api/${dsn.projectId}/envelope/?sentry_key=${dsn.publicKey}&sentry_version=7`;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-sentry-envelope" },
      body: envelope,
    });
  } catch (err) {
    // Falha silenciosa — nao queremos que o monitoramento quebre a aplicacao
    console.error("[Sentry] Falha ao enviar evento:", err);
  }
}

/**
 * Captura uma excecao e envia para o Sentry.
 * Se o Sentry nao estiver configurado, loga no console.error.
 */
export function captureException(error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  console.error("[Error]", message, stack ?? "");

  if (!getDsn()) return;

  sendToSentry({
    level: "error",
    platform: "node",
    timestamp: Date.now() / 1000,
    exception: {
      values: [
        {
          type: error instanceof Error ? error.constructor.name : "Error",
          value: message,
          stacktrace: stack ? { frames: [{ filename: stack }] } : undefined,
        },
      ],
    },
  });
}

/**
 * Captura uma mensagem informativa e envia para o Sentry.
 * Se o Sentry nao estiver configurado, loga no console.error.
 */
export function captureMessage(message: string, level: "info" | "warning" | "error" = "info"): void {
  if (level === "error") {
    console.error("[Sentry]", message);
  } else if (level === "warning") {
    console.warn("[Sentry]", message);
  } else {
    console.log("[Sentry]", message);
  }

  if (!getDsn()) return;

  sendToSentry({
    level,
    platform: "node",
    timestamp: Date.now() / 1000,
    message: { formatted: message },
  });
}
