"use client";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/clientes": "Clientes",
  "/admin/clientes/novo": "Novo Cliente",
  "/admin/sites": "Sites",
  "/admin/presentes": "Presentes",
  "/admin/config": "Configurações",
  "/admin/users": "Usuários",
  "/admin/profile": "Perfil",
};

function getTitleFromPath(pathname: string): string {
  // Exact match first
  if (pageTitles[pathname]) return pageTitles[pathname];

  // Pattern matches for dynamic routes
  if (/^\/admin\/clientes\/[^/]+$/.test(pathname)) return "Detalhe do Cliente";
  if (/^\/admin\/sites\/[^/]+$/.test(pathname)) return "Editor de Site";

  return "CIAN";
}

export function Topbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const title = getTitleFromPath(pathname);
  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "CA";

  return (
    <header className="h-16 border-b border-sand-200 bg-white flex items-center justify-between px-6">
      <h2 className="text-lg font-semibold text-sand-800" style={{ fontFamily: "var(--font-display)" }}>
        {title}
      </h2>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-cian-600 flex items-center justify-center text-white text-xs font-semibold">
            {initials}
          </div>
          <span className="text-sm text-sand-600 hidden sm:block">
            {session?.user?.name ?? "Admin"}
          </span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-sand-400 hover:text-sand-600 transition-colors p-1.5 rounded-lg hover:bg-sand-100"
          title="Sair"
        >
          <LogOut size={16} strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}
