"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { api } from "@/lib/api";
import { useState } from "react";

const links = [
  ["/dashboard", "Visão geral"],
  ["/dashboard/products", "Produtos"],
  ["/dashboard/orders", "Pedidos"],
  ["/dashboard/customers", "Clientes"],
  ["/dashboard/checkouts", "Checkouts"],
  ["/dashboard/store", "Loja"],
  ["/dashboard/courses", "Cursos"],
  ["/dashboard/affiliates", "Afiliados"],
  ["/dashboard/coupons", "Cupões"],
  ["/dashboard/finance", "Financeiro"],
  ["/dashboard/analytics", "Analytics"],
  ["/dashboard/ai", "IA"],
  ["/dashboard/team", "Equipa"],
  ["/dashboard/settings", "Definições"],
];

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  async function logout() {
    await api("/auth/logout", { method: "POST" });
    localStorage.removeItem("accessToken");
    window.location.href = "/";
  }
  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <aside className="border-b border-[#E5E7EB] bg-[#1E1E1E] text-white md:min-h-screen md:border-b-0 md:border-r md:border-white/10">
        <div className="flex items-center justify-between px-4 py-4 sm:px-5 sm:py-5">
          <Link
            href="/dashboard"
            aria-label="Aluniplace"
            className="flex items-center rounded-lg bg-white px-2 py-1"
          >
            <Image
              src="/logo.png"
              alt="Aluniplace"
              width={168}
              height={48}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 md:hidden"
            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? (
              <X size={18} aria-hidden="true" />
            ) : (
              <Menu size={18} aria-hidden="true" />
            )}
          </button>
        </div>
        <nav
          className={`${isMenuOpen ? "flex" : "hidden"} flex-col gap-1 px-3 pb-3 md:flex`}
        >
          {links.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setIsMenuOpen(false)}
              className={`rounded-xl px-3 py-3 text-sm transition ${path === href ? "bg-[#E31D1D] text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/members"
            onClick={() => setIsMenuOpen(false)}
            className="rounded-xl px-3 py-3 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            Área de membros
          </Link>
          <button
            onClick={logout}
            className="rounded-xl px-3 py-3 text-left text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            Sair
          </button>
        </nav>
      </aside>
      <div className="min-w-0 p-4 sm:p-6 md:p-10">{children}</div>
    </div>
  );
}
