"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { logout } from "@/lib/auth";
import { fetchAllUserData, fetchAllNotes, saveNotesRemote } from "@/lib/user-data";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { LESSONS } from "@/lib/course";
import { Onboarding } from "@/components/metodo/Onboarding";
import { AgentChat } from "@/components/metodo/AgentChat";
import { LavaBackground } from "@/components/sections/LavaBackground";
import {
  GLANCYR_LIGHT_CONDENSED,
  GLANCYR_BOLD_CONDENSED,
  GLANCYR_BOLD_EXPANDED,
  GLANCYR_THIN_CONDENSED_OBLIQUE,
  GLANCYR_REGULAR,
} from "@/lib/typography";

const THUMB_BGS: Record<number, string> = {
  1: "/images/lesson-thumb-bg1.png",
  2: "/images/lesson-thumb-bg2.png",
  3: "/images/lesson-thumb-bg3.png",
  4: "/images/lesson-thumb-bg4.png",
  5: "/images/lesson-thumb-bg5.png",
  6: "/images/lesson-thumb-bg6.png",
  7: "/images/lesson-thumb-bg7.png",
  8: "/images/lesson-thumb-bg8.png",
};

interface NoteTopic {
  id: string;
  title: string;
  content: string;
  marker: "none" | "important" | "idea" | "action" | "question";
  open: boolean;
}

const MARKER_EMOJI: Record<string, string> = {
  none: "",
  important: "🔴",
  idea: "💡",
  action: "✅",
  question: "❓",
};
const MARKER_LABELS: Record<string, string> = {
  none: "",
  important: "Importante",
  idea: "Ideia",
  action: "Ação",
  question: "Dúvida",
};

function getAllNotesLocal(): Record<string, NoteTopic[]> {
  if (typeof window === "undefined") return {};
  return JSON.parse(localStorage.getItem("redpower_notes_v2") || "{}");
}

