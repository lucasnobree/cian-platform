"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface RsvpFormProps {
  slug: string;
}

export function RsvpForm({ slug }: RsvpFormProps) {
  const [formData, setFormData] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    attendance: "yes",
    companions: 0,
    dietaryNotes: "",
    message: "",
    website: "", // honeypot
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  function update(field: string, value: string | number) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Honeypot check
    if (formData.website) return;

    if (!formData.guestName.trim()) {
      setErrorMessage("Por favor, preencha seu nome.");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch(`/api/public/${slug}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: formData.guestName.trim(),
          guestEmail: formData.guestEmail.trim() || undefined,
          guestPhone: formData.guestPhone.trim() || undefined,
          attendance: formData.attendance,
          companions: formData.companions,
          dietaryNotes: formData.dietaryNotes.trim() || undefined,
          message: formData.message.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erro ao enviar confirmação");
      }

      setStatus("success");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Erro ao enviar confirmação");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="text-center py-12">
        <CheckCircle2
          size={48}
          className="mx-auto mb-4"
          style={{ color: "var(--wedding-primary)" }}
        />
        <h3
          className="text-2xl mb-2"
          style={{
            fontFamily: "var(--wedding-font-heading)",
            color: "var(--wedding-text)",
          }}
        >
          Obrigado!
        </h3>
        <p
          className="opacity-70"
          style={{
            fontFamily: "var(--wedding-font-body)",
            color: "var(--wedding-text)",
          }}
        >
          Sua confirmação foi recebida com sucesso.
        </p>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    fontFamily: "var(--wedding-font-body)",
    color: "var(--wedding-text)",
    borderColor: "var(--wedding-secondary)",
    backgroundColor: "rgba(255,255,255,0.6)",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--wedding-font-body)",
    color: "var(--wedding-text)",
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-5">
      {/* Honeypot */}
      <input
        name="website"
        value={formData.website}
        onChange={(e) => update("website", e.target.value)}
        style={{ display: "none" }}
        tabIndex={-1}
        autoComplete="off"
      />

      {/* Name */}
      <div>
        <label className="block text-sm mb-1.5 font-medium" style={labelStyle}>
          Nome completo *
        </label>
        <input
          type="text"
          value={formData.guestName}
          onChange={(e) => update("guestName", e.target.value)}
          required
          className="w-full rounded-lg border px-4 py-3 text-sm outline-none transition-colors focus:ring-2"
          style={{
            ...inputStyle,
            // @ts-expect-error CSS custom property
            "--tw-ring-color": "var(--wedding-primary)",
          }}
          placeholder="Seu nome"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm mb-1.5 font-medium" style={labelStyle}>
          E-mail
        </label>
        <input
          type="email"
          value={formData.guestEmail}
          onChange={(e) => update("guestEmail", e.target.value)}
          className="w-full rounded-lg border px-4 py-3 text-sm outline-none transition-colors focus:ring-2"
          style={inputStyle}
          placeholder="seu@email.com"
        />
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm mb-1.5 font-medium" style={labelStyle}>
          Telefone
        </label>
        <input
          type="tel"
          value={formData.guestPhone}
          onChange={(e) => update("guestPhone", e.target.value)}
          className="w-full rounded-lg border px-4 py-3 text-sm outline-none transition-colors focus:ring-2"
          style={inputStyle}
          placeholder="(11) 99999-9999"
        />
      </div>

      {/* Attendance */}
      <div>
        <label className="block text-sm mb-2 font-medium" style={labelStyle}>
          Presença *
        </label>
        <div className="flex gap-3">
          {[
            { value: "yes", label: "Sim, estarei presente" },
            { value: "no", label: "Infelizmente não poderei ir" },
            { value: "maybe", label: "Ainda não sei" },
          ].map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 cursor-pointer rounded-lg border px-4 py-2.5 text-sm transition-colors flex-1 text-center justify-center"
              style={{
                ...labelStyle,
                borderColor:
                  formData.attendance === opt.value
                    ? "var(--wedding-primary)"
                    : "var(--wedding-secondary)",
                backgroundColor:
                  formData.attendance === opt.value
                    ? "var(--wedding-primary)"
                    : "rgba(255,255,255,0.6)",
                color:
                  formData.attendance === opt.value
                    ? "#fff"
                    : "var(--wedding-text)",
              }}
            >
              <input
                type="radio"
                name="attendance"
                value={opt.value}
                checked={formData.attendance === opt.value}
                onChange={(e) => update("attendance", e.target.value)}
                className="sr-only"
              />
              {opt.value === "yes" ? "Sim" : opt.value === "no" ? "Não" : "Talvez"}
            </label>
          ))}
        </div>
      </div>

      {/* Companions */}
      {formData.attendance !== "no" && (
        <div>
          <label className="block text-sm mb-1.5 font-medium" style={labelStyle}>
            Acompanhantes
          </label>
          <input
            type="number"
            min={0}
            max={10}
            value={formData.companions}
            onChange={(e) => update("companions", parseInt(e.target.value) || 0)}
            className="w-full rounded-lg border px-4 py-3 text-sm outline-none transition-colors focus:ring-2"
            style={inputStyle}
          />
        </div>
      )}

      {/* Dietary */}
      <div>
        <label className="block text-sm mb-1.5 font-medium" style={labelStyle}>
          Restrições alimentares
        </label>
        <textarea
          value={formData.dietaryNotes}
          onChange={(e) => update("dietaryNotes", e.target.value)}
          rows={2}
          className="w-full rounded-lg border px-4 py-3 text-sm outline-none transition-colors focus:ring-2 resize-y"
          style={inputStyle}
          placeholder="Vegetariano, intolerância a lactose, etc."
        />
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm mb-1.5 font-medium" style={labelStyle}>
          Mensagem para os noivos
        </label>
        <textarea
          value={formData.message}
          onChange={(e) => update("message", e.target.value)}
          rows={3}
          className="w-full rounded-lg border px-4 py-3 text-sm outline-none transition-colors focus:ring-2 resize-y"
          style={inputStyle}
          placeholder="Deixe uma mensagem carinhosa..."
        />
      </div>

      {/* Error message */}
      {status === "error" && errorMessage && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">
          <AlertCircle size={16} />
          {errorMessage}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-lg px-6 py-3.5 text-sm font-medium text-white transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        style={{
          backgroundColor: "var(--wedding-primary)",
          fontFamily: "var(--wedding-font-body)",
        }}
      >
        {status === "submitting" ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Enviando...
          </>
        ) : (
          "Confirmar Presença"
        )}
      </button>
    </form>
  );
}
