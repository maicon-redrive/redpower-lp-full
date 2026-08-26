import { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { LESSONS } from "@/lib/course";
import { LESSON_TRIGGERS } from "@/lib/triggers";
import { LESSON_CONTENT } from "@/lib/lesson-content";

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_URL = process.env.GROQ_API_URL || "https://api.groq.com/openai/v1/chat/completions";
const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

function buildSystemPrompt(lessonId: number, currentMinute: number): string {
  const lesson = LESSONS.find((l) => l.id === lessonId);
  const triggers = (LESSON_TRIGGERS[lessonId] || []).filter(
    (t) => t.minuteMark <= currentMinute
  );

  const triggerContext = triggers.length
    ? `\n\nGatilhos já disparados nesta aula (contexto do que o aluno já viu):\n${triggers.map((t) => `- Minuto ${t.minuteMark}: ${t.message}`).join("\n")}`
    : "";

  const lessonContent = LESSON_CONTENT[lessonId] || "";

  return `Você é o Agente RedPower, assistente de IA do curso Método Redrive criado por Daniel Reginatto. Você acompanha o aluno durante as videoaulas sobre vendas conversacionais por WhatsApp.

CONTEXTO DA AULA ATUAL:
- Aula ${lessonId}/8: "${lesson?.title || ""}"
- Descrição: ${lesson?.description || ""}
- Minuto atual do vídeo: ${currentMinute}
${triggerContext}

CONTEÚDO DETALHADO DESTA AULA (use estas informações para responder com precisão):
${lessonContent}

REGRAS DE COMPORTAMENTO:
1. Seja direto, prático e motivador. Use linguagem informal brasileira (sem gírias excessivas).
2. Sempre conecte suas respostas ao conteúdo ESPECÍFICO desta aula — cite os dados, exemplos e estatísticas que o Daniel apresentou.
3. Incentive o aluno a tomar notas e criar planos de ação concretos.
4. Quando o aluno perguntar algo fora do escopo (vendas conversacionais, WhatsApp, CRM, prospecção, IA para vendas), redirecione gentilmente.
5. Respostas curtas e objetivas — máximo 3 parágrafos. O aluno está assistindo vídeo, não quer ler um texto longo.
FORMATAÇÃO: Use **negrito** para destacar conceitos-chave. Use listas com "- " para enumerar pontos. Separe parágrafos com linha em branco. Nunca use # para títulos.
6. Quando o aluno perguntar sobre algo que o Daniel falou, use os dados exatos da transcrição acima.
7. Quando fizer sentido, sugira criar um tópico nas notas com marcador específico.
8. Nunca invente dados ou funcionalidades da plataforma Redrive que você não conhece.
9. O curso é sobre o MÉTODO de vendas conversacionais, não sobre como usar o software Redrive em si.
10. Se o aluno pedir exemplos de mensagens, use os exemplos reais que o Daniel mostrou na aula.`;
}

export async function POST(req: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll(); },
        setAll() {},
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!GROQ_API_KEY) {
    return Response.json({ error: "API key not configured" }, { status: 500 });
  }

  const body = await req.json();
  const { lessonId, messages, currentMinute } = body as {
    lessonId: number;
    messages: { role: string; text: string }[];
    currentMinute: number;
  };

  if (lessonId == null || !messages?.length) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  const systemPrompt = buildSystemPrompt(lessonId, currentMinute || 0);

  const groqMessages = [
    { role: "system", content: systemPrompt },
    ...messages.slice(-20).map((m) => ({
      role: m.role === "agent" ? "assistant" : "user",
      content: m.text,
    })),
  ];

  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: groqMessages,
        max_tokens: 500,
        temperature: 0.7,
        stream: false,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[AGENT] Groq error:", err);
      return Response.json({ error: "AI service error" }, { status: 502 });
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || "Desculpe, não consegui processar. Tente novamente.";

    return Response.json({ reply });
  } catch (e) {
    console.error("[AGENT] Error:", e);
    return Response.json({ error: "Connection error" }, { status: 500 });
  }
}