async function exportNotesMarkdown() {
  const allNotes = await fetchAllNotes();
  let md = "# Minhas Anotações — Método Redrive\n\n";
  const general: NoteTopic[] = (allNotes["general"] || []).map(t => ({ ...t, open: false }));
  if (general.length > 0) {
    md += "## Anotações Gerais\n\n";
    for (const t of general) {
      const marker = t.marker !== "none" ? ` ${MARKER_EMOJI[t.marker]} ${MARKER_LABELS[t.marker]}` : "";
      md += `### ${t.title}${marker}\n\n${t.content}\n\n`;
    }
    md += "---\n\n";
  }
  for (const lesson of LESSONS) {
    const topics: NoteTopic[] = (allNotes[String(lesson.id)] || []).map(t => ({ ...t, open: false }));
    if (topics.length === 0) continue;
    md += `## ${lesson.fase} — ${lesson.title}\n\n`;
    for (const t of topics) {
      const marker = t.marker !== "none" ? ` ${MARKER_EMOJI[t.marker]} ${MARKER_LABELS[t.marker]}` : "";
      md += `### ${t.title}${marker}\n\n${t.content}\n\n`;
    }
    md += "---\n\n";
  }
  const blob = new Blob([md], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "anotacoes-metodo-redrive.md"; a.click();
  URL.revokeObjectURL(url);
}

function LessonCard({ lesson, completed, locked }: { lesson: (typeof LESSONS)[number]; completed: boolean; locked: boolean }) {
  const bgSrc = THUMB_BGS[lesson.id] || "/images/lesson-thumb-bg1.png";

  const card = (
    <div className={`relative overflow-hidden rounded-[32px] border aspect-[592/429] ${locked ? "border-white/10 cursor-not-allowed" : "border-red-600"}`}>
      <div className={`absolute inset-0 transition-all duration-300 ${locked ? "" : "group-hover:blur-[8px]"}`}>
        <Image src={bgSrc} alt="" fill className={`object-cover pointer-events-none ${locked ? "grayscale brightness-[0.3]" : ""}`} />
        <div className="absolute inset-0" style={{ background: locked ? "rgba(0,0,0,0.6)" : "rgba(100,31,28,0.44)" }} />
        <div
          className="absolute top-5 left-5 rounded-[11px] border px-3 py-0.5"
          style={{ background: locked ? "rgba(255,255,255,0.1)" : "rgba(255,0,0,0.5)", borderColor: locked ? "rgba(255,255,255,0.2)" : "#FF0000" }}
        >
          <span className="font-display text-white text-[14px] leading-[24px]" style={{ ...GLANCYR_THIN_CONDENSED_OBLIQUE }}>
            {lesson.duration || "—"}
          </span>
        </div>
        {locked && (
          <div className="absolute top-5 right-5 flex items-center gap-1.5 rounded-[11px] bg-white/10 border border-white/20 px-3 py-0.5">
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <span className="font-display text-white/60 text-[14px] leading-[24px]" style={{ ...GLANCYR_THIN_CONDENSED_OBLIQUE }}>
              BLOQUEADA
            </span>
          </div>
        )}
        {completed && !locked && (
          <div className="absolute top-5 right-5 flex items-center gap-1.5 rounded-[11px] bg-green-500/60 border border-green-400 px-3 py-0.5">
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            <span className="font-display text-white text-[14px] leading-[24px]" style={{ ...GLANCYR_THIN_CONDENSED_OBLIQUE }}>
              CONCLUÍDA
            </span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="inline-block rounded-[23px] border-[0.73px] px-3 py-0.5 mb-2" style={{ background: locked ? "rgba(255,255,255,0.08)" : "rgba(255,0,0,0.5)", borderColor: locked ? "rgba(255,255,255,0.15)" : "rgb(239 68 68)" }}>
            <span className={`font-display text-[14px] leading-[24px] ${locked ? "text-white/40" : "text-white"}`} style={{ ...GLANCYR_THIN_CONDENSED_OBLIQUE }}>
              {lesson.fase}
            </span>
          </div>
          <h3 className={`font-display uppercase ${locked ? "text-white/30" : "text-white"}`} style={{ fontSize: "clamp(20px, 3vw, 31px)", lineHeight: 1.4, ...GLANCYR_BOLD_CONDENSED }}>
            {lesson.title}
          </h3>
          {locked ? (
            <p className="text-white/20 text-[14px] leading-[22px] mt-1" style={{ fontFamily: "var(--font-figtree)" }}>
              Conclua a aula {lesson.id - 1} para desbloquear
            </p>
          ) : (
            <p className="text-[#efe9e1] text-[14px] leading-[22px] mt-1 line-clamp-3" style={{ fontFamily: "var(--font-figtree)" }}>
              {lesson.description}
            </p>
          )}
        </div>
      </div>
      {!locked && (
        <>
          <div className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "rgba(100,31,28,0.80)" }} />
          <div className="absolute inset-0 z-20 flex items-center justify-center gap-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="font-display text-vermelho-redrive uppercase" style={{ fontSize: 26, lineHeight: 1.4, ...GLANCYR_BOLD_EXPANDED }}>
              ASSISTIR AULA
            </span>
            <div className="flex items-center gap-2">
              <div className="w-[60px] lg:w-[88px] h-px bg-vermelho-redrive/60" />
              <svg width="14" height="21" viewBox="0 0 14 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L12 10.5L1 20" stroke="var(--vermelho-redrive)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </>
      )}
    </div>
  );

  if (locked) return (
    <div className="group/locked relative block cursor-not-allowed">
      {card}
      <div
        className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center opacity-0 group-hover/locked:opacity-100 transition-opacity duration-300"
      >
        <div
          className="rounded-xl border border-white/15 px-5 py-3 text-center"
          style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(12px)", boxShadow: "0 4px 24px rgba(0,0,0,0.6)" }}
        >
          <span className="text-white/90 text-sm" style={{ fontFamily: "var(--font-figtree)" }}>
            🔒 Para desbloquear, assista a <strong className="text-vermelho-redrive">Aula {String(lesson.id - 1).padStart(2, "0")}</strong>
          </span>
        </div>
      </div>
    </div>
  );
  return <Link href={`/metodo/aula/${lesson.id}`} className="group block">{card}</Link>;
}

function GeneralNoteModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [marker, setMarker] = useState<"none" | "important" | "idea" | "action" | "question">("none");
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    if (!title.trim() && !content.trim()) return;
    const newNote = {
      id: Date.now().toString(),
      title: title.trim() || "Sem título",
      content: content.trim(),
      marker,
    };
    let general: { id: string; title: string; content: string; marker: "none" | "important" | "idea" | "action" | "question" }[] = [];
    try {
      const allNotes = await fetchAllNotes();
      general = allNotes["general"] || [];
    } catch {
      const cached = localStorage.getItem("redpower_notes_general");
      if (cached) try { general = JSON.parse(cached); } catch { /* skip */ }
    }
    general.push(newNote);
    localStorage.setItem("redpower_notes_general", JSON.stringify(general));
    try {
      await saveNotesRemote("general", general);
    } catch { /* remote save failed, localStorage has it */ }
    setSaved(true);
    setTimeout(onClose, 600);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-lg mx-4 rounded-2xl border border-white/10 overflow-hidden"
        style={{ background: "#0e0e0e" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="text-white" style={{ fontSize: 18, ...GLANCYR_BOLD_CONDENSED }}>Nova Anotação Geral</h2>
          <button onClick={onClose} className="text-camurca-texto hover:text-white transition-colors">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-[11px] text-white/40 mb-1.5 uppercase" style={{ ...GLANCYR_THIN_CONDENSED_OBLIQUE }}>Título</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Insight sobre jornadas de ativação"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-bege-texto outline-none placeholder:text-white/20 focus:border-vermelho-redrive"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-[11px] text-white/40 mb-1.5 uppercase" style={{ ...GLANCYR_THIN_CONDENSED_OBLIQUE }}>Conteúdo</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escreva sua anotação sobre o método..."
              rows={5}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-bege-texto outline-none placeholder:text-white/20 focus:border-vermelho-redrive resize-none"
            />
          </div>
          <div>
            <label className="block text-[11px] text-white/40 mb-1.5 uppercase" style={{ ...GLANCYR_THIN_CONDENSED_OBLIQUE }}>Marcador</label>
            <div className="flex gap-2">
              {(["none", "important", "idea", "action", "question"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMarker(m)}
                  className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                    marker === m ? "border-vermelho-redrive bg-vermelho-redrive/20 text-white" : "border-white/10 bg-white/5 text-white/50 hover:text-white"
                  }`}
                >
                  {m === "none" ? "Nenhum" : `${MARKER_EMOJI[m]} ${MARKER_LABELS[m]}`}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-xl px-5 py-2.5 text-sm text-camurca-texto hover:text-white transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() && !content.trim()}
            className="rounded-xl bg-vermelho-redrive px-5 py-2.5 text-sm text-white disabled:opacity-30 transition-opacity"
            style={{ ...GLANCYR_BOLD_CONDENSED }}
          >
            {saved ? "✓ Salvo!" : "Salvar Anotação"}
          </button>
        </div>
      </div>
    </div>
  );
}

function FloatingMenu({ onCreateNote }: { onCreateNote: () => void }) {
  const router = useRouter();

  const actions = [
    {
      label: "FAZER ANOTAÇÃO",
      active: true,
      icon: (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
        </svg>
      ),
      onClick: onCreateNote,
    },
    {
      label: "EXPORTAR NOTAS",
      icon: (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
      ),
      onClick: () => exportNotesMarkdown(),
    },
    {
      label: "MINHA CONTA",
      icon: (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
        </svg>
      ),
      onClick: () => router.push("/metodo/conta"),
    },
    {
      label: "CENTRAL DE NOTAS",
      icon: (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
      onClick: () => router.push("/metodo/conta?tab=notas"),
    },
    {
      label: "REINICIAR PROGRESSO",
      icon: (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
        </svg>
      ),
      onClick: () => {
        if (confirm("Tem certeza? Isso vai zerar o progresso de todas as aulas.")) {
          localStorage.removeItem("redpower_progress");
          window.location.reload();
        }
      },
    },
  ];

  return (
    <div
      className="fixed right-5 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col items-center gap-1 rounded-[20px] border border-red-500/30 p-1.5"
      style={{ background: "rgba(20,4,3,0.92)", backdropFilter: "blur(24px)", boxShadow: "0 0 30px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,0,0,0.1)" }}
    >
      {actions.map((action, i) => (
        <div key={i} className="group relative">
          <button
            onClick={action.onClick}
            className={`flex items-center justify-center w-10 h-10 rounded-xl transition-colors ${
              action.active
                ? "bg-vermelho-redrive text-white"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
            style={!action.active ? { background: "#3A0D0B" } : undefined}
          >
            {action.icon}
          </button>
          <div
            className="pointer-events-none absolute right-full top-1/2 -translate-y-1/2 mr-3 rounded-lg border border-red-500/20 px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
            style={{ background: "rgba(20,4,3,0.95)", backdropFilter: "blur(12px)", fontSize: 12, ...GLANCYR_THIN_CONDENSED_OBLIQUE, color: "white" }}
          >
            {action.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function SidebarChat() {
  return (
    <aside
      className="hidden lg:flex flex-col fixed left-6 top-[calc(57px+24px)] w-[340px] h-[calc(100vh-57px-48px)] rounded-2xl border border-white/10 overflow-hidden z-30"
      style={{ background: "rgba(8,8,8,0.85)", backdropFilter: "blur(20px)" }}
    >
      <AgentChat embedded />
    </aside>
  );
}

export default function MetodoDashboard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [progress, setProgress] = useState<number[]>([]);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.replace("/login");
        return;
      }
      setUserEmail(user.email || "");
      const localProgress = JSON.parse(localStorage.getItem("redpower_progress") || "[]") as number[];
      try {
        const userData = await fetchAllUserData();
        const merged = [...new Set([...userData.progress, ...localProgress])];
        setProgress(merged);
        localStorage.setItem("redpower_progress", JSON.stringify(merged));
        const hasOnboarding = userData.onboarding || localStorage.getItem("redpower_onboarding");
        if (!hasOnboarding) {
          setShowOnboarding(true);
        }
      } catch {
        setProgress(localProgress);
        const hasLocal = localStorage.getItem("redpower_onboarding");
        if (!hasLocal) setShowOnboarding(true);
      }
      setReady(true);
    });
  }, [router]);

  if (!ready) return null;

  const completedCount = progress.length;
  const totalCount = LESSONS.length;
  const progressPct = (completedCount / totalCount) * 100;

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "var(--background)" }}>
      <LavaBackground />
      {showOnboarding && <Onboarding onComplete={() => setShowOnboarding(false)} />}

      {/* Top bar — full width */}
      <header className="sticky top-0 z-40 border-b border-white/5" style={{ background: "rgba(8,8,8,0.9)", backdropFilter: "blur(20px)" }}>
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <img src="/images/redpower-by-redrive.svg" alt="RedPower by Redrive" className="h-5" />
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-camurca-texto sm:block">{userEmail}</span>
            <Link
              href="/metodo/conta"
              className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs text-camurca-texto transition-colors hover:bg-vermelho-redrive/10 hover:text-vermelho-redrive"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
              </svg>
              <span className="hidden sm:inline">Minha Conta</span>
            </Link>
            <button
              onClick={async () => {
                await logout();
                router.replace("/login");
              }}
              className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-camurca-texto transition-colors hover:bg-vermelho-redrive/10 hover:text-vermelho-redrive"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main layout: sidebar chat + content */}
      <div className="relative z-10 flex">
        <SidebarChat />

        <main className="flex-1 px-6 lg:pl-[380px] lg:pr-20 py-10 pb-24">
          {/* Welcome */}
          <div className="mb-10 max-w-4xl">
            <h1
              className="font-display text-creme-destaque"
              style={{ fontSize: "clamp(32px, 6vw, 48px)", lineHeight: 1, ...GLANCYR_LIGHT_CONDENSED }}
            >
              Método Redrive
            </h1>
            <p className="mt-2 text-sm text-camurca-texto">
              8 aulas com o Daniel Reginatto — 3h41min de conteúdo. O método completo para operar a Redrive no máximo potencial.
            </p>

            {/* Progress bar */}
            <div className="mt-6 flex items-center gap-4">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-vermelho-redrive transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span className="shrink-0 text-sm text-camurca-texto" style={{ ...GLANCYR_THIN_CONDENSED_OBLIQUE }}>
                {completedCount}/{totalCount} aulas
              </span>
            </div>
          </div>

          {/* Lessons grid */}
          <div className="grid gap-3 sm:grid-cols-2">
            {LESSONS.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} completed={progress.includes(lesson.id)} locked={lesson.id !== 1 && !progress.includes(lesson.id - 1)} />
            ))}
          </div>
        </main>
      </div>

      {/* Floating side menu */}
      <FloatingMenu onCreateNote={() => setShowNoteModal(true)} />

      {/* General note modal */}
      {showNoteModal && <GeneralNoteModal onClose={() => setShowNoteModal(false)} />}

      {/* Mobile-only floating chat button */}
      <div className="lg:hidden">
        <AgentChat />
      </div>
    </div>
  );
}
