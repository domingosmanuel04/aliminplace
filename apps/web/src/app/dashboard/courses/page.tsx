"use client";
import { useEffect, useState } from "react";
import { Shell } from "@/components/shell";
import { api } from "@/lib/api";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function Page() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    api("/products").then((p) =>
      setRows(p.filter((x: any) => x.type === "COURSE")),
    );
  }, []);
  return (
    <Shell>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest/60">
            Área do produtor
          </p>
          <h1 className="serif mt-1 text-4xl text-forest">Cursos</h1>
        </div>
        <Link href="/dashboard/courses/new" className="btn-primary">
          <Plus size={17} aria-hidden="true" /> Novo curso
        </Link>
      </div>
      <ul className="mt-6 space-y-3">
        {rows.map((c) => (
          <li key={c.id} className="card p-5">
            {c.name}
          </li>
        ))}
      </ul>
    </Shell>
  );
}
