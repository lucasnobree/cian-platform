"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Save, Check } from "lucide-react";

interface Profile {
  id: string;
  username: string;
  name: string;
  email: string | null;
  role: string;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data: Profile) => {
        setProfile(data);
        setName(data.name);
        setEmail(data.email ?? "");
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });

    if (res.ok) {
      const data = await res.json();
      setProfile(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setLoading(false);
  }

  if (!profile || !session) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-sand-800 font-display">Meu Perfil</h1>
        <p className="text-sand-500 text-sm mt-1">Edite suas informações pessoais</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informações</CardTitle>
          <CardDescription>
            Logado como <span className="font-medium text-sand-600">@{profile.username}</span>
            {" · "}
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              profile.role === "owner"
                ? "bg-gold/10 text-gold"
                : "bg-cian-100 text-cian-700"
            }`}>
              {profile.role === "owner" ? "Proprietária" : "Equipe"}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-sand-600 mb-1.5">Usuário</label>
              <Input value={profile.username} disabled className="bg-sand-100 text-sand-400" />
              <p className="text-[11px] text-sand-400 mt-1">O nome de usuário não pode ser alterado</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-sand-600 mb-1.5">Nome</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-sand-600 mb-1.5">E-mail</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
              />
              <p className="text-[11px] text-sand-400 mt-1">Usado para notificações e recuperação de conta</p>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {saved ? (
                  <>
                    <Check size={16} className="mr-2" />
                    Salvo!
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    {loading ? "Salvando..." : "Salvar"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
