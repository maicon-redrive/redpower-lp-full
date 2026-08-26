import { getSupabaseBrowser } from "./supabase-browser";

const ONBOARDING_KEY = "redpower_onboarding";
const NOTES_KEY = "redpower_notes";
const PROGRESS_KEY = "redpower_progress";
const VIDEO_PROGRESS_KEY = "redpower_video_progress";

export async function isLoggedIn(): Promise<boolean> {
  const supabase = getSupabaseBrowser();
  const { data: { user } } = await supabase.auth.getUser();
  return !!user;
}

export function isLoggedInSync(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("redpower_session_active") === "true";
}

export async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseBrowser();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.message.includes("Invalid login")) {
      return { success: false, error: "E-mail ou senha incorretos." };
    }
    return { success: false, error: error.message };
  }
  localStorage.setItem("redpower_session_active", "true");
  return { success: true };
}

export async function signup(email: string, password: string): Promise<{ success: boolean; error?: string; needsConfirmation?: boolean }> {
  if (password.length < 8) {
    return { success: false, error: "A senha deve ter no mínimo 8 caracteres." };
  }
  const supabase = getSupabaseBrowser();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback?next=/metodo`,
    },
  });
  if (error) {
    if (error.message.includes("already registered")) {
      return { success: false, error: "Este e-mail já possui uma conta. Faça login." };
    }
    return { success: false, error: error.message };
  }
  if (data.user && !data.session) {
    return { success: true, needsConfirmation: true };
  }
  localStorage.setItem("redpower_session_active", "true");
  return { success: true };
}

export async function resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseBrowser();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function logout() {
  const supabase = getSupabaseBrowser();
  await supabase.auth.signOut();
  localStorage.removeItem("redpower_session_active");
}

export async function getUserEmail(): Promise<string> {
  const supabase = getSupabaseBrowser();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.email || "";
}

export function getUserEmailSync(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("redpower_email_cache") || "";
}

export function getUserRole(): "titular" | "member" {
  if (typeof window === "undefined") return "titular";
  return (localStorage.getItem("redpower_role") as "titular" | "member") || "titular";
}

export interface OnboardingData {
  companyName: string;
  segment: string;
  teamSize: string;
  mainChallenge: string;
  currentTools: string;
  goal: string;
}

export function getOnboarding(): OnboardingData | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(ONBOARDING_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function saveOnboarding(data: OnboardingData) {
  localStorage.setItem(ONBOARDING_KEY, JSON.stringify(data));
}

export function isOnboardingDone(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ONBOARDING_KEY) !== null;
}

export function getNotes(lessonId: number): string {
  if (typeof window === "undefined") return "";
  const all = JSON.parse(localStorage.getItem(NOTES_KEY) || "{}");
  return all[lessonId] || "";
}

export function saveNotes(lessonId: number, text: string) {
  const all = JSON.parse(localStorage.getItem(NOTES_KEY) || "{}");
  all[lessonId] = text;
  localStorage.setItem(NOTES_KEY, JSON.stringify(all));
}

export function getProgress(): number[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "[]");
}

export function getVideoProgress(lessonId: number): number {
  if (typeof window === "undefined") return 0;
  const all = JSON.parse(localStorage.getItem(VIDEO_PROGRESS_KEY) || "{}");
  return all[lessonId] || 0;
}

export function saveVideoProgress(lessonId: number, seconds: number) {
  const all = JSON.parse(localStorage.getItem(VIDEO_PROGRESS_KEY) || "{}");
  all[lessonId] = seconds;
  localStorage.setItem(VIDEO_PROGRESS_KEY, JSON.stringify(all));
}

export function markComplete(lessonId: number) {
  const progress = getProgress();
  if (!progress.includes(lessonId)) {
    progress.push(lessonId);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  }
}

export function isLessonUnlocked(lessonId: number): boolean {
  if (lessonId === 1) return true;
  const progress = getProgress();
  return progress.includes(lessonId - 1);
}
