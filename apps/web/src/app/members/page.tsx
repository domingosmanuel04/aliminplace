"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Search,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";

type Enrollment = {
  id: string;
  courseId: string;
  progress?: number;
  lastLesson?: string | null;
  course?: {
    product?: {
      name?: string;
      shortDescription?: string;
      media?: { url: string; alt?: string | null }[];
    };
    modules?: { lessons?: unknown[] }[];
  };
};

function courseName(enrollment: Enrollment) {
  return enrollment.course?.product?.name || "Curso sem título";
}

function courseImage(enrollment: Enrollment) {
  return enrollment.course?.product?.media?.[0];
}

export default function MembersPage() {
  const [rows, setRows] = useState<Enrollment[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    api<Enrollment[]>("/members/enrollments")
      .then(setRows)
      .catch(() => {
        setRows([]);
        setHasError(true);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filteredRows = rows.filter((enrollment) =>
    courseName(enrollment).toLowerCase().includes(query.toLowerCase()),
  );
  const activeCourse =
    rows.find(
      (enrollment) =>
        Number(enrollment.progress) > 0 && Number(enrollment.progress) < 100,
    ) || rows[0];
  const completedCount = rows.filter(
    (enrollment) => Number(enrollment.progress) >= 100,
  ).length;
  const averageProgress = rows.length
    ? rows.reduce(
        (total, enrollment) => total + Number(enrollment.progress || 0),
        0,
      ) / rows.length
    : 0;
  const totalLessons = rows.reduce(
    (total, enrollment) =>
      total +
      (enrollment.course?.modules || []).reduce(
        (moduleTotal, module) => moduleTotal + (module.lessons?.length || 0),
        0,
      ),
    0,
  );

  return (
    <main className="min-h-screen bg-[#f6f1e8]">
      <header className="border-b border-ink/10 bg-cream/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <Link
            href="/"
            className="serif text-2xl font-semibold tracking-tight text-forest"
          >
            Aluniplace
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/marketplace"
              className="hidden rounded-full px-4 py-2 text-ink/65 transition hover:bg-ink/5 sm:inline-flex"
            >
              Explorar cursos
            </Link>
            <Link
              href="/"
              className="rounded-full border border-ink/15 px-4 py-2 font-medium text-ink transition hover:bg-white"
            >
              Sair
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <section className="relative overflow-hidden rounded-[1.75rem] bg-forest px-6 py-8 text-cream shadow-card sm:px-10 sm:py-10">
          <div className="relative z-10 max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-gold">
              <Sparkles size={14} aria-hidden="true" />
              Espaço do aluno
            </div>
            <h1 className="serif max-w-xl text-4xl leading-tight sm:text-5xl">
              Aprenda no seu ritmo.
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-cream/70 sm:text-base">
              Continue de onde parou ou encontre o próximo curso para
              transformar curiosidade em prática.
            </p>
            <Link href="/marketplace" className="btn-gold mt-7">
              Explorar cursos <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <div
            className="absolute -right-16 -top-20 h-64 w-64 rounded-full border border-gold/20"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-32 right-20 h-64 w-64 rounded-full border border-cream/10"
            aria-hidden="true"
          />
        </section>

        <section className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            { label: "Cursos adquiridos", value: rows.length, icon: BookOpen },
            {
              label: "Progresso médio",
              value: `${averageProgress.toFixed(0)}%`,
              icon: Clock3,
            },
            {
              label: "Cursos concluídos",
              value: completedCount,
              icon: CheckCircle2,
            },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="flex items-center gap-4 rounded-2xl border border-ink/10 bg-white/65 p-5"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/20 text-forest">
                <Icon size={19} aria-hidden="true" />
              </span>
              <div>
                <p className="text-2xl font-semibold leading-none text-forest">
                  {value}
                </p>
                <p className="mt-1 text-xs uppercase tracking-wider text-ink/45">
                  {label}
                </p>
              </div>
            </div>
          ))}
        </section>

        {isLoading ? (
          <section
            className="mt-12 space-y-4"
            aria-label="A carregar os seus cursos"
          >
            <div className="h-8 w-56 animate-pulse rounded-lg bg-ink/10" />
            <div className="grid gap-5 md:grid-cols-2">
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="h-64 animate-pulse rounded-2xl bg-white/60"
                />
              ))}
            </div>
          </section>
        ) : hasError ? (
          <section className="mt-12 rounded-2xl border border-red-900/10 bg-red-900/5 p-6">
            <h2 className="serif text-2xl text-forest">
              Não foi possível carregar os seus cursos.
            </h2>
            <p className="mt-2 text-sm text-ink/60">
              Atualize a página ou tente novamente mais tarde.
            </p>
          </section>
        ) : !rows.length ? (
          <section className="mt-12 rounded-2xl border border-dashed border-ink/20 bg-white/45 px-6 py-12 text-center">
            <BookOpen
              className="mx-auto text-forest/60"
              size={32}
              aria-hidden="true"
            />
            <h2 className="serif mt-4 text-3xl text-forest">
              A sua jornada começa aqui.
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink/60">
              Explore o catálogo e escolha um curso para começar a aprender.
            </p>
            <Link href="/marketplace" className="btn-primary mt-6">
              Ver marketplace <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </section>
        ) : (
          <>
            {activeCourse && (
              <section className="mt-12">
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest/60">
                      O seu próximo passo
                    </p>
                    <h2 className="serif mt-1 text-3xl text-forest sm:text-4xl">
                      Continuar a estudar
                    </h2>
                  </div>
                  <span className="hidden text-sm text-ink/45 sm:block">
                    {totalLessons} aulas no total
                  </span>
                </div>
                <Link
                  href={`/members/courses/${activeCourse.courseId}`}
                  className="group grid overflow-hidden rounded-2xl border border-ink/10 bg-white/80 shadow-card transition hover:-translate-y-0.5 hover:shadow-lg md:grid-cols-[220px_1fr]"
                >
                  <div className="relative min-h-48 overflow-hidden bg-forest/10">
                    {courseImage(activeCourse) ? (
                      <img
                        src={courseImage(activeCourse)?.url}
                        alt={
                          courseImage(activeCourse)?.alt ||
                          courseName(activeCourse)
                        }
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <BookOpen
                          size={44}
                          className="text-forest/30"
                          aria-hidden="true"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-center p-6 sm:p-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/40">
                      Em andamento
                    </p>
                    <h3 className="serif mt-2 text-3xl leading-tight text-forest">
                      {courseName(activeCourse)}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink/60">
                      {activeCourse.course?.product?.shortDescription ||
                        "Retome as suas aulas e continue a construir novas competências."}
                    </p>
                    <div className="mt-6 flex items-center gap-4">
                      <div className="h-2 flex-1 rounded-full bg-ink/10">
                        <div
                          className="h-2 rounded-full bg-gold"
                          style={{
                            width: `${Math.min(100, Number(activeCourse.progress || 0))}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-forest">
                        {Number(activeCourse.progress || 0).toFixed(0)}%
                      </span>
                    </div>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-forest">
                      Retomar curso <ArrowRight size={16} aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              </section>
            )}

            <section className="mt-12">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest/60">
                    Biblioteca pessoal
                  </p>
                  <h2 className="serif mt-1 text-3xl text-forest sm:text-4xl">
                    Meus cursos
                  </h2>
                </div>
                <label className="relative block w-full sm:w-64">
                  <Search
                    size={17}
                    className="absolute left-3 top-3 text-ink/35"
                    aria-hidden="true"
                  />
                  <span className="sr-only">Pesquisar nos meus cursos</span>
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="input pl-10"
                    placeholder="Pesquisar curso"
                  />
                </label>
              </div>
              {filteredRows.length ? (
                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  {filteredRows.map((enrollment) => {
                    const progress = Math.min(
                      100,
                      Number(enrollment.progress || 0),
                    );
                    const image = courseImage(enrollment);
                    return (
                      <Link
                        key={enrollment.id}
                        href={`/members/courses/${enrollment.courseId}`}
                        className="group overflow-hidden rounded-2xl border border-ink/10 bg-white/80 shadow-card transition hover:-translate-y-0.5 hover:shadow-lg"
                      >
                        <div className="relative h-40 overflow-hidden bg-forest/10">
                          {image ? (
                            <img
                              src={image.url}
                              alt={image.alt || courseName(enrollment)}
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <BookOpen
                                size={38}
                                className="text-forest/30"
                                aria-hidden="true"
                              />
                            </div>
                          )}
                          <span className="absolute right-3 top-3 rounded-full bg-cream/90 px-3 py-1 text-xs font-semibold text-forest">
                            {progress >= 100
                              ? "Concluído"
                              : `${progress.toFixed(0)}% concluído`}
                          </span>
                        </div>
                        <div className="p-5">
                          <h3 className="serif text-2xl leading-tight text-forest">
                            {courseName(enrollment)}
                          </h3>
                          <div className="mt-5 h-1.5 rounded-full bg-ink/10">
                            <div
                              className="h-1.5 rounded-full bg-gold"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <div className="mt-3 flex items-center justify-between text-xs text-ink/50">
                            <span>
                              {progress >= 100
                                ? "Curso concluído"
                                : "Continuar a aprender"}
                            </span>
                            <ArrowRight
                              size={15}
                              className="text-forest transition group-hover:translate-x-1"
                              aria-hidden="true"
                            />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-8 text-sm text-ink/55">
                  Nenhum curso corresponde à sua pesquisa.
                </p>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
