"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUserRole, logout, type OnboardingData } from "@/lib/auth";
import { fetchOnboarding, fetchAllNotes, saveNotesRemote } from "@/lib/user-data";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { LESSONS } from "@/lib/course";
import { LavaBackground } from "@/components/sections/LavaBackground";
import {
  GLANCYR_LIGHT_CONDENSED,
  GLANCYR_BOLD_CONDENSED,
  GLANCYR_BOLD_EXPANDED,
  GLANCYR_THIN_CONDENSED_OBLIQUE,
  GLANCYR_REGULAR,
} from "@/lib/typography";

interface SubAccount {
  name: string;
  email: string;
  password: string;
}

interface NoteTopic {
  id: string;
  title: string;
  content: string;
  marker: "none" | "important" | "idea" | "action" | "question";
  open: boolean;
}

const SUBACCOUNTS_KEY = "redpower_subaccounts";
const NOTES_KEY = "redpower_notes_v2";
const MAX_ACCOUNTS = 3;

const MARKER_LABELS: Record<string, string> = {
  none: "",
  important: "Importante",
  idea: "Ideia",
  action: "Ação",
  question: "Dúvida",
};
const MARKER_EMOJI: Record<string, string> = {
  none: "",
  important: "🔴",
  idea: "💡",
  action: "✅",
  question: "❓",
};

function getSubAccounts(): SubAccount[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(SUBACCOUNTS_KEY) || "[]");
}
function saveSubAccounts(accounts: SubAccount[]) {
  localStorage.setItem(SUBACCOUNTS_KEY, JSON.stringify(accounts));
}
function getAllNotes(): Record<string, NoteTopic[]> {
  if (typeof window === "undefined") return {};
  return JSON.parse(localStorage.getItem(NOTES_KEY) || "{}");
}

type Tab = "perfil" | "membros" | "notas";

