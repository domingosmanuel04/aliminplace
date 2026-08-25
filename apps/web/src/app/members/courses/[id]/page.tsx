"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function CoursePlayer({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [data, setData] = useState<any>(null);
  const [lesson, setLesson] = useState<any>(null);
  useEffect(() => {
    params.then(async (p) => {
      const e = await api(`/members/courses/${p.id}`);
      setData(e);
      const first = e.course.modules.flatMap((m: any) => m.lessons)[0];
      setLesson(first);
    });
  }, [params]);
  async function complete() {
    if (!lesson) return;
    const r = await api("/members/progress", {
      method: "POST",
      body: JSON.stringify({
        lessonId: lesson.id,
        completed: true,
        positionSec: lesson.durationSec,
      }),
    });
    alert(`Progresso ${Number(r.progress).toFixed(0)}%`);
  }
  if (!data) return <p className="p-10">A carregar curso…</p>;
  return (
    <main className="grid min-h-screen md:grid-cols-[280px_1fr]">
      <aside className="border-b border-ink/10 p-4 md:border-b-0 md:border-r">
        {data.course.modules.map((m: any) => (
          <div key={m.id} className="mb-4">
            <p className="text-xs uppercase tracking-widest text-ink/40">
              {m.title}
            </p>
            {m.lessons.map((l: any) => (
              <button
                key={l.id}
                onClick={() => setLesson(l)}
                className={`mt-1 block w-full rounded-lg px-2 py-1 text-left text-sm ${lesson?.id === l.id ? "bg-gold" : ""}`}
              >
                {l.title}
              </button>
            ))}
          </div>
        ))}
      </aside>
      <section className="min-w-0 p-4 sm:p-6 md:p-8">
        <h1 className="serif text-3xl">{lesson?.title}</h1>
        <div className="mt-6 aspect-video rounded-2xl bg-ink text-cream flex items-center justify-center">
          Player · {lesson?.durationSec}s · velocidade 1x
        </div>
        <p className="mt-4 text-sm text-ink/70">{lesson?.content}</p>
        <button className="btn-primary mt-6" onClick={complete}>
          Marcar como concluída
        </button>
      </section>
    </main>
  );
}
