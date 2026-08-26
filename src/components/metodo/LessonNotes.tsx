"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { GLANCYR_REGULAR, GLANCYR_THIN_CONDENSED_OBLIQUE, GLANCYR_BOLD_CONDENSED } from "@/lib/typography";
import { fetchNotes, saveNotesRemote } from "@/lib/user-data";

interface NoteTopic {
  id: string;
  title: string;
  content: string;
  marker: "none" | "important" | "idea" | "action" | "question";
  open: boolean;
}

const MARKER_CONFIG = {
  none: { label: "Sem marcador", color: "transparent", icon: "" },
  important: { label: "Importante", color: "#ff4444", icon: "🔴" },
  idea: { label: "Ideia", color: "#ffb347", icon: "💡" },
  action: { label: "Ação", color: "#67D43F", icon: "✅" },
  question: { label: "Dúvida", color: "#47d4ff", icon: "❓" },
} as const;

function MarkerPicker({ value, onChange }: { value: NoteTopic["marker"]; onChange: (m: NoteTopic["marker"]) => void }) {
  const markers: NoteTopic["marker"][] = ["important", "idea", "action", "question"];
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      {markers.map((m) => (
        <button
          key={m}
          onClick={() => onChange(value === m ? "none" : m)}
          className={`flex h-5 w-5 items-center justify-center rounded text-xs transition-opacity ${value === m ? "opacity-100" : "opacity-30 hover:opacity-60"}`}
          title={MARKER_CONFIG[m].label}
        >
          {MARKER_CONFIG[m].icon}
        </button>
      ))}
    </div>
  );
}

