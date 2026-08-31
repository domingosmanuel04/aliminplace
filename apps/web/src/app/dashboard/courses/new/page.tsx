"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Plus, Trash2 } from "lucide-react";
import { Shell } from "@/components/shell";
import { api } from "@/lib/api";

type Lesson = {
  title: string;
  type: string;
  content: string;
  videoUrl?: string;
  videoUrls?: string[];
  durationSec: number;
};
type CourseModule = { title: string; lessons: Lesson[] };

const emptyLesson = (): Lesson => ({
  title: "",
  type: "video",
  content: "",
  videoUrl: "",
  videoUrls: [],
  durationSec: 0,
});
const emptyModule = (): CourseModule => ({
  title: "",
  lessons: [emptyLesson()],
});

export default function NewCoursePage() {
  const [form, setForm] = useState({
    name: "",
    shortDescription: "",
    description: "",
    price: 0,
    imageUrl: "",
  });
  const [modules, setModules] = useState<CourseModule[]>([emptyModule()]);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function uploadMedia(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const upload = await api<{ url: string }>("/media/upload", {
      method: "POST",
      body: formData,
    });
    return upload.url;
  }

  function updateModule(moduleIndex: number, value: Partial<CourseModule>) {
    setModules((current) =>
      current.map((module, index) =>
        index === moduleIndex ? { ...module, ...value } : module,
      ),
    );
  }

  function updateLesson(
    moduleIndex: number,
    lessonIndex: number,
    value: Partial<Lesson>,
  ) {
    setModules((current) =>
      current.map((module, index) =>
        index !== moduleIndex
          ? module
          : {
              ...module,
              lessons: module.lessons.map((lesson, currentLessonIndex) =>
                currentLessonIndex === lessonIndex
                  ? { ...lesson, ...value }
                  : lesson,
              ),
            },
      ),
    );
  }

  function addModule() {
    setModules((current) => [...current, emptyModule()]);
  }

  function removeModule(moduleIndex: number) {
    setModules((current) =>
      current.length === 1
        ? current
        : current.filter((_, index) => index !== moduleIndex),
    );
  }

  function addLesson(moduleIndex: number) {
    setModules((current) =>
      current.map((module, index) =>
        index === moduleIndex
          ? { ...module, lessons: [...module.lessons, emptyLesson()] }
          : module,
      ),
    );
  }

  function removeLesson(moduleIndex: number, lessonIndex: number) {
    setModules((current) =>
      current.map((module, index) =>
        index !== moduleIndex || module.lessons.length === 1
          ? module
          : {
              ...module,
              lessons: module.lessons.filter(
                (_, currentLessonIndex) => currentLessonIndex !== lessonIndex,
              ),
            },
      ),
    );
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setMessage("");
    try {
      const course = await api<{ id: string; name: string }>("/products", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          type: "COURSE",
          kind: "DIGITAL",
          status: "PUBLISHED",
          price: Number(form.price),
          marketplaceVisible: true,
        }),
      });

      await api(`/courses/${course.id}/curriculum`, {
        method: "POST",
        body: JSON.stringify({
          modules: modules.map((module) => ({
            ...module,
            lessons: module.lessons.map((lesson) => ({
              ...lesson,
              videoUrl:
                lesson.videoUrl || lesson.videoUrls?.[0] || lesson.content,
              videoUrls:
                lesson.videoUrls && lesson.videoUrls.length > 0
                  ? lesson.videoUrls
                  : lesson.videoUrl
                    ? [lesson.videoUrl]
                    : [],
            })),
          })),
        }),
      });
      setMessage(`Curso “${course.name}” publicado com sucesso.`);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Não foi possível publicar o curso.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Shell>
      <div className="mx-auto max-w-5xl">
        <Link
          href="/dashboard/courses"
          className="inline-flex items-center gap-2 text-sm text-ink/55 transition hover:text-ink"
        >
          <ArrowLeft size={16} aria-hidden="true" /> Voltar aos cursos
        </Link>
        <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest/60">
              Área do produtor
            </p>
            <h1 className="serif mt-1 text-4xl text-forest sm:text-5xl">
              Publicar novo curso
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/60">
              Apresente o curso, organize o currículo e publique uma experiência
              de aprendizagem completa.
            </p>
          </div>
          <span className="rounded-full bg-gold/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-forest">
            Curso online
          </span>
        </div>

        <form onSubmit={onSubmit} className="mt-10 space-y-8">
          <section className="card p-6 sm:p-8">
            <div className="mb-6 border-b border-ink/10 pb-5">
              <h2 className="serif text-2xl text-forest">
                Informações do curso
              </h2>
              <p className="mt-1 text-sm text-ink/55">
                Esses dados aparecem na página pública e no marketplace.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label" htmlFor="name">
                  Nome do curso
                </label>
                <input
                  id="name"
                  className="input"
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="Ex.: Excel do zero ao avançado"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="shortDescription">
                  Descrição curta
                </label>
                <input
                  id="shortDescription"
                  className="input"
                  value={form.shortDescription}
                  onChange={(event) =>
                    setForm({ ...form, shortDescription: event.target.value })
                  }
                  placeholder="O que o aluno vai aprender?"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="description">
                  Descrição completa
                </label>
                <textarea
                  id="description"
                  className="input"
                  rows={5}
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  placeholder="Apresente os objetivos, o público e os resultados do curso."
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="price">
                  Preço (Kz)
                </label>
                <input
                  id="price"
                  className="input"
                  type="number"
                  min="0"
                  step="1"
                  value={form.price}
                  onChange={(event) =>
                    setForm({ ...form, price: Number(event.target.value) })
                  }
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="imageUrl">
                  Capa do curso
                </label>
                <input
                  id="imageUrl"
                  className="input file:mr-4 file:rounded-full file:border-0 file:bg-forest file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
                  type="file"
                  accept="image/*"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    try {
                      const imageUrl = await uploadMedia(file);
                      setForm((current) => ({ ...current, imageUrl }));
                    } catch (uploadError) {
                      setError(
                        uploadError instanceof Error
                          ? uploadError.message
                          : "Não foi possível carregar a capa.",
                      );
                    }
                  }}
                />
                <p className="mt-2 text-xs text-ink/50">
                  Pode também colar uma URL se preferir.
                </p>
                {form.imageUrl && (
                  <div className="mt-3 overflow-hidden rounded-xl border border-ink/10 bg-ink/5">
                    <img
                      src={form.imageUrl}
                      alt="Pré-visualização da capa do curso"
                      className="h-32 w-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="card p-6 sm:p-8">
            <div className="mb-6 flex flex-col justify-between gap-3 border-b border-ink/10 pb-5 sm:flex-row sm:items-start">
              <div>
                <h2 className="serif text-2xl text-forest">Currículo</h2>
                <p className="mt-1 text-sm text-ink/55">
                  Organize o conteúdo em módulos e aulas.
                </p>
              </div>
              <button type="button" onClick={addModule} className="btn-ghost">
                <Plus size={16} aria-hidden="true" /> Adicionar módulo
              </button>
            </div>
            <div className="space-y-6">
              {modules.map((module, moduleIndex) => (
                <div
                  key={`module-${moduleIndex}`}
                  className="rounded-xl border border-ink/10 bg-cream/45 p-4 sm:p-5"
                >
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <label
                        className="label"
                        htmlFor={`module-${moduleIndex}`}
                      >
                        Módulo {moduleIndex + 1}
                      </label>
                      <input
                        id={`module-${moduleIndex}`}
                        className="input"
                        value={module.title}
                        onChange={(event) =>
                          updateModule(moduleIndex, {
                            title: event.target.value,
                          })
                        }
                        placeholder="Ex.: Fundamentos"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeModule(moduleIndex)}
                      className="mb-0.5 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-red-900/15 text-red-900/60 transition hover:bg-red-900/5"
                      aria-label={`Remover módulo ${moduleIndex + 1}`}
                    >
                      <Trash2 size={17} aria-hidden="true" />
                    </button>
                  </div>
                  <div className="mt-5 space-y-4 border-l-2 border-gold/50 pl-4 sm:pl-5">
                    {module.lessons.map((lesson, lessonIndex) => (
                      <div
                        key={`lesson-${moduleIndex}-${lessonIndex}`}
                        className="grid gap-3 sm:grid-cols-[1fr_130px_44px]"
                      >
                        <div>
                          <label
                            className="label"
                            htmlFor={`lesson-${moduleIndex}-${lessonIndex}`}
                          >
                            Aula {lessonIndex + 1}
                          </label>
                          <input
                            id={`lesson-${moduleIndex}-${lessonIndex}`}
                            className="input"
                            value={lesson.title}
                            onChange={(event) =>
                              updateLesson(moduleIndex, lessonIndex, {
                                title: event.target.value,
                              })
                            }
                            placeholder="Título da aula"
                            required
                          />
                        </div>
                        <div>
                          <label
                            className="label"
                            htmlFor={`duration-${moduleIndex}-${lessonIndex}`}
                          >
                            Duração (min)
                          </label>
                          <input
                            id={`duration-${moduleIndex}-${lessonIndex}`}
                            className="input"
                            type="number"
                            min="0"
                            value={Math.round(lesson.durationSec / 60)}
                            onChange={(event) =>
                              updateLesson(moduleIndex, lessonIndex, {
                                durationSec: Number(event.target.value) * 60,
                              })
                            }
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeLesson(moduleIndex, lessonIndex)}
                          className="mt-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-ink/10 text-ink/40 transition hover:bg-ink/5"
                          aria-label={`Remover aula ${lessonIndex + 1}`}
                        >
                          <Trash2 size={16} aria-hidden="true" />
                        </button>
                        <div className="sm:col-span-3">
                          <label
                            className="label"
                            htmlFor={`content-${moduleIndex}-${lessonIndex}`}
                          >
                            Conteúdo ou URL do vídeo
                          </label>
                          <textarea
                            id={`content-${moduleIndex}-${lessonIndex}`}
                            className="input"
                            rows={2}
                            value={lesson.content}
                            onChange={(event) =>
                              updateLesson(moduleIndex, lessonIndex, {
                                content: event.target.value,
                              })
                            }
                            placeholder="Cole o conteúdo da aula ou o link do vídeo"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label
                            className="label"
                            htmlFor={`video-${moduleIndex}-${lessonIndex}`}
                          >
                            Vídeo(s) da aula
                          </label>
                          <input
                            id={`video-${moduleIndex}-${lessonIndex}`}
                            className="input file:mr-4 file:rounded-full file:border-0 file:bg-forest file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
                            type="file"
                            accept="video/*"
                            multiple
                            onChange={async (event) => {
                              const files = event.target.files;
                              if (!files || files.length === 0) return;
                              const uploadedVideoUrls: string[] = [];
                              for (const file of Array.from(files)) {
                                const formData = new FormData();
                                formData.append("file", file);
                                const upload = await api<{ url: string }>(
                                  "/media/upload",
                                  {
                                    method: "POST",
                                    body: formData,
                                  },
                                );
                                uploadedVideoUrls.push(upload.url);
                              }
                              const merged = [
                                ...(lesson.videoUrls || []),
                                ...uploadedVideoUrls,
                              ];
                              updateLesson(moduleIndex, lessonIndex, {
                                videoUrls: merged,
                                videoUrl: merged[0] || "",
                              });
                            }}
                          />
                          {(lesson.videoUrls?.length || lesson.videoUrl) && (
                            <div className="mt-4 space-y-3">
                              <p className="text-xs font-medium uppercase tracking-[0.14em] text-forest/70">
                                Pré-visualização
                              </p>
                              {(lesson.videoUrls && lesson.videoUrls.length > 0
                                ? lesson.videoUrls
                                : lesson.videoUrl
                                  ? [lesson.videoUrl]
                                  : []
                              ).map((videoUrl, videoIndex) => (
                                <video
                                  key={`${moduleIndex}-${lessonIndex}-${videoIndex}`}
                                  controls
                                  className="w-full rounded-xl border border-ink/10 bg-black"
                                  src={videoUrl}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addLesson(moduleIndex)}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-forest"
                    >
                      <Plus size={16} aria-hidden="true" /> Adicionar aula
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {(error || message) && (
            <p
              role="status"
              className={`rounded-xl px-4 py-3 text-sm ${error ? "bg-red-900/5 text-red-900" : "bg-forest/10 text-forest"}`}
            >
              {error || message}
            </p>
          )}
          <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
            <Link href="/dashboard/courses" className="btn-ghost">
              Cancelar
            </Link>
            <button type="submit" className="btn-primary" disabled={isSaving}>
              {isSaving ? (
                "A publicar..."
              ) : (
                <>
                  <Check size={17} aria-hidden="true" /> Publicar curso
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Shell>
  );
}
