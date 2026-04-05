/**
 * Servico de email usando Resend API.
 *
 * Degrada graciosamente quando RESEND_API_KEY nao esta configurada —
 * apenas loga um aviso e retorna sem enviar.
 *
 * @module services/email
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM ?? "noreply@cianart.com.br";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Envia um email via Resend API.
 *
 * @returns Resultado com `success` e, opcionalmente, o `id` da mensagem ou `error`.
 */
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  if (!RESEND_API_KEY) {
    console.warn("[Email] RESEND_API_KEY nao configurada. Email nao enviado:", params.subject);
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: params.to,
        subject: params.subject,
        html: params.html,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("[Email] Falha ao enviar:", response.status, body);
      return { success: false, error: `Resend API error: ${response.status}` };
    }

    const data = (await response.json()) as { id: string };
    return { success: true, id: data.id };
  } catch (err) {
    console.error("[Email] Erro inesperado ao enviar email:", err);
    return { success: false, error: String(err) };
  }
}

// ─── Template Helpers ────────────────────────────────────────

/** Estilo base compartilhado por todos os templates de email. */
const baseStyle = `
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  padding: 32px 24px;
  background-color: #FEFDFB;
  color: #1a1a1a;
`;

const headerStyle = `
  color: #0D9488;
  font-size: 24px;
  margin-bottom: 16px;
`;

const footerStyle = `
  margin-top: 32px;
  padding-top: 16px;
  border-top: 1px solid #e5e5e5;
  font-size: 12px;
  color: #888;
`;

/**
 * Template de email de boas-vindas para o casal.
 */
export function welcomeEmail(coupleName: string): { subject: string; html: string } {
  return {
    subject: `Bem-vindos ao CIAN, ${coupleName}!`,
    html: `
      <div style="${baseStyle}">
        <h1 style="${headerStyle}">Bem-vindos ao CIAN! 🎉</h1>
        <p>Ola, <strong>${coupleName}</strong>!</p>
        <p>
          Estamos muito felizes em fazer parte desse momento tao especial.
          Seu site de casamento ja esta sendo preparado com todo carinho.
        </p>
        <p>
          Em breve voce recebera mais detalhes sobre como personalizar
          sua pagina e compartilhar com seus convidados.
        </p>
        <p>Com amor,<br/><strong>Equipe CIAN Art Studio</strong></p>
        <div style="${footerStyle}">
          <p>CIAN Art Studio — Identidade visual para casamentos</p>
        </div>
      </div>
    `,
  };
}

/**
 * Template de confirmacao de presenca (RSVP) para o convidado.
 */
export function rsvpConfirmationEmail(
  guestName: string,
  coupleName: string
): { subject: string; html: string } {
  return {
    subject: `Presenca confirmada — Casamento ${coupleName}`,
    html: `
      <div style="${baseStyle}">
        <h1 style="${headerStyle}">Presenca Confirmada!</h1>
        <p>Ola, <strong>${guestName}</strong>!</p>
        <p>
          Sua presenca no casamento de <strong>${coupleName}</strong> foi
          confirmada com sucesso.
        </p>
        <p>
          Fique de olho no site do casamento para mais informacoes
          sobre local, horario e dress code.
        </p>
        <p>Nos vemos la!<br/><strong>Equipe CIAN Art Studio</strong></p>
        <div style="${footerStyle}">
          <p>CIAN Art Studio — Identidade visual para casamentos</p>
        </div>
      </div>
    `,
  };
}

/**
 * Template de confirmacao de pagamento para o convidado.
 */
export function paymentConfirmationEmail(
  guestName: string,
  amount: number
): { subject: string; html: string } {
  const formatted = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);

  return {
    subject: `Pagamento confirmado — ${formatted}`,
    html: `
      <div style="${baseStyle}">
        <h1 style="${headerStyle}">Pagamento Confirmado!</h1>
        <p>Ola, <strong>${guestName}</strong>!</p>
        <p>
          Recebemos seu pagamento de <strong>${formatted}</strong>.
          Muito obrigado pela sua generosidade!
        </p>
        <p>
          O casal sera notificado sobre o presente. Voce pode
          acompanhar o status pelo site do casamento.
        </p>
        <p>Obrigado!<br/><strong>Equipe CIAN Art Studio</strong></p>
        <div style="${footerStyle}">
          <p>CIAN Art Studio — Identidade visual para casamentos</p>
        </div>
      </div>
    `,
  };
}
