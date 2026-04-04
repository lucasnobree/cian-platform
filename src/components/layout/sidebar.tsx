"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Globe, Gift, Settings, X, Menu, UserCog, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/sites", label: "Sites", icon: Globe },
  { href: "/admin/presentes", label: "Presentes", icon: Gift },
  { href: "/admin/config", label: "Configurações", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const role = (session?.user as unknown as { role?: string })?.role;

  const allNavItems = [
    ...navItems,
    ...(role === "owner" ? [{ href: "/admin/users", label: "Usuários", icon: UserCog }] : []),
  ];

  const nav = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 pb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-wider text-cian-400" style={{ fontFamily: "var(--font-display)" }}>
              CIAN
            </h1>
            <p className="text-[10px] tracking-[0.3em] text-cian-600/60 uppercase mt-0.5">art studio</p>
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden text-cian-400/60 hover:text-cian-400">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {allNavItems.map((item) => {
          const isActive = item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                isActive
                  ? "bg-cian-600/20 text-cian-400 font-medium"
                  : "text-cian-100/50 hover:bg-cian-600/10 hover:text-cian-300"
              )}
            >
              <item.icon size={18} strokeWidth={1.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-cian-800/30">
        <Link
          href="/admin/profile"
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-cian-100/50 hover:bg-cian-600/10 hover:text-cian-300 transition-all duration-200"
        >
          <UserCircle size={18} strokeWidth={1.5} />
          <span className="truncate">{session?.user?.name ?? "Perfil"}</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-coral/70 hover:bg-coral/10 hover:text-coral transition-all duration-200 mt-1"
        >
          <X size={18} strokeWidth={1.5} />
          Sair
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-cian-950 text-cian-400 p-2 rounded-lg shadow-lg"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar mobile */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-cian-950 z-50 transform transition-transform duration-300 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {nav}
      </aside>

      {/* Sidebar desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 bg-cian-950">
        {nav}
      </aside>
    </>
  );
}
