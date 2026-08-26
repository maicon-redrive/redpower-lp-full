import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

function createSupabaseAndResponse(req: NextRequest) {
  let response = NextResponse.json({});
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll(); },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );
  return { supabase, getResponse: (body: Record<string, unknown>, init?: { status?: number }) => {
    const newRes = NextResponse.json(body, init);
    for (const [name, cookie] of response.cookies.getAll().entries()) {
      newRes.cookies.set(cookie.name, cookie.value);
    }
    return newRes;
  }};
}

export async function GET(req: NextRequest) {
  const { supabase, getResponse } = createSupabaseAndResponse(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return getResponse({ error: "Unauthorized" }, { status: 401 });

  const type = req.nextUrl.searchParams.get("type");

  if (type === "onboarding") {
    const { data } = await supabase
      .from("user_onboarding")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    return getResponse({ data });
  }

  if (type === "notes") {
    const lessonKey = req.nextUrl.searchParams.get("lesson");
    let query = supabase
      .from("user_notes")
      .select("*")
      .eq("user_id", user.id)
      .order("sort_order", { ascending: true });
    if (lessonKey) query = query.eq("lesson_key", lessonKey);
    const { data, error } = await query;
    if (error) console.error("[user-data] notes fetch error:", error.message);
    return getResponse({ data: data || [] });
  }

  if (type === "progress") {
    const { data } = await supabase
      .from("user_progress")
      .select("lesson_id")
      .eq("user_id", user.id);
    return getResponse({ data: (data || []).map((r) => r.lesson_id) });
  }

  if (type === "video_progress") {
    const { data } = await supabase
      .from("user_video_progress")
      .select("lesson_id, seconds")
      .eq("user_id", user.id);
    const map: Record<number, number> = {};
    for (const r of data || []) map[r.lesson_id] = r.seconds;
    return getResponse({ data: map });
  }

  if (type === "all") {
    const [onboarding, notes, progress, videoProgress] = await Promise.all([
      supabase.from("user_onboarding").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("user_notes").select("*").eq("user_id", user.id).order("sort_order", { ascending: true }),
      supabase.from("user_progress").select("lesson_id").eq("user_id", user.id),
      supabase.from("user_video_progress").select("lesson_id, seconds").eq("user_id", user.id),
    ]);

    if (notes.error) console.error("[user-data] notes fetch error:", notes.error.message);

    const videoMap: Record<number, number> = {};
    for (const r of videoProgress.data || []) videoMap[r.lesson_id] = r.seconds;

    return getResponse({
      onboarding: onboarding.data,
      notes: notes.data || [],
      progress: (progress.data || []).map((r) => r.lesson_id),
      videoProgress: videoMap,
    });
  }

  return getResponse({ error: "Invalid type" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const { supabase, getResponse } = createSupabaseAndResponse(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return getResponse({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { type } = body;

  if (type === "onboarding") {
    const { companyName, segment, teamSize, mainChallenge, currentTools, goal } = body;
    const { error } = await supabase
      .from("user_onboarding")
      .upsert({
        user_id: user.id,
        company_name: companyName,
        segment,
        team_size: teamSize,
        main_challenge: mainChallenge,
        current_tools: currentTools,
        goal,
        updated_at: new Date().toISOString(),
      });
    if (error) return getResponse({ error: error.message }, { status: 500 });
    return getResponse({ ok: true });
  }

  if (type === "notes") {
    const { lessonKey, topics } = body as {
      lessonKey: string;
      topics: { id: string; title: string; content: string; marker: string }[];
    };

    const { error: delError } = await supabase
      .from("user_notes")
      .delete()
      .eq("user_id", user.id)
      .eq("lesson_key", lessonKey);

    if (delError) {
      console.error("[user-data] notes delete error:", delError.message);
      return getResponse({ error: delError.message }, { status: 500 });
    }

    if (topics.length > 0) {
      const rows = topics.map((t, i) => ({
        user_id: user.id,
        lesson_key: lessonKey,
        topic_id: t.id,
        title: t.title,
        content: t.content,
        marker: t.marker,
        sort_order: i,
      }));
      const { error } = await supabase.from("user_notes").insert(rows);
      if (error) {
        console.error("[user-data] notes insert error:", error.message);
        return getResponse({ error: error.message }, { status: 500 });
      }
    }
    return getResponse({ ok: true });
  }

  if (type === "mark_complete") {
    const { lessonId } = body;
    const { error } = await supabase
      .from("user_progress")
      .upsert({ user_id: user.id, lesson_id: lessonId });
    if (error) return getResponse({ error: error.message }, { status: 500 });
    return getResponse({ ok: true });
  }

  if (type === "video_progress") {
    const { lessonId, seconds } = body;
    const { error } = await supabase
      .from("user_video_progress")
      .upsert({
        user_id: user.id,
        lesson_id: lessonId,
        seconds,
        updated_at: new Date().toISOString(),
      });
    if (error) return getResponse({ error: error.message }, { status: 500 });
    return getResponse({ ok: true });
  }

  return getResponse({ error: "Invalid type" }, { status: 400 });
}
