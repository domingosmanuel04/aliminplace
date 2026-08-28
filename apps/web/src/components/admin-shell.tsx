"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  BarChart3,
  Building2,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { api } from "@/lib/api";

export type AdminSection =
  | "overview"
  | "tenants"
  | "users"
  | "payouts"
  | "fees"
  | "logs"
  | "reports";

const navItems: Array<{ id: AdminSection; label: string; icon: any }> = [
  { id: "overview", label: "Visão geral", icon: LayoutDashboard },
  { id: "tenants", label: "Tenants", icon: Building2 },
  { id: "users", label: "Utilizadores", icon: Users },
  { id: "payouts", label: "Saques", icon: CreditCard },
  { id: "fees", label: "Taxas", icon: BarChart3 },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "logs", label: "Logs", icon: ShieldCheck },
];

export function AdminShell({
  active,
  onChange,
  children,
}: {
  active: AdminSection;
  onChange: (section: AdminSection) => void;
  children: React.ReactNode;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  async function logout() {
    await api("/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <div className="min-h-screen md:grid md:grid-cols-[260px_1fr]">
      <aside className="border-b border-slate-200 bg-slate-950 text-white md:min-h-screen md:border-b-0 md:border-r md:border-white/10">
        <div className="flex items-center justify-between px-4 py-4 sm:px-5">
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-xl bg-white/5 px-2.5 py-2"
          >
            <Image
              src="/logo.png"
              alt="Trauner"
              width={160}
              height={44}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 md:hidden"
            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((value) => !value)}
          >
            {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <div className="px-4 pb-4 pt-2 text-sm text-slate-300">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-[#d4b06d]">
              Plataforma
            </p>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d4b06d] text-sm font-semibold text-slate-900">
                SA
              </div>
              <div>
                <div className="font-medium text-white">Super Admin</div>
                <div className="text-xs text-slate-400">Operação global</div>
              </div>
            </div>
          </div>
        </div>

        <nav
          className={`${isMenuOpen ? "flex" : "hidden"} flex-col gap-1 px-3 pb-3 md:flex`}
        >
          {navItems.map(({ id, label, icon: Icon }) => {
            const selected = active === id;

            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  onChange(id);
                  setIsMenuOpen(false);
                }}
                className={`flex items-center justify-between rounded-xl px-3 py-3 text-left text-sm transition ${
                  selected
                    ? "bg-[#d4b06d] text-slate-900 shadow-sm"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon size={16} />
                  {label}
                </span>
              </button>
            );
          })}

          <div className="mt-3 border-t border-white/10 pt-3">
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              <LogOut size={16} />
              Sair
            </button>
          </div>
        </nav>
      </aside>

      <div className="min-w-0 bg-[#f7f3ee] text-slate-900">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
