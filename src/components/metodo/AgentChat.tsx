"use client";

import { useState, useRef, useEffect } from "react";
import {
  GLANCYR_BOLD_CONDENSED,
  GLANCYR_THIN_CONDENSED_OBLIQUE,
  GLANCYR_REGULAR,
} from "@/lib/typography";

import { FormattedText } from "./FormattedText";

interface Message {
  role: "user" | "agent";
  text: string;
}

const INITIAL_MESSAGE: Message = {
  role: "agent",
  text: "Olá! Sou o assistente do Método Redrive. Posso te ajudar com dúvidas sobre as aulas, estratégias de vendas conversacionais, ou como aplicar o método na sua operação. Como posso ajudar?",
};

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export function AgentChat({ lessonContext, embedded }: { lessonContext?: string; embedded?: boolean }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  function exportChatMd() {
    let md = "# Conversa com Agente RedPower\n\n";
    for (const m of messages) {
      md += m.role === "user" ? `**Você:** ${m.text}\n\n` : `**Agente:** ${m.text}\n\n`;
    }
    downloadFile(md, "chat-agente-redpower.md", "text/markdown");
  }

  function exportChatJson() {
    downloadFile(JSON.stringify(messages.map((m) => ({ role: m.role, text: m.text })), null, 2), "chat-agente-redpower.json", "application/json");
  }

  async function handleSend() {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", text: input.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setTyping(true);

    try {
      const res = await fetch("/api/agent-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: 0,
          messages: updatedMessages.filter((m) => m.role !== "agent" || updatedMessages.indexOf(m) > 0).slice(-20),
          currentMinute: 0,
        }),
      });
      const data = await res.json();
      const agentMsg: Message = {
        role: "agent",
        text: data.reply || "Desculpe, não consegui processar. Tente novamente.",
      };
      setMessages((m) => [...m, agentMsg]);
    } catch {
      setMessages((m) => [...m, { role: "agent", text: "Ops, houve um erro de conexão. Tente novamente." }]);
    } finally {
      setTyping(false);
    }
  }

  if (!embedded && !open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="btn-lp fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-vermelho-redrive shadow-lg shadow-red-900/40"
        aria-label="Abrir chat do agente"
      >
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
    );
  }

  if (!embedded && !open) return null;

  const wrapperClass = embedded
    ? "flex flex-col flex-1 overflow-hidden"
    : "fixed bottom-6 right-6 z-50 flex w-[360px] max-w-[calc(100vw-48px)] flex-col overflow-hidden rounded-[24px] border border-white/10 shadow-2xl shadow-black/50";

  return (
    <div className={wrapperClass} style={embedded ? {} : { height: 520, background: "#0e0e0e" }}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-vermelho-redrive">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 2.47a2.25 2.25 0 01-1.59.659H9.06a2.25 2.25 0 01-1.591-.659L5 14.5m14 0V17a2.25 2.25 0 01-2.25 2.25H7.25A2.25 2.25 0 015 17v-2.5" />
            </svg>
          </div>
          <div>
            <p className="font-display text-white" style={{ fontSize: 14, ...GLANCYR_BOLD_CONDENSED }}>
              Agente RedPower
            </p>
            <p className="text-[10px] text-green-400" style={{ ...GLANCYR_THIN_CONDENSED_OBLIQUE }}>
              Online
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 1 && (
            <>
              <button onClick={exportChatMd} className="flex h-8 items-center gap-1 rounded-lg px-2 text-[10px] text-camurca-texto hover:bg-white/5 hover:text-white transition-colors" title="Exportar .md">
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                .md
              </button>
              <button onClick={exportChatJson} className="flex h-8 items-center gap-1 rounded-lg px-2 text-[10px] text-camurca-texto hover:bg-white/5 hover:text-white transition-colors" title="Exportar .json">
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                .json
              </button>
              <button onClick={() => { if (confirm("Tem certeza que deseja limpar a conversa?")) setMessages([INITIAL_MESSAGE]); }} className="flex h-8 w-8 items-center justify-center rounded-lg text-camurca-texto hover:bg-red-500/10 hover:text-vermelho-redrive transition-colors" title="Limpar conversa">
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
              </button>
            </>
          )}
          {!embedded && (
            <button onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full text-camurca-texto hover:bg-white/5 hover:text-white">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Quick actions — embedded only */}
      {embedded && (
        <div className="flex flex-wrap gap-1.5 border-b border-white/5 px-4 py-3">
          {[
            { label: "Criar nota", icon: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z", action: "criar_nota" },
            { label: "Resumir aula", icon: "M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z", action: "resumir" },
            { label: "Dúvida rápida", icon: "M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z", action: "duvida" },
            { label: "Plano de ação", icon: "M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z", action: "plano" },
          ].map((btn) => (
            <button
              key={btn.action}
              onClick={() => {
                const prompts: Record<string, string> = {
                  criar_nota: "Me ajude a criar uma nota sobre o que acabei de assistir",
                  resumir: "Resuma os pontos principais desta aula",
                  duvida: "Tenho uma dúvida sobre o conteúdo",
                  plano: "Me ajude a montar um plano de ação baseado nesta aula",
                };
                setInput(prompts[btn.action] || "");
              }}
              className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/[0.03] px-2.5 py-1.5 text-[11px] text-white/50 transition-colors hover:border-red-500/30 hover:bg-white/5 hover:text-white/80"
              style={{ ...GLANCYR_THIN_CONDENSED_OBLIQUE }}
            >
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d={btn.icon} />
              </svg>
              {btn.label}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-vermelho-redrive text-white rounded-br-md"
                  : "bg-white/5 text-bege-texto rounded-bl-md"
              }`}
            >
              {msg.role === "agent" ? <FormattedText text={msg.text} /> : msg.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="flex gap-1.5 rounded-2xl bg-white/5 px-4 py-3 rounded-bl-md">
              <span className="h-2 w-2 animate-bounce rounded-full bg-camurca-texto" style={{ animationDelay: "0ms" }} />
              <span className="h-2 w-2 animate-bounce rounded-full bg-camurca-texto" style={{ animationDelay: "150ms" }} />
              <span className="h-2 w-2 animate-bounce rounded-full bg-camurca-texto" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/10 px-4 py-3">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte sobre o método..."
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-bege-texto outline-none placeholder:text-white/20 focus:border-vermelho-redrive"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-vermelho-redrive text-white disabled:opacity-30"
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

function getSimulatedResponse(userText: string, lessonContext?: string): string {
  const lower = userText.toLowerCase();
  if (lower.includes("lead") || lower.includes("captação") || lower.includes("gerar")) {
    return "Na Fase 01 do método, a geração de leads é tratada como matéria-prima da operação. O segredo está em diversificar os canais — WhatsApp, Instagram, formulários web — e garantir que cada lead entre já com contexto suficiente para a ativação. Quer que eu detalhe algum canal específico?";
  }
  if (lower.includes("ia") || lower.includes("agente") || lower.includes("maestro")) {
    return "O Maestro é a IA generativa da Redrive. Ele aprende o tom de voz da sua operação e atende como seu melhor vendedor — 24h por dia. A configuração ideal envolve definir limites claros de quando a IA deve transferir para um humano. Isso é coberto na Fase 03 do método.";
  }
  if (lower.includes("jornada") || lower.includes("follow") || lower.includes("ativação")) {
    return "As jornadas de ativação são o coração da Fase 02. A ideia é manter o lead aquecido sem ser invasivo — usando timing inteligente, personalização baseada no contexto da conversa e cadência progressiva. Cada jornada deve ter um objetivo claro e um critério de saída.";
  }
  if (lower.includes("métrica") || lower.includes("dashboard") || lower.includes("resultado")) {
    return "Na Fase 04, você aprende a monitorar os indicadores que realmente importam: taxa de conversão por canal, tempo de resposta, taxa de reengajamento e custo por lead qualificado. O dashboard da Redrive consolida tudo isso em tempo real.";
  }
  if (lessonContext) {
    return `Boa pergunta! Sobre o tema desta aula (${lessonContext}): o mais importante é entender que cada conceito se conecta com as outras fases do método. Tente pensar em como isso se aplica na sua operação específica. Quer que eu ajude a criar um plano de ação?`;
  }
  return "Ótima pergunta! Isso se conecta diretamente com o que o Daniel ensina no método. O mais importante é entender o conceito por trás de cada configuração — não é sobre apertar botões, é sobre saber por que cada decisão impacta o resultado. Quer que eu aprofunde em algum ponto específico?";
}
