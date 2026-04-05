"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, AlertCircle, Heart } from "lucide-react";

interface RsvpFormProps {
  slug: string;
}

export function RsvpForm({ slug }: RsvpFormProps) {
  const [formData, setFormData] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    attendance: "sim",
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
      <div className="text-center py-12 wedding-success-check">
        <div
          className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center"
          style={{
            backgroundColor: "var(--wedding-secondary)",
            border: "2px solid var(--wedding-primary)",
            boxShadow: `0 0 0 6px color-mix(in srgb, var(--wedding-primary) 10%, transparent)`,
          }}
        >
          <CheckCircle2
            size={36}
            style={{ color: "var(--wedding-primary)" }}
          />
        </div>
        <h3
          className="text-2xl sm:text-3xl mb-2"
          style={{
            fontFamily: "var(--wedding-font-heading)",
            color: "var(--wedding-primary)",
          }}
        >
          Obrigado!
        </h3>
        <p
          className="opacity-70 text-sm sm:text-base"
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
      {/* Decorative element */}
      <div className="flex items-center justify-center gap-3 pb-2">
        <div
          className="h-px w-12 sm:w-16"
          style={{
            background: "linear-gradient(to right, transparent, var(--wedding-accent))",
            opacity: 0.3,
          }}
        />
        <Heart
          size={10}
          style={{ color: "var(--wedding-accent)", opacity: 0.4 }}
          fill="currentColor"
        />
        <div
          className="h-px w-12 sm:w-16"
          style={{
            background: "linear-gradient(to left, transparent, var(--wedding-accent))",
            opacity: 0.3,
          }}
        />
      </div>

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
            { value: "sim", label: "Sim, estarei presente" },
            { value: "nao", label: "Infelizmente não poderei ir" },
            { value: "talvez", label: "Ainda não sei" },
          ].map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 cursor-pointer rounded-lg border-2 px-4 py-3 text-sm transition-all duration-200 flex-1 text-center justify-center"
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
                boxShadow:
                  formData.attendance === opt.value
                    ? "0 2px 8px color-mix(in srgb, var(--wedding-primary) 30%, transparent)"
                    : "none",
                transform:
                  formData.attendance === opt.value
                    ? "scale(1.02)"
                    : "scale(1)",
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
              {opt.value === "sim" ? "Sim" : opt.value === "nao" ? "Não" : "Talvez"}
            </label>
          ))}
        </div>
      </div>

      {/* Companions */}
      {formData.attendance !== "nao" && (
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
        className="w-full rounded-lg px-6 py-3.5 text-sm font-medium text-white transition-all duration-200 disabled:opacity-50 hover:shadow-lg flex items-center justify-center gap-2"
        style={{
          background: `linear-gradient(135deg, var(--wedding-primary), color-mix(in srgb, var(--wedding-primary) 80%, var(--wedding-accent)))`,
          fontFamily: "var(--wedding-font-body)",
          boxShadow: "0 2px 10px color-mix(in srgb, var(--wedding-primary) 25%, transparent)",
          letterSpacing: "0.04em",
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
