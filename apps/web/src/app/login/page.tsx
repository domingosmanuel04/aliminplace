"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { api, setTenant } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("emma.t@example.net");
  const [password, setPassword] = useState("Admin@123!");
  const [error, setError] = useState("");
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const data = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      if (data.user?.isSuperAdmin) {
        localStorage.removeItem("tenantId");
        window.location.href = "/admin";
        return;
      }
      if (data.memberships?.[0]?.tenantId)
        setTenant(data.memberships[0].tenantId);
      if (data.memberships?.length) window.location.href = "/dashboard";
      else window.location.href = "/onboarding";
    } catch (err: any) {
      setError(err.message);
    }
  }
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <Link href="/" aria-label="Trauner" className="mb-8 flex items-center">
        <Image
          src="/logo.png"
          alt="Trauner"
          width={200}
          height={58}
          className="h-12 w-auto object-contain"
          priority
        />
      </Link>
      <h1 className="serif text-4xl">Entrar</h1>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label className="label">Email</label>
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Palavra-passe</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-clay">{error}</p>}
        <button className="btn-primary w-full" type="submit">
          Continuar
        </button>
      </form>
      <p className="mt-6 text-sm text-ink/60">
        Sem conta?{" "}
        <Link href="/register" className="underline">
          Criar
        </Link>
      </p>
    </main>
  );
}
