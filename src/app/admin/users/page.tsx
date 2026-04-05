"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Shield, User, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";

interface UserItem {
  id: string;
  username: string;
  name: string;
  email: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const role = session?.user?.role;

  const [users, setUsers] = useState<UserItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: "", name: "", password: "", email: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (role && role !== "owner") {
      router.push("/admin");
      return;
    }
    fetchUsers();
  }, [role, router]);

  async function fetchUsers() {
    const res = await fetch("/api/users");
    if (res.ok) setUsers(await res.json());
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setForm({ username: "", name: "", password: "", email: "" });
      setShowForm(false);
      fetchUsers();
    } else {
      const data = await res.json();
      setError(typeof data.error === "string" ? data.error : "Erro ao criar usuário");
    }
    setLoading(false);
  }

  async function toggleActive(user: UserItem) {
    await fetch(`/api/users/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !user.isActive }),
    });
    fetchUsers();
  }

  async function handleDelete(user: UserItem) {
    if (!confirm(`Excluir usuário "${user.name}"?`)) return;
    await fetch(`/api/users/${user.id}`, { method: "DELETE" });
    fetchUsers();
  }

  if (role !== "owner") return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-sand-800 font-display">Usuários</h1>
          <p className="text-sand-500 text-sm mt-1">Gerencie os acessos à plataforma</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <UserPlus size={16} className="mr-2" />
          Novo Usuário
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Criar Novo Usuário</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-sand-600 mb-1.5">Usuário *</label>
                <Input
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="nome.usuario"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-sand-600 mb-1.5">Nome *</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nome completo"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-sand-600 mb-1.5">Senha *</label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-sand-600 mb-1.5">E-mail (opcional)</label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>
              {error && <p className="text-coral text-sm col-span-full">{error}</p>}
              <div className="col-span-full flex gap-3 justify-end">
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Criando..." : "Criar Usuário"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* User list */}
      <div className="space-y-3">
        {users.map((user) => (
          <Card key={user.id} className={!user.isActive ? "opacity-50" : ""}>
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-cian-100 flex items-center justify-center">
                  {user.role === "owner" ? (
                    <Shield size={18} className="text-cian-700" />
                  ) : (
                    <User size={18} className="text-cian-600" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sand-800">{user.name}</span>
                    <span className="text-xs text-sand-400">@{user.username}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      user.role === "owner"
                        ? "bg-gold/10 text-gold"
                        : "bg-cian-100 text-cian-700"
                    }`}>
                      {user.role === "owner" ? "Proprietária" : "Equipe"}
                    </span>
                  </div>
                  <p className="text-xs text-sand-400 mt-0.5">
                    {user.email || "Sem e-mail"} · Desde {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>

              {user.role !== "owner" && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleActive(user)}
                    className="p-2 rounded-lg hover:bg-sand-100 transition-colors"
                    title={user.isActive ? "Desativar" : "Ativar"}
                  >
                    {user.isActive ? (
                      <ToggleRight size={20} className="text-cian-600" />
                    ) : (
                      <ToggleLeft size={20} className="text-sand-400" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(user)}
                    className="p-2 rounded-lg hover:bg-coral/10 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={16} className="text-coral/60" />
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