export default function ContaPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>("perfil");
  const [role, setRole] = useState<"titular" | "member">("titular");

  // Profile
  const [onboarding, setOnboarding] = useState<OnboardingData | null>(null);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwMsg, setPwMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Members
  const [subAccounts, setSubAccounts] = useState<SubAccount[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberPw, setMemberPw] = useState("");
  const [memberErr, setMemberErr] = useState("");
  const [showPwIdx, setShowPwIdx] = useState<number | null>(null);
  const [changePwIdx, setChangePwIdx] = useState<number | null>(null);
  const [changePwValue, setChangePwValue] = useState("");

  // Notes
  const [allNotes, setAllNotes] = useState<Record<string, NoteTopic[]>>({});
  const [noteSection, setNoteSection] = useState<string>("all");
  const [noteMarker, setNoteMarker] = useState<string>("all");
  const [editingNote, setEditingNote] = useState<{ sectionKey: string; noteId: string } | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [noteSearch, setNoteSearch] = useState("");

  const keepScroll = useCallback((fn: () => void) => {
    const y = window.scrollY;
    fn();
    requestAnimationFrame(() => window.scrollTo(0, y));
  }, []);

  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.replace("/login"); return; }
      setUserEmail(user.email || "");
      setRole(getUserRole());
      let ob = null;
      let notes: Record<string, { id: string; title: string; content: string; marker: string }[]> = {};
      try {
        [ob, notes] = await Promise.all([fetchOnboarding(), fetchAllNotes()]);
      } catch { /* API unavailable */ }
      if (Object.keys(notes).length === 0) {
        for (const lesson of LESSONS) {
          const cached = localStorage.getItem(`redpower_notes_${lesson.id}`);
          if (cached) {
            try { notes[String(lesson.id)] = JSON.parse(cached); } catch { /* skip */ }
          }
        }
        const cachedGeneral = localStorage.getItem("redpower_notes_general");
        if (cachedGeneral) {
          try { notes["general"] = JSON.parse(cachedGeneral); } catch { /* skip */ }
        }
      }
      setOnboarding(ob);
      setSubAccounts(getSubAccounts());
      const notesWithOpen: Record<string, NoteTopic[]> = {};
      for (const [k, v] of Object.entries(notes)) {
        notesWithOpen[k] = v.map(t => ({ ...t, open: false }) as NoteTopic);
      }
      setAllNotes(notesWithOpen);
      setReady(true);
    });
  }, [router]);

  if (!ready) return null;

  async function handlePasswordChange() {
    setPwMsg(null);
    if (!newPw || !confirmPw) { setPwMsg({ type: "err", text: "Preencha todos os campos." }); return; }
    if (newPw.length < 8) { setPwMsg({ type: "err", text: "A nova senha deve ter ao menos 8 caracteres." }); return; }
    if (newPw !== confirmPw) { setPwMsg({ type: "err", text: "As senhas não coincidem." }); return; }
    const supabase = getSupabaseBrowser();
    const { error } = await supabase.auth.updateUser({ password: newPw });
    if (error) { setPwMsg({ type: "err", text: error.message }); return; }
    setPwMsg({ type: "ok", text: "Senha alterada com sucesso." });
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
  }

  function handleAddMember() {
    setMemberErr("");
    if (!memberName.trim() || !memberEmail.trim() || !memberPw.trim()) { setMemberErr("Preencha todos os campos."); return; }
    if (memberPw.trim().length < 6) { setMemberErr("A senha deve ter ao menos 6 caracteres."); return; }
    if (subAccounts.length >= MAX_ACCOUNTS) { setMemberErr(`Limite de ${MAX_ACCOUNTS} contas atingido.`); return; }
    if (subAccounts.some((a) => a.email === memberEmail.trim())) { setMemberErr("Este e-mail já está cadastrado."); return; }
    const updated = [...subAccounts, { name: memberName.trim(), email: memberEmail.trim(), password: memberPw.trim() }];
    saveSubAccounts(updated); setSubAccounts(updated);
    setMemberName(""); setMemberEmail(""); setMemberPw(""); setShowForm(false);
  }

  function handleRemoveMember(idx: number) {
    if (!confirm(`Tem certeza que deseja remover ${subAccounts[idx].name}?`)) return;
    const updated = subAccounts.filter((_, i) => i !== idx);
    saveSubAccounts(updated); setSubAccounts(updated);
  }

  function handleChangeMemberPw(idx: number) {
    if (!changePwValue.trim() || changePwValue.trim().length < 6) return;
    const updated = subAccounts.map((a, i) => i === idx ? { ...a, password: changePwValue.trim() } : a);
    saveSubAccounts(updated); setSubAccounts(updated);
    setChangePwIdx(null); setChangePwValue("");
  }

  function handleDeleteNote(sectionKey: string, noteId: string) {
    if (!confirm("Tem certeza que deseja excluir esta nota?")) return;
    const updated = { ...allNotes };
    updated[sectionKey] = (updated[sectionKey] || []).filter((t) => t.id !== noteId);
    if (updated[sectionKey].length === 0) delete updated[sectionKey];
    setAllNotes(updated);
    const toSave = (updated[sectionKey] || []).map(({ open, ...rest }) => rest);
    saveNotesRemote(sectionKey, toSave).catch(() => {});
  }

  function handleStartEditNote(sectionKey: string, note: NoteTopic) {
    setEditingNote({ sectionKey, noteId: note.id });
    setEditTitle(note.title);
    setEditContent(note.content);
  }

  function handleSaveEditNote() {
    if (!editingNote) return;
    const updated = { ...allNotes };
    updated[editingNote.sectionKey] = (updated[editingNote.sectionKey] || []).map((t) =>
      t.id === editingNote.noteId ? { ...t, title: editTitle, content: editContent } : t
    );
    setAllNotes(updated);
    setEditingNote(null);
    const sectionKey = editingNote.sectionKey;
    const toSave = (updated[sectionKey] || []).map(({ open, ...rest }) => rest);
    saveNotesRemote(sectionKey, toSave).catch(() => {});
  }

  function exportNotesMarkdown() {
    let md = "# Minhas Anotações — Método Redrive\n\n";
    const general: NoteTopic[] = allNotes["general"] || [];
    if (general.length > 0) {
      md += "## Anotações Gerais\n\n";
      for (const t of general) {
        const marker = t.marker !== "none" ? ` ${MARKER_EMOJI[t.marker]} ${MARKER_LABELS[t.marker]}` : "";
        md += `### ${t.title}${marker}\n\n${t.content}\n\n`;
      }
      md += "---\n\n";
    }
    for (const lesson of LESSONS) {
      const topics: NoteTopic[] = allNotes[String(lesson.id)] || [];
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

  function exportNotesJSON() {
    const structured: { lesson: string; fase: string; topics: { title: string; content: string; marker: string }[] }[] = [];
    const general: NoteTopic[] = allNotes["general"] || [];
    if (general.length > 0) {
      structured.push({
        lesson: "Anotações Gerais",
        fase: "GERAL",
        topics: general.map((t) => ({ title: t.title, content: t.content, marker: t.marker })),
      });
    }
    for (const lesson of LESSONS) {
      const topics: NoteTopic[] = allNotes[String(lesson.id)] || [];
      if (topics.length === 0) continue;
      structured.push({
        lesson: lesson.title,
        fase: lesson.fase,
        topics: topics.map((t) => ({ title: t.title, content: t.content, marker: t.marker })),
      });
    }
    const blob = new Blob([JSON.stringify(structured, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "anotacoes-metodo-redrive.json"; a.click();
    URL.revokeObjectURL(url);
  }

  function exportSingleNoteMd(note: NoteTopic) {
    const marker = note.marker !== "none" ? ` ${MARKER_EMOJI[note.marker]} ${MARKER_LABELS[note.marker]}` : "";
    const md = `# ${note.title}${marker}\n\n${note.content}\n`;
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${note.title.replace(/[^a-zA-Z0-9À-ú ]/g, "").replace(/\s+/g, "-").toLowerCase()}.md`; a.click();
    URL.revokeObjectURL(url);
  }

  function exportSingleNoteJson(note: NoteTopic) {
    const blob = new Blob([JSON.stringify({ title: note.title, content: note.content, marker: note.marker }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${note.title.replace(/[^a-zA-Z0-9À-ú ]/g, "").replace(/\s+/g, "-").toLowerCase()}.json`; a.click();
    URL.revokeObjectURL(url);
  }

  function exportSectionMd(sectionKey: string, label: string, topics: NoteTopic[]) {
    let md = `# ${label}\n\n`;
    for (const t of topics) {
      const marker = t.marker !== "none" ? ` ${MARKER_EMOJI[t.marker]} ${MARKER_LABELS[t.marker]}` : "";
      md += `## ${t.title}${marker}\n\n${t.content}\n\n---\n\n`;
    }
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `notas-${sectionKey}.md`; a.click();
    URL.revokeObjectURL(url);
  }

  function exportSectionJson(sectionKey: string, label: string, topics: NoteTopic[]) {
    const data = { section: label, topics: topics.map((t) => ({ title: t.title, content: t.content, marker: t.marker })) };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `notas-${sectionKey}.json`; a.click();
    URL.revokeObjectURL(url);
  }

  const totalNotes = Object.values(allNotes).reduce((sum, topics) => sum + (topics as NoteTopic[]).length, 0);
  const lessonsWithNotes = Object.entries(allNotes).filter(([, topics]) => (topics as NoteTopic[]).length > 0).length;

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: "perfil", label: "Perfil",
      icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" /></svg>,
    },
    {
      id: "membros", label: "Membros",
      icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>,
    },
    {
      id: "notas", label: "Anotações",
      icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "var(--background)" }}>
      <LavaBackground />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/5" style={{ background: "rgba(8,8,8,0.9)", backdropFilter: "blur(20px)" }}>
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/metodo" className="flex items-center gap-2 text-camurca-texto transition-colors hover:text-white">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              <img src="/images/redpower-by-redrive.svg" alt="RedPower by Redrive" className="h-4 hidden sm:block" />
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <span className="font-display text-white" style={{ fontSize: 18, ...GLANCYR_LIGHT_CONDENSED }}>Minha Conta</span>
          </div>
          <span className="text-xs text-camurca-texto hidden sm:block">{userEmail}</span>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-10">
        {/* Tab navigation */}
        <div className="flex gap-1 rounded-2xl p-1 mb-8" style={{ background: "rgba(255,255,255,0.04)" }}>
          {TABS.filter((t) => !(t.id === "membros" && role === "member")).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm transition-all ${
                tab === t.id
                  ? "bg-vermelho-redrive text-white"
                  : "text-camurca-texto hover:text-white hover:bg-white/5"
              }`}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* ===== PERFIL ===== */}
        {tab === "perfil" && (
          <div className="space-y-6">
            {/* Account info */}
            <div className="rounded-[24px] border border-white/10 p-6 backdrop-blur-md" style={{ background: "rgba(8,8,8,0.65)" }}>
              <h2 className="font-display text-creme-destaque mb-4" style={{ fontSize: 22, ...GLANCYR_LIGHT_CONDENSED }}>
                Informações da conta
              </h2>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-vermelho-redrive text-white text-lg font-bold">
                  {(onboarding?.companyName || userEmail).charAt(0).toUpperCase()}
                </div>
                <div>
                  {onboarding?.companyName && (
                    <p className="text-bege-texto font-medium text-base" style={{ ...GLANCYR_BOLD_CONDENSED }}>{onboarding.companyName}</p>
                  )}
                  <p className="text-camurca-texto text-sm">{userEmail}</p>
                  <span className="inline-block mt-1 rounded-full bg-vermelho-redrive/10 px-2.5 py-0.5 text-[10px] text-vermelho-redrive font-semibold">
                    {role === "titular" ? "TITULAR" : "MEMBRO"}
                  </span>
                </div>
              </div>
              {onboarding && (
                <div className="rounded-xl bg-white/[0.03] border border-white/5 p-5 space-y-3 mb-5">
                  <p className="text-xs text-camurca-texto/60 font-semibold uppercase tracking-wider mb-2">Perfil da empresa</p>
                  {onboarding.segment && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-camurca-texto">Segmento</span>
                      <span className="text-sm text-bege-texto">{onboarding.segment}</span>
                    </div>
                  )}
                  {onboarding.teamSize && (
                    <>
                      <div className="h-px bg-white/5" />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-camurca-texto">Tamanho do time</span>
                        <span className="text-sm text-bege-texto">{onboarding.teamSize}</span>
                      </div>
                    </>
                  )}
                  {onboarding.mainChallenge && (
                    <>
                      <div className="h-px bg-white/5" />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-camurca-texto">Desafio principal</span>
                        <span className="text-sm text-bege-texto">{onboarding.mainChallenge}</span>
                      </div>
                    </>
                  )}
                  {onboarding.currentTools && (
                    <>
                      <div className="h-px bg-white/5" />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-camurca-texto">Ferramentas atuais</span>
                        <span className="text-sm text-bege-texto">{onboarding.currentTools}</span>
                      </div>
                    </>
                  )}
                  {onboarding.goal && (
                    <>
                      <div className="h-px bg-white/5" />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-camurca-texto">Objetivo</span>
                        <span className="text-sm text-bege-texto">{onboarding.goal}</span>
                      </div>
                    </>
                  )}
                </div>
              )}
              <div className="rounded-xl bg-white/[0.03] border border-white/5 p-5 space-y-4">
                <div>
                  <p className="text-xs text-camurca-texto mb-1">Programa</p>
                  <p className="text-base text-bege-texto font-medium" style={{ ...GLANCYR_BOLD_CONDENSED }}>RedPower</p>
                </div>
                <div className="h-px bg-white/5" />
                <div>
                  <p className="text-xs text-camurca-texto mb-1">Modalidade</p>
                  <div className="flex items-center gap-2">
                    <span className="text-base text-bege-texto font-medium" style={{ ...GLANCYR_BOLD_CONDENSED }}>RedUp</span>
                    <span className="rounded-full bg-vermelho-redrive/10 px-2 py-0.5 text-[10px] text-vermelho-redrive font-semibold">ATIVO</span>
                  </div>
                </div>
                <div className="h-px bg-white/5" />
                <div>
                  <p className="text-xs text-camurca-texto mb-1">Incluso no plano</p>
                  <ul className="space-y-1.5 mt-1">
                    <li className="flex items-center gap-2 text-sm text-bege-texto">
                      <span className="text-vermelho-redrive text-xs">●</span>
                      Método Redrive — 8 aulas com o Daniel
                    </li>
                    <li className="flex items-center gap-2 text-sm text-bege-texto">
                      <span className="text-vermelho-redrive text-xs">●</span>
                      Livro Magia da Conversa (impresso e e-book)
                    </li>
                    <li className="flex items-center gap-2 text-sm text-bege-texto">
                      <span className="text-vermelho-redrive text-xs">●</span>
                      Livro Chat First (impresso e e-book)
                    </li>
                    <li className="flex items-center gap-2 text-sm text-bege-texto">
                      <span className="text-vermelho-redrive text-xs">●</span>
                      Atualizações no método inclusas
                    </li>
                  </ul>
                </div>
                <div className="h-px bg-white/5" />
                <div>
                  <p className="text-xs text-camurca-texto mb-1">Acesso</p>
                  <p className="text-sm text-bege-texto font-medium">Vitalício</p>
                </div>
              </div>
            </div>

            {/* Upsell: Implantação — titular only */}
            {role === "titular" && (
            <div className="rounded-[24px] border border-vermelho-redrive/30 p-6 backdrop-blur-md relative overflow-hidden" style={{ background: "rgba(48,11,9,0.4)" }}>
              <div className="absolute top-0 right-0 w-[200px] h-[200px] rounded-full opacity-10 blur-[80px]" style={{ background: "var(--vermelho-redrive)" }} />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--vermelho-redrive)" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                  <span className="text-[10px] text-vermelho-redrive font-semibold uppercase tracking-wider">Upgrade disponível</span>
                </div>
                <h3 className="font-display text-creme-destaque mb-1" style={{ fontSize: 20, ...GLANCYR_BOLD_CONDENSED }}>
                  Implantação Assistida
                </h3>
                <p className="text-sm text-camurca-texto leading-relaxed mb-4 max-w-lg">
                  Tenha o time da Redrive configurando sua operação junto com você. Setup completo de agentes, jornadas, integrações e acompanhamento dedicado.
                </p>
                <a
                  href="https://redrive.com.br/implantacao"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-vermelho-redrive px-5 py-3 text-sm text-white transition-opacity hover:opacity-90"
                  style={{ ...GLANCYR_BOLD_CONDENSED }}
                >
                  Quero a Implantação
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </a>
              </div>
            </div>
            )}

            {/* Password change */}
            <div className="rounded-[24px] border border-white/10 p-6 backdrop-blur-md" style={{ background: "rgba(8,8,8,0.65)" }}>
              <h2 className="font-display text-creme-destaque mb-4" style={{ fontSize: 22, ...GLANCYR_LIGHT_CONDENSED }}>
                Alterar senha
              </h2>
              <div className="space-y-3 max-w-md">
                <div>
                  <label className="mb-1 block text-xs text-camurca-texto">Senha atual</label>
                  <input
                    type="password"
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-bege-texto outline-none placeholder:text-white/20 focus:border-vermelho-redrive"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-camurca-texto">Nova senha</label>
                  <input
                    type="password"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-bege-texto outline-none placeholder:text-white/20 focus:border-vermelho-redrive"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-camurca-texto">Confirmar nova senha</label>
                  <input
                    type="password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-bege-texto outline-none placeholder:text-white/20 focus:border-vermelho-redrive"
                  />
                </div>
                {pwMsg && (
                  <p className={`text-sm ${pwMsg.type === "ok" ? "text-green-400" : "text-vermelho-redrive"}`}>
                    {pwMsg.text}
                  </p>
                )}
                <button
                  onClick={handlePasswordChange}
                  className="rounded-xl bg-vermelho-redrive px-5 py-2.5 text-sm text-white font-medium transition-colors hover:bg-red-700"
                >
                  Salvar nova senha
                </button>
              </div>
            </div>

            {/* Danger zone */}
            <div className="rounded-[24px] border border-white/5 p-6 backdrop-blur-md" style={{ background: "rgba(8,8,8,0.45)" }}>
              <h2 className="font-display text-camurca-texto mb-3" style={{ fontSize: 18, ...GLANCYR_LIGHT_CONDENSED }}>
                Sessão
              </h2>
              <button
                onClick={async () => { await logout(); router.replace("/login"); }}
                className="rounded-xl bg-white/5 px-5 py-2.5 text-sm text-camurca-texto transition-colors hover:bg-red-500/10 hover:text-vermelho-redrive"
              >
                Sair da conta
              </button>
            </div>
          </div>
        )}

        {/* ===== MEMBROS ===== */}
        {tab === "membros" && (
          <div className="space-y-6">
            <div className="rounded-[24px] border border-white/10 p-6 backdrop-blur-md" style={{ background: "rgba(8,8,8,0.65)" }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-creme-destaque" style={{ fontSize: 22, ...GLANCYR_LIGHT_CONDENSED }}>
                    Membros da equipe
                  </h2>
                  <p className="mt-1 text-sm text-camurca-texto">
                    Sua compra permite até {MAX_ACCOUNTS} contas adicionais para acessar o conteúdo.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-camurca-texto" style={{ ...GLANCYR_THIN_CONDENSED_OBLIQUE }}>
                    {subAccounts.length}/{MAX_ACCOUNTS}
                  </span>
                  <div className="flex gap-1">
                    {Array.from({ length: MAX_ACCOUNTS }).map((_, i) => (
                      <div key={i} className="h-2.5 w-2.5 rounded-full" style={{ background: i < subAccounts.length ? "var(--vermelho-redrive)" : "rgba(255,255,255,0.1)" }} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Owner */}
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-vermelho-redrive text-white font-bold">
                    {userEmail.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-bege-texto font-medium">Titular da conta</p>
                    <p className="text-xs text-camurca-texto">{userEmail}</p>
                  </div>
                  <span className="rounded-full bg-vermelho-redrive/10 px-2.5 py-0.5 text-[10px] text-vermelho-redrive font-semibold">TITULAR</span>
                </div>
              </div>

              {/* Sub-accounts */}
              {subAccounts.map((acc, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-camurca-texto font-bold">
                      {acc.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-bege-texto">{acc.name}</p>
                      <p className="text-xs text-camurca-texto">{acc.email}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="text-[10px] text-camurca-texto/60">Senha:</span>
                        <span className="text-[11px] text-camurca-texto font-mono">{showPwIdx === i ? (acc.password || "•••") : "••••••"}</span>
                        <button onClick={() => setShowPwIdx(showPwIdx === i ? null : i)} className="text-camurca-texto/40 hover:text-camurca-texto transition-colors">
                          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                            {showPwIdx === i ? (
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            )}
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <button
                        onClick={() => { setChangePwIdx(changePwIdx === i ? null : i); setChangePwValue(""); }}
                        className="rounded-lg bg-white/5 p-2 text-camurca-texto transition-colors hover:bg-amber-500/10 hover:text-amber-400"
                        title="Alterar senha"
                      >
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleRemoveMember(i)}
                        className="rounded-lg bg-white/5 p-2 text-camurca-texto transition-colors hover:bg-red-500/10 hover:text-vermelho-redrive"
                        title="Remover membro"
                      >
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {changePwIdx === i && (
                    <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
                      <input
                        type="text"
                        value={changePwValue}
                        onChange={(e) => setChangePwValue(e.target.value)}
                        placeholder="Nova senha (mín. 6 caracteres)"
                        className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-bege-texto outline-none placeholder:text-white/20 focus:border-vermelho-redrive"
                      />
                      <button
                        onClick={() => handleChangeMemberPw(i)}
                        disabled={changePwValue.trim().length < 6}
                        className="rounded-lg bg-vermelho-redrive px-3 py-2 text-xs text-white font-medium hover:bg-red-700 disabled:opacity-30"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => { setChangePwIdx(null); setChangePwValue(""); }}
                        className="rounded-lg bg-white/5 px-3 py-2 text-xs text-camurca-texto hover:bg-white/10"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {/* Add form */}
              {subAccounts.length < MAX_ACCOUNTS && !showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full rounded-xl border border-dashed border-white/10 p-4 text-sm text-camurca-texto transition-colors hover:border-vermelho-redrive/30 hover:text-white flex items-center justify-center gap-2"
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                  Adicionar membro
                </button>
              )}

              {showForm && (
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs text-camurca-texto">Nome</label>
                      <input type="text" value={memberName} onChange={(e) => setMemberName(e.target.value)} placeholder="Nome do colaborador"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-bege-texto outline-none placeholder:text-white/20 focus:border-vermelho-redrive" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-camurca-texto">E-mail</label>
                      <input type="email" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} placeholder="email@empresa.com"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-bege-texto outline-none placeholder:text-white/20 focus:border-vermelho-redrive" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="mb-1 block text-xs text-camurca-texto">Senha de acesso</label>
                    <input type="text" value={memberPw} onChange={(e) => setMemberPw(e.target.value)} placeholder="Mínimo 6 caracteres"
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-bege-texto outline-none placeholder:text-white/20 focus:border-vermelho-redrive sm:max-w-[50%]" />
                    <p className="mt-1 text-[10px] text-camurca-texto/60">Compartilhe essa senha com o membro para que ele acesse a plataforma.</p>
                  </div>
                  {memberErr && <p className="mt-2 text-xs text-vermelho-redrive">{memberErr}</p>}
                  <div className="mt-3 flex gap-2">
                    <button onClick={handleAddMember} className="rounded-lg bg-vermelho-redrive px-4 py-2 text-sm text-white font-medium hover:bg-red-700">Adicionar</button>
                    <button onClick={() => { setShowForm(false); setMemberErr(""); setMemberName(""); setMemberEmail(""); setMemberPw(""); }} className="rounded-lg bg-white/5 px-4 py-2 text-sm text-camurca-texto hover:bg-white/10">Cancelar</button>
                  </div>
                </div>
              )}

              {subAccounts.length >= MAX_ACCOUNTS && (
                <p className="mt-4 text-xs text-camurca-texto text-center">Limite de {MAX_ACCOUNTS} membros atingido.</p>
              )}
            </div>
          </div>
        )}

        {/* ===== NOTAS ===== */}
        {tab === "notas" && (
          <div className="space-y-6">
            {/* Stats + export */}
            <div className="rounded-[24px] border border-white/10 p-6 backdrop-blur-md" style={{ background: "rgba(8,8,8,0.65)" }}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h2 className="font-display text-creme-destaque" style={{ fontSize: 22, ...GLANCYR_LIGHT_CONDENSED }}>
                    Todas as anotações
                  </h2>
                  <p className="mt-1 text-sm text-camurca-texto">
                    {totalNotes} {totalNotes === 1 ? "nota" : "notas"} em {lessonsWithNotes} {lessonsWithNotes === 1 ? "seção" : "seções"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={exportNotesMarkdown}
                    disabled={totalNotes === 0}
                    className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-sm text-bege-texto transition-colors hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                    Exportar .md
                  </button>
                  <button
                    onClick={exportNotesJSON}
                    disabled={totalNotes === 0}
                    className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-sm text-bege-texto transition-colors hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" /></svg>
                    Exportar .json
                  </button>
                </div>
              </div>

              <p className="text-xs text-camurca-texto/60 mb-4">
                Exporte suas anotações em Markdown (.md) para usar em ChatGPT, Claude, Notion ou qualquer ferramenta de IA.
              </p>

              {/* Search */}
              {totalNotes > 0 && (
                <div className="relative mb-4">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-camurca-texto/40">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  <input
                    value={noteSearch}
                    onChange={(e) => setNoteSearch(e.target.value)}
                    placeholder="Buscar nas notas..."
                    className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 py-2.5 text-sm text-bege-texto outline-none placeholder:text-white/20 focus:border-vermelho-redrive"
                  />
                  {noteSearch && (
                    <button onClick={() => setNoteSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-camurca-texto/40 hover:text-white">
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
              )}

              {/* Section filter */}
              {totalNotes > 0 && (
                <div className="mb-6">
                  {/* Primary filters */}
                  <div className="flex flex-wrap gap-1.5 items-start">
                    <button
                      onClick={() => keepScroll(() => { setNoteSection("all"); setNoteMarker("all"); })}
                      className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${noteSection === "all" ? "bg-vermelho-redrive text-white" : "bg-white/5 text-camurca-texto hover:bg-white/10 hover:text-white"}`}
                    >
                      Todas
                    </button>
                    {(allNotes["general"] as NoteTopic[] | undefined)?.length ? (
                      <div className="flex flex-col items-center">
                        <button
                          onClick={() => keepScroll(() => { setNoteSection("general"); setNoteMarker("all"); })}
                          className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${noteSection === "general" ? "bg-vermelho-redrive text-white" : "bg-white/5 text-camurca-texto hover:bg-white/10 hover:text-white"}`}
                        >
                          Gerais
                        </button>
                        {noteSection === "general" && <div className="w-px h-2.5 bg-vermelho-redrive/40" />}
                      </div>
                    ) : null}
                    {LESSONS.map((lesson) => {
                      const topics: NoteTopic[] = allNotes[String(lesson.id)] || [];
                      if (topics.length === 0) return null;
                      const isActive = noteSection === String(lesson.id);
                      return (
                        <div key={lesson.id} className="flex flex-col items-center">
                          <button
                            onClick={() => keepScroll(() => { setNoteSection(String(lesson.id)); setNoteMarker("all"); })}
                            className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${isActive ? "bg-vermelho-redrive text-white" : "bg-white/5 text-camurca-texto hover:bg-white/10 hover:text-white"}`}
                          >
                            Aula {String(lesson.id).padStart(2, "0")}
                          </button>
                          {isActive && <div className="w-px h-2.5 bg-vermelho-redrive/40" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Connected sub-filter box */}
                  {noteSection !== "all" && (
                    <div className="rounded-xl border border-vermelho-redrive/20 p-2 inline-flex flex-wrap gap-1" style={{ background: "rgba(255,0,0,0.03)" }}>
                      <button
                        onClick={() => keepScroll(() => setNoteMarker("all"))}
                        className={`rounded-md px-2.5 py-1 text-[11px] transition-colors ${noteMarker === "all" ? "bg-white/15 text-white" : "bg-white/5 text-camurca-texto hover:bg-white/10"}`}
                      >
                        Todas
                      </button>
                      {(["important", "idea", "action", "question"] as const).map((m) => (
                        <button
                          key={m}
                          onClick={() => keepScroll(() => setNoteMarker(m))}
                          className={`rounded-md px-2.5 py-1 text-[11px] transition-colors ${noteMarker === m ? "bg-white/15 text-white" : "bg-white/5 text-camurca-texto hover:bg-white/10"}`}
                        >
                          {MARKER_EMOJI[m]} {MARKER_LABELS[m]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {totalNotes === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 p-8 text-center">
                  <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1" className="mx-auto text-camurca-texto/30 mb-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <p className="text-sm text-camurca-texto">Nenhuma anotação ainda.</p>
                  <p className="text-xs text-camurca-texto/60 mt-1">Suas notas de cada aula aparecerão aqui.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(() => {
                    const searchLower = noteSearch.toLowerCase().trim();
                    const matchesSearch = (t: NoteTopic) => !searchLower || t.title.toLowerCase().includes(searchLower) || t.content.toLowerCase().includes(searchLower);
                    const sections: { key: string; label: string; badge: string; badgeStyle: React.CSSProperties; topics: NoteTopic[] }[] = [];
                    if (noteSection === "all" || noteSection === "general") {
                      const general = (allNotes["general"] || []) as NoteTopic[];
                      if (general.length > 0) {
                        const filtered = general.filter((t) => (noteMarker === "all" || t.marker === noteMarker) && matchesSearch(t));
                        if (filtered.length > 0) sections.push({ key: "general", label: "Anotações Gerais", badge: "GERAL", badgeStyle: { background: "rgba(255,255,255,0.08)", color: "var(--creme-destaque)" }, topics: filtered });
                      }
                    }
                    for (const lesson of LESSONS) {
                      if (noteSection !== "all" && noteSection !== String(lesson.id)) continue;
                      const topics = (allNotes[String(lesson.id)] || []) as NoteTopic[];
                      if (topics.length === 0) continue;
                      const filtered = topics.filter((t) => (noteMarker === "all" || t.marker === noteMarker) && matchesSearch(t));
                      if (filtered.length > 0) sections.push({ key: String(lesson.id), label: lesson.title, badge: lesson.fase, badgeStyle: { background: "rgba(255,0,0,0.15)", color: "var(--vermelho-redrive)" }, topics: filtered });
                    }
                    if (sections.length === 0) {
                      return (
                        <div className="rounded-xl border border-dashed border-white/10 p-6 text-center">
                          <p className="text-sm text-camurca-texto">Nenhuma nota com esse filtro.</p>
                        </div>
                      );
                    }
                    return sections.map((s, sIdx) => (
                      <div key={s.key}>
                        {sIdx > 0 && <div className="border-t border-white/5 my-5" />}
                        <div className="flex items-center gap-3 mb-3">
                          <span className="rounded-full px-3.5 py-1 text-xs font-semibold tracking-wide" style={s.badgeStyle}>{s.badge}</span>
                          <span className="text-sm text-bege-texto" style={{ ...GLANCYR_REGULAR }}>{s.label}</span>
                          <span className="text-xs text-camurca-texto">{s.topics.length} {s.topics.length === 1 ? "nota" : "notas"}</span>
                          <div className="ml-auto flex gap-1">
                            <button onClick={() => exportSectionMd(s.key, `${s.badge} — ${s.label}`, s.topics)} className="flex items-center gap-1 rounded-lg bg-white/5 px-2 py-1 text-[10px] text-camurca-texto hover:bg-white/10 hover:text-white transition-colors" title="Exportar seção .md">
                              <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                              .md
                            </button>
                            <button onClick={() => exportSectionJson(s.key, `${s.badge} — ${s.label}`, s.topics)} className="flex items-center gap-1 rounded-lg bg-white/5 px-2 py-1 text-[10px] text-camurca-texto hover:bg-white/10 hover:text-white transition-colors" title="Exportar seção .json">
                              <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                              .json
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {s.topics.map((t) => {
                            const isEditing = editingNote?.sectionKey === s.key && editingNote?.noteId === t.id;
                            return (
                            <div key={t.id} className="rounded-[16px] border border-white/5 bg-white/[0.03] p-4 flex flex-col">
                              {isEditing ? (
                                <>
                                  <input
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="w-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-sm text-bege-texto outline-none mb-2 focus:border-vermelho-redrive"
                                  />
                                  <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    rows={4}
                                    className="w-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-camurca-texto outline-none mb-2 resize-none focus:border-vermelho-redrive"
                                  />
                                  <div className="flex gap-1.5">
                                    <button onClick={handleSaveEditNote} className="rounded-lg bg-vermelho-redrive px-3 py-1.5 text-[10px] text-white font-medium hover:bg-red-700">Salvar</button>
                                    <button onClick={() => setEditingNote(null)} className="rounded-lg bg-white/5 px-3 py-1.5 text-[10px] text-camurca-texto hover:bg-white/10">Cancelar</button>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="flex items-start gap-2 mb-2">
                                    {t.marker !== "none" && (
                                      <span className="shrink-0 text-sm mt-0.5">{MARKER_EMOJI[t.marker]}</span>
                                    )}
                                    <h4 className="text-sm text-bege-texto font-medium flex-1 line-clamp-2">{t.title}</h4>
                                  </div>
                                  <p className="text-xs text-camurca-texto leading-relaxed whitespace-pre-wrap line-clamp-4 flex-1 mb-3">{t.content}</p>
                                  <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-white/5">
                                    <button onClick={() => handleStartEditNote(s.key, t)} className="flex items-center gap-1 rounded-lg bg-white/5 px-2.5 py-1.5 text-[10px] text-camurca-texto hover:bg-white/10 hover:text-white transition-colors" title="Editar">
                                      <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" /></svg>
                                    </button>
                                    <button onClick={() => handleDeleteNote(s.key, t.id)} className="flex items-center gap-1 rounded-lg bg-white/5 px-2.5 py-1.5 text-[10px] text-camurca-texto hover:bg-red-500/10 hover:text-vermelho-redrive transition-colors" title="Excluir">
                                      <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                                    </button>
                                    <div className="ml-auto flex gap-1">
                                      <button onClick={() => exportSingleNoteMd(t)} className="flex items-center gap-1 rounded-lg bg-white/5 px-2.5 py-1.5 text-[10px] text-camurca-texto hover:bg-white/10 hover:text-white transition-colors">
                                        <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                                        .md
                                      </button>
                                      <button onClick={() => exportSingleNoteJson(t)} className="flex items-center gap-1 rounded-lg bg-white/5 px-2.5 py-1.5 text-[10px] text-camurca-texto hover:bg-white/10 hover:text-white transition-colors">
                                        <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                                        .json
                                      </button>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                            );
                          })}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
