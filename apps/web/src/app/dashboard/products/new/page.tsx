"use client";
import { useEffect, useState } from "react";
import { Shell } from "@/components/shell";
import { api } from "@/lib/api";

export default function NewProductPage() {
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    type: "PHYSICAL",
    price: 10000,
    shortDescription: "",
    description: "",
    imageUrl: "",
  });
  const [msg, setMsg] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("edit");
    if (!id) return;
    setEditId(id);
    api("/products")
      .then((products: any[]) => {
        const product = products.find((item) => item.id === id);
        if (!product) return;
        const imageUrl = product.media?.[0]?.url || "";
        setForm({
          name: product.name || "",
          type: product.type || "PHYSICAL",
          price: Number(product.price) || 0,
          shortDescription: product.shortDescription || "",
          description: product.description || "",
          imageUrl,
        });
        setPreview(imageUrl || null);
      })
      .catch(() => setMsg("Não foi possível carregar o produto."));
  }, []);

  async function onFileChange(file?: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const value = typeof reader.result === "string" ? reader.result : "";
      setPreview(value);
      setForm((current) => ({ ...current, imageUrl: value }));
    };
    reader.readAsDataURL(file);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const p = await api(editId ? `/products/${editId}` : "/products", {
      method: editId ? "PATCH" : "POST",
      body: JSON.stringify({
        ...form,
        price: Number(form.price),
        status: "PUBLISHED",
      }),
    });
    setMsg(editId ? `Actualizado: ${p.name}` : `Publicado: ${p.name}`);
  }

  return (
    <Shell>
      <h1 className="serif text-4xl">
        {editId ? "Editar produto" : "Novo produto"}
      </h1>
      <form onSubmit={onSubmit} className="card mt-8 max-w-xl space-y-4 p-6">
        <div>
          <label className="label">Nome</label>
          <input
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label">Tipo</label>
          <select
            className="input"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            {[
              "COURSE",
              "EBOOK",
              "FILE",
              "VIDEO",
              "PHYSICAL",
              "SUBSCRIPTION",
              "SERVICE",
              "SOFTWARE",
            ].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Preço (Kz)</label>
          <input
            className="input"
            type="number"
            value={form.price}
            onChange={(e) =>
              setForm({ ...form, price: Number(e.target.value) })
            }
          />
        </div>

        <div>
          <label className="label">Imagem do produto</label>
          <input
            className="input file:mr-4 file:rounded-full file:border-0 file:bg-forest file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
            type="file"
            accept="image/*"
            onChange={(e) => onFileChange(e.target.files?.[0])}
          />
        </div>

        {preview && (
          <div className="overflow-hidden rounded-xl border border-ink/10 bg-ink/5">
            <img
              src={preview}
              alt="Pré-visualização do produto"
              className="h-52 w-full object-cover"
            />
          </div>
        )}

        <div>
          <label className="label">Descrição curta</label>
          <input
            className="input"
            value={form.shortDescription}
            onChange={(e) =>
              setForm({ ...form, shortDescription: e.target.value })
            }
          />
        </div>
        <div>
          <label className="label">Descrição</label>
          <textarea
            className="input"
            rows={5}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <button className="btn-primary" type="submit">
          {editId ? "Guardar alterações" : "Publicar"}
        </button>
        {msg && <p className="text-sm text-forest">{msg}</p>}
      </form>
    </Shell>
  );
}
