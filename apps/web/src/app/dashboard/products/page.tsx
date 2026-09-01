"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Shell } from "@/components/shell";
import { api, aoa } from "@/lib/api";

export default function ProductsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [removingId, setRemovingId] = useState<string | null>(null);
  useEffect(() => {
    api("/products")
      .then(setRows)
      .catch(() => setRows([]));
  }, []);

  async function removeProduct(product: any) {
    if (!window.confirm(`Remover o produto "${product.name}"?`)) return;
    setRemovingId(product.id);
    try {
      await api(`/products/${product.id}`, { method: "DELETE" });
      setRows((current) => current.filter((row) => row.id !== product.id));
    } finally {
      setRemovingId(null);
    }
  }
  return (
    <Shell>
      <div className="flex items-center justify-between">
        <h1 className="serif text-4xl">Produtos</h1>
        <Link href="/dashboard/products/new" className="btn-primary">
          Novo produto
        </Link>
      </div>
      <div className="mt-8 overflow-x-auto card">
        <table className="w-full text-sm">
          <thead className="text-left text-ink/50">
            <tr>
              <th className="p-3">Nome</th>
              <th>Tipo</th>
              <th>Preço</th>
              <th>Estado</th>
              <th className="pr-3 text-right">Acções</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-t border-ink/5">
                <td className="p-3">{p.name}</td>
                <td>{p.type}</td>
                <td>{aoa(Number(p.price))}</td>
                <td>{p.status}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/s/${p.store?.slug}/products/${p.slug}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 transition hover:bg-ink/5"
                      aria-label={`Ver ${p.name}`}
                      title="Ver produto"
                    >
                      <Eye size={16} aria-hidden="true" />
                    </Link>
                    <Link
                      href={`/dashboard/products/new?edit=${p.id}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 transition hover:bg-ink/5"
                      aria-label={`Editar ${p.name}`}
                      title="Editar produto"
                    >
                      <Pencil size={16} aria-hidden="true" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeProduct(p)}
                      disabled={removingId === p.id}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 text-ink/70 transition hover:bg-ink/5 disabled:opacity-50"
                      aria-label={`Remover ${p.name}`}
                      title="Remover produto"
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
