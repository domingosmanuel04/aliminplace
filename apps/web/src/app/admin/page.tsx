"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminShell, type AdminSection } from "@/components/admin-shell";
import { api, aoa } from "@/lib/api";

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "#7dd3a6",
  SUSPENDED: "#fbbf24",
  CLOSED: "#f87171",
  DRAFT: "#a78bfa",
};

export default function AdminPage() {
  const [section, setSection] = useState<AdminSection>("overview");
  const [data, setData] = useState<any>(null);
  const [tenants, setTenants] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    api("/admin/overview")
      .then(setData)
      .catch((e) => setErr(e.message));
    api("/admin/tenants")
      .then(setTenants)
      .catch(() => undefined);
    api("/admin/users")
      .then(setUsers)
      .catch(() => undefined);
    api("/admin/logs")
      .then(setLogs)
      .catch(() => undefined);
  }, []);

  async function suspend(id: string) {
    if (!id) return;
    await api(`/admin/tenants/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "SUSPENDED" }),
    });
    setTenants(await api("/admin/tenants"));
  }

  const metrics = useMemo(() => {
    const base = data || {};
    return [
      {
        label: "GMV",
        value: aoa(base.gmv ?? 0),
        note: "+18.4% vs. mês passado",
        tone: "amber",
      },
      {
        label: "Receita plataforma",
        value: aoa(base.platformRevenue ?? 0),
        note: "Taxas e comissões",
        tone: "green",
      },
      {
        label: "Utilizadores",
        value: Number(base.users ?? 0).toLocaleString("pt-AO"),
        note: "Contas activas",
        tone: "blue",
      },
      {
        label: "Tenants",
        value: Number(base.tenants ?? 0).toLocaleString("pt-AO"),
        note: "Lojas registradas",
        tone: "violet",
      },
      {
        label: "Pedidos",
        value: Number(base.orders ?? 0).toLocaleString("pt-AO"),
        note: "Processados",
        tone: "rose",
      },
      {
        label: "Saques pendentes",
        value: Number(base.pendingPayouts ?? 0).toLocaleString("pt-AO"),
        note: "Aprovação urgente",
        tone: "gold",
      },
    ];
  }, [data]);

  const channelData = useMemo(() => {
    const base = data || {};
    return [
      {
        name: "Jan",
        revenue: Math.max(200000, (base.gmv ?? 0) * 0.5),
        orders: Math.max(40, (base.orders ?? 0) * 0.8),
      },
      {
        name: "Fev",
        revenue: Math.max(210000, (base.gmv ?? 0) * 0.6),
        orders: Math.max(48, (base.orders ?? 0) * 0.9),
      },
      {
        name: "Mar",
        revenue: Math.max(240000, (base.gmv ?? 0) * 0.7),
        orders: Math.max(54, (base.orders ?? 0) * 1.0),
      },
      {
        name: "Abr",
        revenue: Math.max(300000, (base.gmv ?? 0) * 0.82),
        orders: Math.max(62, (base.orders ?? 0) * 1.1),
      },
      {
        name: "Mai",
        revenue: Math.max(350000, (base.gmv ?? 0) * 0.9),
        orders: Math.max(68, (base.orders ?? 0) * 1.2),
      },
      {
        name: "Jun",
        revenue: Math.max(420000, (base.gmv ?? 0) * 1.0),
        orders: Math.max(76, (base.orders ?? 0) * 1.3),
      },
    ];
  }, [data]);

  const statusData = useMemo(() => {
    const counts = { ACTIVE: 0, SUSPENDED: 0, CLOSED: 0, DRAFT: 0 };
    tenants.forEach((tenant) => {
      const status = tenant.status ?? "ACTIVE";
      counts[status] = (counts[status] || 0) + 1;
    });
    return Object.entries(counts)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [tenants]);

  const topTenants = useMemo(
    () =>
      [...tenants]
        .sort((a, b) => (b.stores?.length ?? 0) - (a.stores?.length ?? 0))
        .slice(0, 5)
        .map((tenant) => ({
          id: tenant.id,
          name: tenant.name,
          plan: tenant.plan ?? "PRO",
          status: tenant.status ?? "ACTIVE",
          stores: tenant.stores?.length ?? 0,
        })),
    [tenants],
  );

  const recentActivity = useMemo(
    () =>
      logs.slice(0, 5).map((log) => ({
        action: log.action ?? "activity",
        actor: log.user?.name ?? "Sistema",
        date: new Date(log.createdAt ?? Date.now()).toLocaleString("pt-AO", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
      })),
    [logs],
  );

  const renderContent = () => {
    if (!data) {
      return (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
          Carregando painel administrativo...
        </div>
      );
    }

    switch (section) {
      case "tenants":
        return (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Gestão
                  </p>
                  <h2 className="serif mt-1 text-2xl">Tenants</h2>
                </div>
              </div>
              <div className="space-y-3">
                {tenants.map((tenant) => (
                  <div
                    key={tenant.id}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="font-medium text-slate-800">
                        {tenant.name}
                      </div>
                      <div className="text-sm text-slate-500">
                        {tenant.plan ?? "PRO"} · {tenant.status ?? "ACTIVE"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {tenant.stores?.length ?? 0} lojas
                      </span>
                      <button
                        className="btn-gold px-3 py-2 text-xs"
                        onClick={() => suspend(tenant.id)}
                      >
                        Suspender
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case "users":
        return (
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Contas
              </p>
              <h2 className="serif mt-1 text-2xl">Utilizadores</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-slate-500">
                  <tr>
                    <th className="pb-3">Nome</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Perfil</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-t border-slate-200">
                      <td className="py-3 font-medium text-slate-800">
                        {user.name}
                      </td>
                      <td className="py-3 text-slate-600">{user.email}</td>
                      <td className="py-3">
                        <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 text-slate-500">
                        {user.isSuperAdmin ? "Super admin" : "Utilizador"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case "payouts":
        return (
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Financeiro
              </p>
              <h2 className="serif mt-1 text-2xl">Saques e pagamentos</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Pendentes</p>
                <p className="serif mt-2 text-3xl">{data.pendingPayouts}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">GMV</p>
                <p className="serif mt-2 text-3xl">{aoa(data.gmv ?? 0)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Receita</p>
                <p className="serif mt-2 text-3xl">
                  {aoa(data.platformRevenue ?? 0)}
                </p>
              </div>
            </div>
          </div>
        );
      case "fees":
        return (
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Economia
              </p>
              <h2 className="serif mt-1 text-2xl">Taxas da plataforma</h2>
            </div>
            <div className="space-y-3">
              {[
                { label: "Starter", value: "5.5%" },
                { label: "Pro", value: "3.9%" },
                { label: "Business", value: "2.5%" },
                { label: "Enterprise", value: "1.5%" },
              ].map((fee) => (
                <div
                  key={fee.label}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
                >
                  <span className="text-slate-700">{fee.label}</span>
                  <strong className="text-slate-900">{fee.value}</strong>
                </div>
              ))}
            </div>
          </div>
        );
      case "reports":
        return (
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Operações
              </p>
              <h2 className="serif mt-1 text-2xl">Reports em aberto</h2>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              {data.reports ?? 0} reportes ativos aguardando revisão de
              segurança e compliance.
            </div>
          </div>
        );
      case "logs":
        return (
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Segurança
              </p>
              <h2 className="serif mt-1 text-2xl">Log do sistema</h2>
            </div>
            <div className="space-y-3">
              {recentActivity.map((item, index) => (
                <div
                  key={`${item.action}-${index}`}
                  className="rounded-2xl bg-slate-50 px-3 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-slate-800">
                      {item.action}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {item.date}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    Por {item.actor}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "overview":
      default:
        return (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {metrics.map((metric) => (
                <article
                  key={metric.label}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                      {metric.label}
                    </span>
                    <span
                      className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                        metric.tone === "amber"
                          ? "bg-amber-100 text-amber-800"
                          : metric.tone === "green"
                            ? "bg-emerald-100 text-emerald-800"
                            : metric.tone === "blue"
                              ? "bg-sky-100 text-sky-800"
                              : metric.tone === "violet"
                                ? "bg-violet-100 text-violet-800"
                                : metric.tone === "rose"
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      Live
                    </span>
                  </div>
                  <div className="serif text-3xl font-semibold text-slate-900">
                    {metric.value}
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{metric.note}</p>
                </article>
              ))}
            </section>

            <section className="mt-8 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      Performance
                    </p>
                    <h2 className="serif mt-1 text-2xl">
                      Evolução de receitas
                    </h2>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                    +24.8% no trimestre
                  </span>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={channelData}>
                      <defs>
                        <linearGradient
                          id="revenue"
                          x1="0"
                          x2="0"
                          y1="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#c4a574"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#c4a574"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} />
                      <Tooltip formatter={(value: number) => aoa(value)} />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#c4a574"
                        fill="url(#revenue)"
                        strokeWidth={3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Distribuição
                </p>
                <h2 className="serif mt-1 text-2xl">Status dos tenants</h2>
                <div className="mt-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={55}
                        outerRadius={82}
                        paddingAngle={3}
                      >
                        {statusData.map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={STATUS_COLORS[entry.name] ?? "#c4a574"}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 space-y-2 text-sm text-slate-600">
                  {statusData.map((slice) => (
                    <div
                      key={slice.name}
                      className="flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full"
                          style={{
                            background: STATUS_COLORS[slice.name] ?? "#c4a574",
                          }}
                        />
                        {slice.name}
                      </span>
                      <strong>{slice.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      Atividade
                    </p>
                    <h2 className="serif mt-1 text-2xl">Pedidos por mês</h2>
                  </div>
                  <span className="text-sm text-slate-500">
                    Últimos 6 meses
                  </span>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={channelData}>
                      <CartesianGrid stroke="#e5e7eb" vertical={false} />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} />
                      <Tooltip
                        formatter={(value: number) => `${value} pedidos`}
                      />
                      <Bar
                        dataKey="orders"
                        radius={[8, 8, 0, 0]}
                        fill="#111827"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Resumo
                </p>
                <h2 className="serif mt-1 text-2xl">Ações rápidas</h2>
                <div className="mt-5 space-y-3">
                  {[
                    {
                      label: "Produtos em revisão",
                      value: String(data.products ?? 0),
                    },
                    {
                      label: "Tickets abertos",
                      value: String(data.openTickets ?? 0),
                    },
                    {
                      label: "Relatórios pendentes",
                      value: String(data.reports ?? 0),
                    },
                    {
                      label: "Vendedores ativos",
                      value: String(data.sellers ?? 0),
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
                    >
                      <span className="text-sm text-slate-600">
                        {item.label}
                      </span>
                      <strong className="text-lg text-slate-900">
                        {item.value}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      Tenants
                    </p>
                    <h2 className="serif mt-1 text-2xl">Lojas em operação</h2>
                  </div>
                </div>
                <div className="space-y-3">
                  {topTenants.map((tenant) => (
                    <div
                      key={tenant.id ?? tenant.name}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3"
                    >
                      <div>
                        <div className="font-medium text-slate-800">
                          {tenant.name}
                        </div>
                        <div className="text-sm text-slate-500">
                          {tenant.plan} · {tenant.stores} lojas
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                          {tenant.status}
                        </span>
                        <button
                          className="btn-ghost px-3 py-2 text-xs"
                          onClick={() => suspend(tenant.id ?? "")}
                        >
                          Suspender
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Actividade recente
                </p>
                <h2 className="serif mt-1 text-2xl">Log do sistema</h2>
                <div className="mt-4 space-y-3">
                  {recentActivity.length ? (
                    recentActivity.map((item, index) => (
                      <div
                        key={`${item.action}-${index}`}
                        className="rounded-2xl bg-slate-50 px-3 py-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-medium text-slate-800">
                            {item.action}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {item.date}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-slate-600">
                          Por {item.actor}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl bg-slate-50 px-3 py-3 text-sm text-slate-500">
                      Nenhuma atividade recente disponível.
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Contas
                  </p>
                  <h2 className="serif mt-1 text-2xl">Últimos utilizadores</h2>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-slate-500">
                    <tr>
                      <th className="pb-3">Nome</th>
                      <th className="pb-3">Email</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Tipo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.slice(0, 6).map((user) => (
                      <tr key={user.id} className="border-t border-slate-200">
                        <td className="py-3 font-medium text-slate-800">
                          {user.name}
                        </td>
                        <td className="py-3 text-slate-600">{user.email}</td>
                        <td className="py-3">
                          <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">
                            {user.status}
                          </span>
                        </td>
                        <td className="py-3 text-slate-500">
                          {user.isSuperAdmin ? "Super admin" : "Utilizador"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        );
    }
  };

  return (
    <AdminShell active={section} onChange={setSection}>
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Admin
          </p>
          <h1 className="serif mt-2 text-3xl sm:text-4xl">
            Painel do Super Admin
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600">
            {new Date().toLocaleDateString("pt-AO", { dateStyle: "medium" })}
          </div>
          <button className="btn-gold">Exportar relatório</button>
        </div>
      </div>

      {err && (
        <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {err} — use a conta de super admin emma.t@example.net.
        </div>
      )}

      {renderContent()}
    </AdminShell>
  );
}
