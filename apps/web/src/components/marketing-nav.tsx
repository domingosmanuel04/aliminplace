"use client";

import Link from "next/link";
import Image from "next/image";
import { LogIn, Menu, UserPlus, X } from "lucide-react";
import { useState } from "react";

export function MarketingNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-30 border-b border-ink/5 bg-cream/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6 sm:py-4 md:grid md:grid-cols-[1fr_auto_1fr] md:gap-6">
          <Link href="/" aria-label="Trauner" className="flex items-center">
            <Image
              src="/logo.png"
              alt="Trauner"
              width={168}
              height={48}
              className="h-8 w-auto object-contain sm:h-10"
              priority
            />
          </Link>
          <div className="order-2 ml-auto flex items-center md:order-3 md:ml-0 md:justify-self-end">
            <div className="mr-3 hidden items-center gap-3 md:flex">
              <Link href="/login" className="btn-ghost px-3 sm:px-5">
                <LogIn size={16} aria-hidden="true" />
                Entrar
              </Link>
              <Link href="/register" className="btn-primary px-3 sm:px-5">
                <UserPlus size={16} aria-hidden="true" />
                Começar gratuitamente
              </Link>
            </div>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 md:hidden"
              aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={isMenuOpen}
              aria-controls="main-navigation"
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
            id="main-navigation"
            aria-label="Navegação principal"
            className={`${isMenuOpen ? "flex" : "hidden"} order-3 w-full flex-col items-center gap-4 border-t border-ink/5 pt-3 text-sm md:order-2 md:flex md:w-auto md:flex-row md:gap-8 md:border-0 md:pt-0 md:justify-self-center`}
          >
            <Link href="/marketplace">Produtos</Link>
            <a href="#como-funciona">Como funciona</a>
            <a href="#afiliados">Afiliados</a>
            <Link href="/pricing">Planos</Link>
            <div className="flex w-full flex-col gap-2 border-t border-ink/5 pt-4 md:hidden">
              <Link href="/login" className="btn-ghost w-full px-3 sm:px-5">
                <LogIn size={16} aria-hidden="true" />
                Entrar
              </Link>
              <Link
                href="/register"
                className="btn-primary w-full px-3 sm:px-5"
              >
                <UserPlus size={16} aria-hidden="true" />
                Começar
              </Link>
            </div>
          </nav>
        </div>
      </header>
      <div aria-hidden="true" className="h-14 sm:h-[72px]" />
    </>
  );
}
