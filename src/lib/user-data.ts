import type { OnboardingData } from "./auth";

interface NoteTopic {
  id: string;
  title: string;
  content: string;
  marker: "none" | "important" | "idea" | "action" | "question";
}

interface AllUserData {
  onboarding: OnboardingData | null;
  notes: { lesson_key: string; topic_id: string; title: string; content: string; marker: string; sort_order: number }[];
  progress: number[];
  videoProgress: Record<number, number>;
}

async function api(path: string, opts?: RequestInit) {
  const res = await fetch(path, opts);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(`[user-data] API ${res.status}: ${text}`);
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}

export async function fetchAllUserData(): Promise<AllUserData> {
  const data = await api("/api/user-data?type=all");
  return {
    onboarding: data.onboarding
      ? {
          companyName: data.onboarding.company_name,
          segment: data.onboarding.segment,
          teamSize: data.onboarding.team_size,
          mainChallenge: data.onboarding.main_challenge,
          currentTools: data.onboarding.current_tools,
          goal: data.onboarding.goal,
        }
      : null,
    notes: data.notes || [],
    progress: data.progress || [],
    videoProgress: data.videoProgress || {},
  };
}

export async function fetchOnboarding(): Promise<OnboardingData | null> {
  const { data } = await api("/api/user-data?type=onboarding");
  if (!data) return null;
  return {
    companyName: data.company_name,
    segment: data.segment,
    teamSize: data.team_size,
    mainChallenge: data.main_challenge,
    currentTools: data.current_tools,
    goal: data.goal,
  };
}

export async function saveOnboardingRemote(data: OnboardingData): Promise<void> {
  localStorage.setItem("redpower_onboarding", JSON.stringify(data));
  await api("/api/user-data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "onboarding", ...data }),
  });
}

export async function fetchNotes(lessonKey: string): Promise<NoteTopic[]> {
  const { data } = await api(`/api/user-data?type=notes&lesson=${lessonKey}`);
  return (data || []).map((r: Record<string, unknown>) => ({
    id: r.topic_id as string,
    title: r.title as string,
    content: r.content as string,
    marker: r.marker as string,
  }));
}

export async function fetchAllNotes(): Promise<Record<string, NoteTopic[]>> {
  const { data } = await api("/api/user-data?type=notes");
  const grouped: Record<string, NoteTopic[]> = {};
  for (const r of data || []) {
    const key = r.lesson_key as string;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push({
      id: r.topic_id,
      title: r.title,
      content: r.content,
      marker: r.marker,
    });
  }
  return grouped;
}

export async function saveNotesRemote(lessonKey: string, topics: NoteTopic[]): Promise<void> {
  await api("/api/user-data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "notes", lessonKey, topics }),
  });
}

export async function fetchProgress(): Promise<number[]> {
  const { data } = await api("/api/user-data?type=progress");
  return data || [];
}

export async function markCompleteRemote(lessonId: number): Promise<void> {
  await api("/api/user-data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "mark_complete", lessonId }),
  });
}

export async function fetchVideoProgress(): Promise<Record<number, number>> {
  const { data } = await api("/api/user-data?type=video_progress");
  return data || {};
}

export async function saveVideoProgressRemote(lessonId: number, seconds: number): Promise<void> {
  await api("/api/user-data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "video_progress", lessonId, seconds }),
  });
}
