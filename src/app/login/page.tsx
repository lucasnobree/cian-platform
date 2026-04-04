"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Usuário ou senha inválidos");
      setLoading(false);
    } else {
      router.push("/admin");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cian-800 via-cian-900 to-cian-950 relative overflow-hidden">
      {/* Wave decoration */}
      <svg className="absolute bottom-0 left-0 right-0 w-full opacity-10" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <path fill="#14B8A6" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,218.7C672,235,768,245,864,234.7C960,224,1056,192,1152,176C1248,160,1344,160,1392,160L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
      </svg>
      <svg className="absolute bottom-0 left-0 right-0 w-full opacity-5" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <path fill="#5EEAD4" d="M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,229.3C672,245,768,267,864,261.3C960,256,1056,224,1152,208C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
      </svg>

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-wider text-cian-300" style={{ fontFamily: "var(--font-display)" }}>
              CIAN
            </h1>
            <p className="text-[11px] tracking-[0.35em] text-cian-400/50 uppercase mt-1">art studio</p>
            <p className="text-sm text-white/40 mt-4">Acesse a plataforma de gestão</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Usuário</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="seu.usuario"
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-cian-400 focus:ring-cian-400/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Senha</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-cian-400 focus:ring-cian-400/20"
              />
            </div>

            {error && (
              <p className="text-coral text-xs text-center">{error}</p>
            )}

            <Button type="submit" className="w-full h-11 mt-2" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-cian-600/30 mt-6">CIAN Platform · v1.0</p>
      </div>
    </div>
  );
}
