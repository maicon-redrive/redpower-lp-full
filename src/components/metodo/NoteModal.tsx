"use client";

import { useState } from "react";
import { GLANCYR_REGULAR, GLANCYR_BOLD_CONDENSED } from "@/lib/typography";
import { fetchNotes, saveNotesRemote } from "@/lib/user-data";

type Marker = "none" | "important" | "idea" | "action" | "question";

const MARKER_CONFIG: Record<Marker, { label: string; icon: string }> = {
  none: { label: "Sem marcador", icon: "" },
  important: { label: "Importante", icon: "🔴" },
  idea: { label: "Ideia", icon: "💡" },
  action: { label: "Ação", icon: "✅" },
  question: { label: "Dúvida", icon: "❓" },
};

interface NoteModalProps {
  lessonId: number;
  initialContent?: string;
  onClose: () => void;
}

export function NoteModal({ lessonId, initialContent = "", onClose }: NoteModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(initialContent);
  const [marker, setMarker] = useState<Marker>("none");

  async function save() {
    const cacheKey = `redpower_notes_${lessonId}`;
    let existing: { id: string; title: string; content: string; marker: "none" | "important" | "idea" | "action" | "question" }[] = [];
    const cached = localStorage.getItem(cacheKey);
    if (cached) try { existing = JSON.parse(cached); } catch { /* skip */ }
    if (existing.length === 0) {
      try { existing = await fetchNotes(String(lessonId)); } catch { /* skip */ }
    }
    existing.push({
      id: Date.now().toString(),
      title,
      content,
      marker,
    });
    localStorage.setItem(cacheKey, JSON.stringify(existing));
    try {
      await saveNotesRemote(String(lessonId), existing);
    } catch { /* remote save failed */ }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md rounded-2xl border border-white/10 p-5"
        style={{ background: "rgba(20,4,3,0.97)", backdropFilter: "blur(24px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm text-bege-texto mb-4" style={{ ...GLANCYR_BOLD_CONDENSED }}>
          Nova anotação
        </h3>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título da nota..."
          autoFocus
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-bege-texto outline-none placeholder:text-white/20 focus:border-vermelho-redrive mb-3"
          style={{ ...GLANCYR_REGULAR }}
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Conteúdo da nota..."
          rows={4}
          className="w-full resize-y rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[13px] leading-relaxed text-bege-texto outline-none placeholder:text-white/20 focus:border-vermelho-redrive mb-3"
        />

        <div className="flex items-center gap-2 mb-4">
          <span className="text-[11px] text-camurca-texto mr-1">Marcador:</span>
          {(Object.entries(MARKER_CONFIG) as [Marker, { label: string; icon: string }][])
            .filter(([k]) => k !== "none")
            .map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setMarker(marker === key ? "none" : key)}
                className={`flex h-6 w-6 items-center justify-center rounded text-xs transition-opacity ${marker === key ? "opacity-100 ring-1 ring-white/30" : "opacity-40 hover:opacity-70"}`}
                title={cfg.label}
              >
                {cfg.icon}
              </button>
            ))}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-white/10 px-4 py-2 text-xs text-camurca-texto hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={save}
            className="rounded-lg bg-vermelho-redrive px-4 py-2 text-xs text-white hover:brightness-110 transition"
          >
            Salvar nota
          </button>
        </div>
      </div>
    </div>
  );
}