export function LessonNotes({ lessonId }: { lessonId: number }) {
  const [topics, setTopics] = useState<NoteTopic[]>([]);
  const [saved, setSaved] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const key = `redpower_notes_${lessonId}`;
    const cached = localStorage.getItem(key);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as NoteTopic[];
        setTopics(parsed.map((n) => ({ ...n, open: false })));
      } catch { /* ignore */ }
    }
    fetchNotes(String(lessonId))
      .then((notes) => {
        if (notes.length > 0) {
          setTopics(notes.map((n) => ({ ...n, open: false })));
          localStorage.setItem(key, JSON.stringify(notes));
        }
      })
      .catch(() => { /* localStorage already loaded */ });
  }, [lessonId]);

  const persist = useCallback(
    (updated: NoteTopic[]) => {
      setTopics(updated);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        const toSave = updated.map(({ open, ...rest }) => rest);
        localStorage.setItem(`redpower_notes_${lessonId}`, JSON.stringify(toSave));
        saveNotesRemote(String(lessonId), toSave)
          .then(() => {
            setSaved(true);
            setTimeout(() => setSaved(false), 1500);
          })
          .catch(() => {
            setSaved(true);
            setTimeout(() => setSaved(false), 1500);
          });
      }, 800);
    },
    [lessonId],
  );

  function addTopic() {
    const newTopic: NoteTopic = {
      id: Date.now().toString(),
      title: "",
      content: "",
      marker: "none",
      open: true,
    };
    persist([...topics, newTopic]);
  }

  function updateTopic(id: string, patch: Partial<NoteTopic>) {
    persist(topics.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  function removeTopic(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta nota?")) return;
    persist(topics.filter((t) => t.id !== id));
  }

  function toggleTopic(id: string) {
    setTopics(topics.map((t) => (t.id === id ? { ...t, open: !t.open } : t)));
  }

  function handleDragStart(idx: number) {
    setDragIdx(idx);
  }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    setDragOverIdx(idx);
  }

  function handleDrop(idx: number) {
    if (dragIdx === null || dragIdx === idx) {
      setDragIdx(null);
      setDragOverIdx(null);
      return;
    }
    const updated = [...topics];
    const [moved] = updated.splice(dragIdx, 1);
    updated.splice(idx, 0, moved);
    persist(updated);
    setDragIdx(null);
    setDragOverIdx(null);
  }

  return (
    <div className="flex h-full flex-col rounded-[20px] border border-white/10 overflow-hidden" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)" }}>
      <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--vermelho-redrive)" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
          <p className="font-display text-sm text-bege-texto" style={{ ...GLANCYR_REGULAR }}>
            Anotações
          </p>
          {saved && (
            <span className="text-[10px] text-green-400" style={{ ...GLANCYR_THIN_CONDENSED_OBLIQUE }}>
              ✓ Salvo
            </span>
          )}
        </div>
        <button
          onClick={addTopic}
          className="flex items-center gap-1.5 rounded-lg bg-vermelho-redrive/10 px-3 py-1.5 text-xs text-vermelho-redrive transition-colors hover:bg-vermelho-redrive/20"
        >
          <span className="text-base leading-none">+</span> Novo tópico
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-3 border-b border-white/10 px-4 py-2">
        {(Object.entries(MARKER_CONFIG) as [NoteTopic["marker"], typeof MARKER_CONFIG["none"]][])
          .filter(([k]) => k !== "none")
          .map(([key, cfg]) => (
            <span key={key} className="flex items-center gap-1 text-[10px] text-camurca-texto">
              <span>{cfg.icon}</span> {cfg.label}
            </span>
          ))}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {topics.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-camurca-texto/60">Nenhuma anotação ainda</p>
            <p className="mt-1 text-xs text-camurca-texto/40">
              Clique em &quot;+ Novo tópico&quot; para começar
            </p>
          </div>
        )}

        {topics.map((topic, idx) => (
          <div
            key={topic.id}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDrop={() => handleDrop(idx)}
            onDragEnd={() => { setDragIdx(null); setDragOverIdx(null); }}
            className={`rounded-xl border transition-all ${
              dragOverIdx === idx && dragIdx !== idx
                ? "border-vermelho-redrive/50 bg-vermelho-redrive/5"
                : "border-white/10 bg-white/[0.06]"
            } ${dragIdx === idx ? "opacity-50" : ""}`}
          >
            <div className="flex items-center gap-2 px-3 py-2.5">
              <span className="shrink-0 cursor-grab text-camurca-texto/30 hover:text-camurca-texto active:cursor-grabbing">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <circle cx="3" cy="2" r="1" /><circle cx="7" cy="2" r="1" />
                  <circle cx="3" cy="6" r="1" /><circle cx="7" cy="6" r="1" />
                  <circle cx="3" cy="10" r="1" /><circle cx="7" cy="10" r="1" />
                </svg>
              </span>

              <MarkerPicker
                value={topic.marker}
                onChange={(m) => updateTopic(topic.id, { marker: m })}
              />

              <button
                onClick={() => toggleTopic(topic.id)}
                className="flex-1 text-left"
              >
                <input
                  value={topic.title}
                  onChange={(e) => updateTopic(topic.id, { title: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Título do tópico..."
                  className="w-full bg-transparent text-sm text-bege-texto outline-none placeholder:text-white/30"
                  style={{ ...GLANCYR_REGULAR }}
                />
              </button>

              <button onClick={() => toggleTopic(topic.id)} className="shrink-0 text-camurca-texto/40">
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`transition-transform ${topic.open ? "rotate-180" : ""}`}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              <button
                onClick={() => removeTopic(topic.id)}
                className="shrink-0 text-camurca-texto/20 transition-colors hover:text-vermelho-redrive"
                title="Remover tópico"
              >
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {topic.open && (
              <div className="border-t border-white/10 px-3 py-2.5">
                <textarea
                  value={topic.content}
                  onChange={(e) => updateTopic(topic.id, { content: e.target.value })}
                  placeholder="Escreva suas anotações, insights, ideias..."
                  className="min-h-[80px] w-full resize-y bg-transparent text-[13px] leading-relaxed text-bege-texto outline-none placeholder:text-white/25"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
