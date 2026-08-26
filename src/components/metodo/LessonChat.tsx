"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  GLANCYR_BOLD_CONDENSED,
  GLANCYR_THIN_CONDENSED_OBLIQUE,
  GLANCYR_REGULAR,
} from "@/lib/typography";
import { NoteModal } from "./NoteModal";
import { FormattedText } from "./FormattedText";

export interface ChatMessage {
  role: "user" | "agent";
  text: string;
  isTrigger?: boolean;
  isNew?: boolean;
}

const CHAT_STORAGE_KEY = "redpower_chat_v1";

function loadChat(lessonId: number): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return [];
    const all = JSON.parse(raw);
    return all[lessonId] || [];
  } catch { return []; }
}

function saveChat(lessonId: number, messages: ChatMessage[]) {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : {};
    all[lessonId] = messages;
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(all));
  } catch { /* ignore */ }
}

async function fetchAIResponse(
  lessonId: number,
  messages: ChatMessage[],
  currentMinute: number
): Promise<string> {
  try {
    const res = await fetch("/api/agent-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, messages, currentMinute }),
    });
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    return data.reply;
  } catch {
    return "Desculpe, tive um problema de conexão. Tente novamente em alguns segundos.";
  }
}

export function getResponse(text: string, lessonTitle: string): string {
  return `Boa reflexão sobre "${lessonTitle}"! Estou processando...`;
}

