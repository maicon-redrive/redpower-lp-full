"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import VimeoPlayer from "@vimeo/player";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { isLessonUnlocked, logout } from "@/lib/auth";
import { fetchProgress, markCompleteRemote, fetchVideoProgress, saveVideoProgressRemote } from "@/lib/user-data";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { LESSONS } from "@/lib/course";
import { LESSON_TRIGGERS } from "@/lib/triggers";
import { LessonChat, ChatMessage } from "@/components/metodo/LessonChat";
import { LessonNotes } from "@/components/metodo/LessonNotes";
import { NoteModal } from "@/components/metodo/NoteModal";
import { LavaBackground } from "@/components/sections/LavaBackground";
import {
  GLANCYR_LIGHT_CONDENSED,
  GLANCYR_BOLD_CONDENSED,
  GLANCYR_BOLD_EXPANDED,
  GLANCYR_THIN_CONDENSED_OBLIQUE,
  GLANCYR_REGULAR,
} from "@/lib/typography";

export default function LessonPage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = Number(params.id);
  const [ready, setReady] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [currentMinute, setCurrentMinute] = useState(0);
  const [chatOpen, setChatOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fsChatInput, setFsChatInput] = useState("");
  const fsChatScrollRef = useRef<HTMLDivElement>(null);
  const [fsChatMinimized, setFsChatMinimized] = useState(false);
  const [fsChatNotify, setFsChatNotify] = useState(false);
  const [fsChatUnread, setFsChatUnread] = useState(0);
  const [noteModal, setNoteModal] = useState<{ content: string } | null>(null);
  const [notesVersion, setNotesVersion] = useState(0);

  // Shared chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatTyping, setChatTyping] = useState(false);
  const [firedTriggers, setFiredTriggers] = useState<Set<number>>(new Set());

  const lesson = LESSONS.find((l) => l.id === lessonId);
  const prevLesson = LESSONS.find((l) => l.id === lessonId - 1);
  const nextLesson = LESSONS.find((l) => l.id === lessonId + 1);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoWrapperRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<VimeoPlayer | null>(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);

  useEffect(() => {
    setCurrentMinute(0);
    setVideoProgress(0);
    setFiredTriggers(new Set());
    setChatMessages([{
      role: "agent",
      text: `Olá! Estou acompanhando a aula "${lesson?.title || ""}" com você. Conforme o vídeo avançar, vou trazer pontos pra gente discutir e te ajudar a extrair o máximo do conteúdo. Pode me perguntar qualquer coisa a qualquer momento!`,
    }]);
  }, [lessonId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Vimeo player integration
  useEffect(() => {
    if (!lesson?.videoUrl || !iframeRef.current) return;
    const player = new VimeoPlayer(iframeRef.current);
    playerRef.current = player;
    player.getDuration().then((d: number) => setVideoDuration(d));

    fetchVideoProgress().then((vp) => {
      const savedTime = vp[lessonId] || 0;
      if (savedTime > 0) {
        player.setCurrentTime(savedTime).catch(() => {});
        setCurrentMinute(Math.floor(savedTime / 60));
      }
    });

    let lastSaved = 0;
    player.on("timeupdate", (data: { seconds: number; percent: number }) => {
      setCurrentMinute(Math.floor(data.seconds / 60));
      setVideoProgress(data.percent);
      if (Math.abs(data.seconds - lastSaved) > 5) {
        lastSaved = data.seconds;
        saveVideoProgressRemote(lessonId, data.seconds);
      }
    });
    return () => { player.off("timeupdate"); player.destroy(); playerRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.videoUrl, lessonId, ready]);

  // Fullscreen toggle — CSS-based (fixed overlay) with Fullscreen API as enhancement
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => {
      const next = !prev;
      if (next) {
        videoWrapperRef.current?.requestFullscreen?.().catch(() => {});
      } else if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      return next;
    });
  }, []);

  // Sync with native fullscreen exit (Escape key)
  useEffect(() => {
    function onFsChange() {
      if (!document.fullscreenElement && isFullscreen) {
        setIsFullscreen(false);
      }
    }
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, [isFullscreen]);

  // Escape key handler for CSS-only fullscreen
  useEffect(() => {
    if (!isFullscreen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setIsFullscreen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isFullscreen]);

  // Unified trigger firing — shared between sidebar and fullscreen chat
  useEffect(() => {
    const triggers = LESSON_TRIGGERS[lessonId] || [];
    const newTriggers = triggers.filter(
      (t) => currentMinute >= t.minuteMark && !firedTriggers.has(t.minuteMark)
    );
    if (newTriggers.length === 0) return;
    setFiredTriggers((prev) => {
      const next = new Set(prev);
      newTriggers.forEach((t) => next.add(t.minuteMark));
      return next;
    });
    setChatTyping(true);
    const delay = 1500 + Math.random() * 1500;
    setTimeout(() => {
      setChatTyping(false);
      setChatMessages((prev) => [
        ...prev,
        ...newTriggers.map((t) => ({ role: "agent" as const, text: t.message, isTrigger: true, isNew: true })),
      ]);
      setTimeout(() => {
        setChatMessages((prev) => prev.map((m) => (m.isTrigger && m.isNew ? { ...m, isNew: false } : m)));
      }, 8000);
    }, delay);
    if (isFullscreen) {
      setFsChatNotify(true);
      setTimeout(() => setFsChatNotify(false), 10000);
      if (fsChatMinimized) {
        setFsChatUnread((prev) => prev + newTriggers.length);
      }
    }
  }, [currentMinute, lessonId, firedTriggers]); // eslint-disable-line react-hooks/exhaustive-deps

  // Quick-add note from fullscreen
  const addNoteFromFullscreen = useCallback(async () => {
    const cacheKey = `redpower_notes_${lessonId}`;
    let existing: { id: string; title: string; content: string; marker: "none" | "important" | "idea" | "action" | "question" }[] = [];
    const cached = localStorage.getItem(cacheKey);
    if (cached) try { existing = JSON.parse(cached); } catch { /* skip */ }
    if (existing.length === 0) {
      try {
        const { fetchNotes } = await import("@/lib/user-data");
        existing = await fetchNotes(String(lessonId));
      } catch { /* skip */ }
    }
    const newNote = { id: Date.now().toString(), title: "", content: "", marker: "none" as const };
    existing.push(newNote);
    localStorage.setItem(cacheKey, JSON.stringify(existing));
    setNotesVersion(v => v + 1);
    try {
      const { saveNotesRemote } = await import("@/lib/user-data");
      await saveNotesRemote(String(lessonId), existing);
    } catch { /* remote save failed */ }
  }, [lessonId]);

  // Auto-scroll fullscreen chat
  useEffect(() => {
    const el = fsChatScrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [chatMessages]);

  // Fullscreen chat send — uses shared messages
  const handleFsChatSend = useCallback(async () => {
    if (!fsChatInput.trim()) return;
    const userText = fsChatInput.trim();
    const updated = [...chatMessages, { role: "user" as const, text: userText }];
    setChatMessages(updated);
    setFsChatInput("");
    setChatTyping(true);
    try {
      const res = await fetch("/api/agent-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, messages: updated, currentMinute }),
      });
      const data = await res.json();
      setChatMessages((prev) => [...prev, { role: "agent", text: data.reply || "Erro ao processar." }]);
    } catch {
      setChatMessages((prev) => [...prev, { role: "agent", text: "Erro de conexão. Tente novamente." }]);
    }
    setChatTyping(false);
  }, [fsChatInput, chatMessages, lessonId, currentMinute]);

  // Fallback: simulate for lessons without video
  useEffect(() => {
    if (lesson?.videoUrl) return;
    const timer = setInterval(() => { setCurrentMinute((m) => m + 1); }, 8000);
    return () => clearInterval(timer);
  }, [lessonId, lesson?.videoUrl]);

  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.replace("/login"); return; }
      setUserEmail(user.email || "");
      const localProgress = JSON.parse(localStorage.getItem("redpower_progress") || "[]") as number[];
      let progress = localProgress;
      try {
        const remote = await fetchProgress();
        progress = [...new Set([...remote, ...localProgress])];
        localStorage.setItem("redpower_progress", JSON.stringify(progress));
      } catch { /* use localStorage */ }
      const unlocked = lessonId === 1 || progress.includes(lessonId - 1);
      if (!unlocked) {
        router.replace("/metodo");
        return;
      }
      setCompleted(progress.includes(lessonId));
      setReady(true);
    });
  }, [router, lessonId]);

  if (!ready || !lesson) return null;

  async function handleMarkComplete() {
    setCompleted(true);
    const stored = JSON.parse(localStorage.getItem("redpower_progress") || "[]") as number[];
    if (!stored.includes(lessonId)) {
      stored.push(lessonId);
      localStorage.setItem("redpower_progress", JSON.stringify(stored));
    }
    try {
      await markCompleteRemote(lessonId);
    } catch { /* localStorage has it */ }
  }

  return (
    <div className="relative flex h-screen flex-col overflow-hidden" style={{ background: "var(--background)" }}>
      <LavaBackground />
      {/* Top bar */}
      <header className="relative shrink-0 border-b border-white/5 z-40" style={{ background: "rgba(8,8,8,0.85)", backdropFilter: "blur(20px)" }}>
        <div className="flex items-center justify-between px-4 py-3 lg:px-6">
          <div className="flex items-center gap-4">
            <Link href="/metodo" className="group flex items-center gap-2 text-camurca-texto transition-colors hover:text-vermelho-redrive">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="transition-colors group-hover:stroke-vermelho-redrive">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              <img src="/images/redpower-by-redrive.svg" alt="RedPower by Redrive" className="h-4 hidden sm:block transition-opacity group-hover:opacity-80" />
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <span className="font-display text-white" style={{ fontSize: 26, ...GLANCYR_LIGHT_CONDENSED }}>
              {lesson.fase} — {lesson.title}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-camurca-texto sm:block" style={{ ...GLANCYR_THIN_CONDENSED_OBLIQUE }}>
              {lessonId}/{LESSONS.length}
            </span>
            <span className="hidden text-xs text-camurca-texto sm:block">{userEmail}</span>
            <Link
              href="/metodo/conta"
              className="hidden sm:flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs text-camurca-texto transition-colors hover:bg-white/10 hover:text-white"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
              </svg>
              Minha Conta
            </Link>
            <button
              onClick={async () => {
                await logout();
                router.replace("/login");
              }}
              className="hidden sm:block rounded-lg bg-white/5 px-3 py-1.5 text-xs text-camurca-texto transition-colors hover:bg-white/10 hover:text-white"
            >
              Sair
            </button>
            {/* Chat toggle for mobile */}
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className={`flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs transition-colors lg:hidden ${chatOpen ? "bg-vermelho-redrive text-white" : "bg-white/5 text-camurca-texto"}`}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Chat
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="relative z-10 flex flex-1 overflow-hidden">
        {/* Left sidebar — Chat */}
        <aside className={`shrink-0 border-r border-white/5 ${chatOpen ? "flex" : "hidden"} w-full flex-col lg:flex lg:w-[340px]`}>
          <LessonChat lessonId={lessonId} lessonTitle={lesson.title} messages={chatMessages} setMessages={setChatMessages} typing={chatTyping} currentMinute={currentMinute} />
        </aside>

        {/* Center — Video + Actions */}
        <main className={`flex flex-1 flex-col overflow-y-auto ${chatOpen ? "hidden lg:flex" : "flex"}`}>
          <div className="flex-1 p-4 lg:p-6">
            {/* Video player */}
            {lesson.videoUrl ? (
              <div ref={videoWrapperRef} className={`overflow-hidden ${isFullscreen ? "flex items-center justify-center bg-black w-screen h-screen" : "relative w-full aspect-video rounded-[16px] border border-white/10"}`} style={isFullscreen ? { position: "fixed", inset: 0, zIndex: 9999 } : { background: "#000" }}>
                <iframe
                  ref={iframeRef}
                  src={lesson.videoUrl}
                  className={isFullscreen ? "h-full w-full" : "absolute inset-0 h-full w-full"}
                  allow="autoplay; picture-in-picture; clipboard-write; encrypted-media; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
                {/* ── Fullscreen overlays ── */}
                {isFullscreen && (
                  <>
                    {/* Floating chat — Figma layout */}
                    <div
                      className="absolute z-30 flex flex-col"
                      style={{ pointerEvents: "auto", bottom: 80, right: 70, width: fsChatMinimized ? "auto" : "55%" }}
                    >
                      {fsChatMinimized ? (
                        <button
                          onClick={() => { setFsChatMinimized(false); setFsChatNotify(false); setFsChatUnread(0); }}
                          className="relative flex items-center gap-2 rounded-2xl px-4 py-3 overflow-hidden transition-all hover:brightness-110"
                          style={{
                            background: "rgba(20,4,3,0.92)",
                            backdropFilter: "blur(24px)",
                            border: fsChatNotify ? "1px solid rgba(204,0,32,0.5)" : "1px solid rgba(60,20,18,0.6)",
                            boxShadow: fsChatNotify ? "0 0 20px rgba(204,0,32,0.35), 0 0 40px rgba(204,0,32,0.15)" : "none",
                            transition: "box-shadow 0.5s, border-color 0.5s",
                          }}
                        >
                          {/* Pulse line */}
                          {fsChatNotify && (
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden">
                              <div
                                className="h-full w-1/3 rounded-full"
                                style={{
                                  background: "linear-gradient(90deg, transparent, #CC0020, transparent)",
                                  animation: "fsChatPulse 1.5s ease-in-out infinite",
                                }}
                              />
                            </div>
                          )}
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-vermelho-redrive shrink-0">
                            <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 2.47a2.25 2.25 0 01-1.59.659H9.06a2.25 2.25 0 01-1.591-.659L5 14.5m14 0V17a2.25 2.25 0 01-2.25 2.25H7.25A2.25 2.25 0 015 17v-2.5" />
                            </svg>
                          </div>
                          <span className="text-[10px] text-white" style={{ ...GLANCYR_BOLD_CONDENSED }}>Agente RedPower</span>
                          {fsChatNotify && (
                            <span className="flex h-2 w-2 shrink-0">
                              <span className="absolute inline-flex h-2 w-2 rounded-full bg-vermelho-redrive opacity-75 animate-ping" />
                              <span className="relative inline-flex h-2 w-2 rounded-full bg-vermelho-redrive" />
                            </span>
                          )}
                          {!fsChatNotify && fsChatUnread > 0 && (
                            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-vermelho-redrive px-1 text-[8px] font-bold text-white shrink-0">
                              {fsChatUnread}
                            </span>
                          )}
                        </button>
                      ) : (
                      <>
                      {/* Action buttons row above chat */}
                      <div className="flex items-center justify-end gap-2 pb-2 pr-1 shrink-0">
                        {([
                          { label: "Criar nota", icon: <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>, action: "note" },
                          { label: "Resumir aula", icon: <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" /></svg>, action: "resumir" },
                          { label: "Dúvida rápida", icon: <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3m.08 4h.01" /></svg>, action: "duvida" },
                          { label: "Plano de ação", icon: <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>, action: "plano" },
                        ] as const).map((item) => (
                          <button
                            key={item.action}
                            onClick={() => {
                              if (item.action === "note") {
                                setNoteModal({ content: "" });
                              } else {
                                const prompts: Record<string, string> = {
                                  resumir: "Resuma os pontos principais da aula até agora",
                                  duvida: "Tenho uma dúvida rápida sobre o que foi explicado",
                                  plano: "Me ajude a montar um plano de ação com base nessa aula",
                                };
                                setFsChatInput(prompts[item.action] || "");
                              }
                            }}
                            className="flex items-center gap-1.5 rounded-[5px] border border-[#2c1d1d] px-2.5 py-1 text-[10px] italic text-[#908988] hover:text-white hover:border-vermelho-redrive/40 transition-colors"
                            style={{ background: "#221112" }}
                          >
                            {item.icon}
                            {item.label}
                          </button>
                        ))}
                      </div>

                      {/* Two-column chat panel */}
                      <div className="relative">
                        {/* Minimize button — floating outside top-left corner */}
                        <button
                          onClick={() => setFsChatMinimized(true)}
                          className="absolute -top-2 -left-2 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-[#1a0a09] border border-white/15 hover:bg-yellow-500/80 transition-colors group"
                          title="Minimizar chat"
                        >
                          <span className="block w-2.5 h-[1.5px] rounded-full bg-white/50 group-hover:bg-black/70 transition-colors" />
                        </button>
                      <div
                        className="flex rounded-2xl overflow-hidden"
                        style={{
                          background: "rgba(20,4,3,0.92)",
                          backdropFilter: "blur(24px)",
                          border: fsChatNotify ? "1px solid rgba(204,0,32,0.5)" : "1px solid rgba(60,20,18,0.6)",
                          boxShadow: fsChatNotify ? "0 0 20px rgba(204,0,32,0.35), 0 0 40px rgba(204,0,32,0.15)" : "none",
                          transition: "box-shadow 0.5s, border-color 0.5s",
                          height: 150,
                        }}
                      >
                        {/* Left column — agent identity + input */}
                        <div className="flex flex-col w-[180px] shrink-0 p-3 gap-3">
                          {/* Agent identity */}
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-vermelho-redrive shrink-0">
                              <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 2.47a2.25 2.25 0 01-1.59.659H9.06a2.25 2.25 0 01-1.591-.659L5 14.5m14 0V17a2.25 2.25 0 01-2.25 2.25H7.25A2.25 2.25 0 015 17v-2.5" />
                              </svg>
                            </div>
                            <div className="flex flex-col">
                              <p className="text-[9px] text-white leading-none" style={{ ...GLANCYR_BOLD_CONDENSED }}>Agente RedPower</p>
                              <p className="flex items-center gap-1 text-[5px] text-[#50f116] leading-none mt-0.5">
                                <span className="inline-block h-1 w-1 rounded-full bg-[#50f116]" />
                                Acompanhando a aula
                              </p>
                            </div>
                          </div>

                          {/* Input */}
                          <form
                            onSubmit={(e) => { e.preventDefault(); handleFsChatSend(); }}
                            className="flex flex-col gap-2 flex-1"
                          >
                            <input
                              value={fsChatInput}
                              onChange={(e) => setFsChatInput(e.target.value)}
                              placeholder="Pergunte sobre o método..."
                              className="flex-1 rounded-lg px-3 py-2 text-[10px] text-white outline-none placeholder:text-[#3a2e2d]"
                              style={{ background: "rgba(58,46,45,0.4)", border: "1px solid rgba(255,255,255,0.06)" }}
                            />
                            <button
                              type="submit"
                              disabled={!fsChatInput.trim()}
                              className="self-start flex h-5 w-6 items-center justify-center rounded bg-[#660305] text-white disabled:opacity-30"
                            >
                              <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                              </svg>
                            </button>
                          </form>
                        </div>

                        {/* Vertical divider */}
                        <div className="w-px shrink-0" style={{ background: "rgba(255,255,255,0.06)" }} />

                        {/* Right column — scrollable messages */}
                        <div ref={fsChatScrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
                          {chatMessages.map((msg, i) => (
                            <div key={i} className={`group flex items-end gap-0.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                              {msg.role === "user" && i > 0 && (
                                <button onClick={() => setNoteModal({ content: msg.text })} className="mb-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity text-camurca-texto hover:text-vermelho-redrive" title="Salvar como nota">
                                  <svg width="8" height="8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
                                </button>
                              )}
                              <div className={`max-w-[80%] rounded-xl px-3 py-2 text-[10px] leading-relaxed ${
                                msg.role === "user"
                                  ? "bg-vermelho-redrive text-white rounded-br-sm"
                                  : "text-white/90 rounded-bl-sm"
                              }`}
                              style={msg.role !== "user" ? { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.04)" } : undefined}
                              >
                                {msg.text}
                              </div>
                              {msg.role !== "user" && i > 0 && (
                                <button onClick={() => setNoteModal({ content: msg.text })} className="mb-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity text-camurca-texto hover:text-vermelho-redrive" title="Salvar como nota">
                                  <svg width="8" height="8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      </div>
                      </>
                      )}
                    </div>

                    {/* Floating notes toolbar — right side, vertically centered */}
                    <div
                      className="absolute right-5 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-1 rounded-[20px] border border-red-500/30 p-1.5"
                      style={{ background: "rgba(20,4,3,0.85)", backdropFilter: "blur(24px)", boxShadow: "0 0 30px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,0,0,0.1)" }}
                    >
                      {([
                        { marker: "none", icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>, tooltip: "Nova nota" },
                        { marker: "important", icon: <span className="text-base">🔴</span>, tooltip: "Marcar importante" },
                        { marker: "idea", icon: <span className="text-base">💡</span>, tooltip: "Anotar ideia" },
                        { marker: "action", icon: <span className="text-base">✅</span>, tooltip: "Anotar ação" },
                      ] as const).map((item) => (
                        <div key={item.marker} className="group relative">
                          <button
                            onClick={async () => {
                              const cacheKey = `redpower_notes_${lessonId}`;
                              let existing: { id: string; title: string; content: string; marker: "none" | "important" | "idea" | "action" | "question" }[] = [];
                              const cached = localStorage.getItem(cacheKey);
                              if (cached) try { existing = JSON.parse(cached); } catch { /* skip */ }
                              if (existing.length === 0) {
                                try {
                                  const { fetchNotes } = await import("@/lib/user-data");
                                  existing = await fetchNotes(String(lessonId));
                                } catch { /* skip */ }
                              }
                              const newNote = { id: Date.now().toString(), title: item.marker !== "none" ? `Min ${currentMinute}` : "", content: "", marker: item.marker as "none" | "important" | "idea" | "action" | "question" };
                              existing.push(newNote);
                              localStorage.setItem(cacheKey, JSON.stringify(existing));
                              setNotesVersion(v => v + 1);
                              try {
                                const { saveNotesRemote } = await import("@/lib/user-data");
                                await saveNotesRemote(String(lessonId), existing);
                              } catch { /* remote save failed */ }
                            }}
                            className="flex items-center justify-center w-10 h-10 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                            style={{ background: "#3A0D0B" }}
                          >
                            {item.icon}
                          </button>
                          <div className="pointer-events-none absolute right-full top-1/2 -translate-y-1/2 mr-3 rounded-lg border border-red-500/20 px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap" style={{ background: "rgba(20,4,3,0.95)", backdropFilter: "blur(12px)", fontSize: 12, ...GLANCYR_THIN_CONDENSED_OBLIQUE, color: "white" }}>
                            {item.tooltip}
                          </div>
                        </div>
                      ))}
                      <div className="w-6 h-px bg-white/10 my-0.5" />
                      <div className="group relative">
                        <button
                          onClick={toggleFullscreen}
                          className="flex items-center justify-center w-10 h-10 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                          style={{ background: "#3A0D0B" }}
                        >
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                          </svg>
                        </button>
                        <div className="pointer-events-none absolute right-full top-1/2 -translate-y-1/2 mr-3 rounded-lg border border-red-500/20 px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap" style={{ background: "rgba(20,4,3,0.95)", backdropFilter: "blur(12px)", fontSize: 12, ...GLANCYR_THIN_CONDENSED_OBLIQUE, color: "white" }}>
                          Sair da tela cheia
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {isFullscreen && noteModal && (
                  <NoteModal
                    lessonId={lessonId}
                    initialContent={noteModal.content}
                    onClose={() => { setNoteModal(null); setNotesVersion(v => v + 1); }}
                  />
                )}
              </div>
            ) : (
              <div
                className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-[16px] border border-white/10"
                style={{ background: "linear-gradient(135deg, #1a0000 0%, #0a0a0a 50%, #1a0000 100%)" }}
              >
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-vermelho-redrive/20">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="ml-1">
                      <path d="M8 5.14v13.72a1 1 0 001.5.86l11.04-6.86a1 1 0 000-1.72L9.5 4.28A1 1 0 008 5.14z" fill="var(--vermelho-redrive)" />
                    </svg>
                  </div>
                  <p className="font-display text-sm text-camurca-texto" style={{ ...GLANCYR_REGULAR }}>
                    Vídeo da aula será exibido aqui
                  </p>
                  <p className="mt-1 text-xs text-camurca-texto/50">
                    Demo: o agente dispara gatilhos a cada ~8s simulando o progresso do vídeo
                  </p>
                </div>
                <div className="absolute bottom-0 left-0 h-1 w-full bg-white/5">
                  <div
                    className="h-full bg-vermelho-redrive transition-all duration-1000"
                    style={{ width: `${Math.min((currentMinute / 20) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {!completed ? (
                <button
                  onClick={handleMarkComplete}
                  className="btn-lp flex items-center gap-2 rounded-xl bg-vermelho-redrive px-5 py-2.5 font-display text-sm text-white"
                  style={{ ...GLANCYR_BOLD_EXPANDED }}
                >
                  Concluir aula
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </button>
              ) : (
                <div className="flex items-center gap-2 rounded-xl bg-green-500/10 px-5 py-2.5 text-sm text-green-400">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Aula concluída
                </div>
              )}

              {/* Fullscreen toggle */}
              {lesson.videoUrl && (
                <button
                  onClick={toggleFullscreen}
                  className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-xs text-camurca-texto transition-colors hover:bg-white/10 hover:text-white"
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                  </svg>
                  Tela cheia
                </button>
              )}

              {/* Nav */}
              <div className="ml-auto flex items-center gap-2">
                {prevLesson && (
                  <Link
                    href={`/metodo/aula/${prevLesson.id}`}
                    className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-xs text-camurca-texto transition-colors hover:bg-white/10 hover:text-white"
                  >
                    ← Anterior
                  </Link>
                )}
                {nextLesson ? (
                  <Link
                    href={`/metodo/aula/${nextLesson.id}`}
                    className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-xs text-camurca-texto transition-colors hover:bg-white/10 hover:text-white"
                  >
                    Próxima →
                  </Link>
                ) : (
                  <Link
                    href="/metodo"
                    className="flex items-center gap-1.5 rounded-lg bg-vermelho-redrive/10 px-3 py-2 text-xs text-vermelho-redrive transition-colors hover:bg-vermelho-redrive/20"
                  >
                    Finalizar curso →
                  </Link>
                )}
              </div>
            </div>

            {/* Lesson description */}
            <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <h2 className="font-display text-base text-bege-texto" style={{ ...GLANCYR_REGULAR }}>
                {lesson.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-camurca-texto">
                {lesson.description}
              </p>
            </div>
          </div>
        </main>

        {/* Right sidebar — Notes (desktop always, mobile when chat closed via tab) */}
        <aside className="hidden shrink-0 border-l border-white/5 lg:flex lg:w-[340px] flex-col">
          <LessonNotes key={notesVersion} lessonId={lessonId} />
        </aside>
      </div>
      {noteModal && (
        <NoteModal
          lessonId={lessonId}
          initialContent={noteModal.content}
          onClose={() => { setNoteModal(null); setNotesVersion(v => v + 1); }}
        />
      )}
    </div>
  );
}