export function LessonChat({
  lessonId,
  lessonTitle,
  messages,
  setMessages,
  typing,
  currentMinute,
}: {
  lessonId: number;
  lessonTitle: string;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  typing: boolean;
  currentMinute?: number;
}) {
  const [input, setInput] = useState("");
  const [aiTyping, setAiTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [noteModal, setNoteModal] = useState<{ content: string } | null>(null);

  useEffect(() => {
    const saved = loadChat(lessonId);
    if (saved.length > 0) {
      setMessages(saved);
    }
  }, [lessonId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (messages.length > 1) saveChat(lessonId, messages);
  }, [messages, lessonId]);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  }, [messages, typing, aiTyping]);

  function exportChatMd() {
    let md = `# Chat — ${lessonTitle}\n\n`;
    for (const m of messages) {
      const label = m.role === "user" ? "Você" : m.isTrigger ? "Agente (gatilho)" : "Agente";
      md += `**${label}:** ${m.text}\n\n`;
    }
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `chat-aula-${lessonId}.md`; a.click();
    URL.revokeObjectURL(url);
  }

  function exportChatJson() {
    const data = messages.map((m) => ({ role: m.role, text: m.text, isTrigger: !!m.isTrigger }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `chat-aula-${lessonId}.json`; a.click();
    URL.revokeObjectURL(url);
  }

  const handleSend = useCallback(async () => {
    if (!input.trim()) return;
    const userText = input.trim();
    const updatedMessages: ChatMessage[] = [...messages, { role: "user", text: userText }];
    setMessages(updatedMessages);
    setInput("");
    setAiTyping(true);
    const reply = await fetchAIResponse(lessonId, updatedMessages, currentMinute || 0);
    setAiTyping(false);
    setMessages((m) => [...m, { role: "agent", text: reply }]);
  }, [input, messages, lessonId, currentMinute, setMessages]);

  return (
    <div className="flex h-full flex-col" style={{ background: "rgba(255,255,255,0.02)" }}>
      {/* Header */}
      <div className="shrink-0 border-b border-white/5 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-vermelho-redrive">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 2.47a2.25 2.25 0 01-1.59.659H9.06a2.25 2.25 0 01-1.591-.659L5 14.5m14 0V17a2.25 2.25 0 01-2.25 2.25H7.25A2.25 2.25 0 015 17v-2.5" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-display text-sm text-white" style={{ ...GLANCYR_BOLD_CONDENSED }}>
              Agente RedPower
            </p>
            <p className="flex items-center gap-1.5 text-[10px] text-green-400" style={{ ...GLANCYR_THIN_CONDENSED_OBLIQUE }}>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400" />
              Acompanhando a aula
            </p>
          </div>
          {messages.length > 1 && (
            <div className="flex items-center gap-0.5">
              <button onClick={exportChatMd} className="flex h-7 items-center gap-1 rounded-md px-1.5 text-[9px] text-camurca-texto hover:bg-white/5 hover:text-white transition-colors" title="Exportar .md">
                <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                .md
              </button>
              <button onClick={exportChatJson} className="flex h-7 items-center gap-1 rounded-md px-1.5 text-[9px] text-camurca-texto hover:bg-white/5 hover:text-white transition-colors" title="Exportar .json">
                <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                .json
              </button>
              <button onClick={() => { if (confirm("Tem certeza que deseja limpar a conversa?")) setMessages([{ role: "agent", text: `Olá! Estou acompanhando a aula "${lessonTitle}" com você. Conforme o vídeo avançar, vou trazer pontos pra gente discutir e te ajudar a extrair o máximo do conteúdo. Pode me perguntar qualquer coisa a qualquer momento!` }]); }} className="flex h-7 items-center gap-1 rounded-md px-1.5 text-[9px] text-camurca-texto hover:bg-red-500/10 hover:text-vermelho-redrive transition-colors" title="Limpar conversa">
                <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`group flex items-end gap-1 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "user" && i > 0 && (
              <button
                onClick={() => setNoteModal({ content: msg.text })}
                className="mb-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity text-camurca-texto hover:text-vermelho-redrive"
                title="Salvar como nota"
              >
                <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
              </button>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                msg.role === "user"
                  ? "bg-vermelho-redrive text-white rounded-br-md"
                  : msg.isTrigger
                    ? `bg-vermelho-redrive/5 text-bege-texto rounded-bl-md ${msg.isNew ? "comet-border" : "border border-vermelho-redrive/20"}`
                    : "bg-white/5 text-bege-texto rounded-bl-md"
              }`}
            >
              {msg.isTrigger && (
                <span className="mb-1 flex items-center gap-1 text-[10px] text-vermelho-redrive" style={{ ...GLANCYR_THIN_CONDENSED_OBLIQUE }}>
                  <svg width="10" height="10" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  Gatilho do vídeo
                </span>
              )}
              {msg.role === "agent" ? <FormattedText text={msg.text} /> : msg.text}
            </div>
            {msg.role !== "user" && i > 0 && (
              <button
                onClick={() => setNoteModal({ content: msg.text })}
                className="mb-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity text-camurca-texto hover:text-vermelho-redrive"
                title="Salvar como nota"
              >
                <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
              </button>
            )}
          </div>
        ))}
        {(typing || aiTyping) && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-3 rounded-bl-md">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-camurca-texto" style={{ animationDelay: "0ms" }} />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-camurca-texto" style={{ animationDelay: "150ms" }} />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-camurca-texto" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="shrink-0 px-3 pt-3 flex flex-wrap gap-2">
        {([
          { label: "Criar nota", icon: <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>, action: "note" },
          { label: "Resumir aula", icon: <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" /></svg>, action: "resumir" },
          { label: "Dúvida rápida", icon: <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3m.08 4h.01" /></svg>, action: "duvida" },
          { label: "Plano de ação", icon: <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>, action: "plano" },
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
                setInput(prompts[item.action] || "");
              }
            }}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-[11px] text-white/50 hover:text-white hover:border-vermelho-redrive/30 transition-colors"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-white/5 px-3 py-3 mt-2">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte sobre a aula..."
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] text-bege-texto outline-none placeholder:text-white/20 focus:border-vermelho-redrive"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-vermelho-redrive text-white disabled:opacity-30"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </form>
      </div>

      {noteModal && (
        <NoteModal
          lessonId={lessonId}
          initialContent={noteModal.content}
          onClose={() => setNoteModal(null)}
        />
      )}
    </div>
  );
}
