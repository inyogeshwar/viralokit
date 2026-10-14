import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";
import { listPinterestBoardPins } from "@/lib/pinterest/api";
import { getUserInstagramCredentials } from "@/lib/meta/user-account";

const schema = z.object({
  boardId: z.string().min(1).max(200),
  intervalMinutes: z.number().int().min(15).max(10080).default(1440),
  startAt: z.string().datetime().optional(),
  limit: z.number().int().min(1).max(50).default(20),
});

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const ig = await getUserInstagramCredentials(user.id);
  if (!ig) return NextResponse.json({ error: "Connect Instagram in Settings first." }, { status: 400 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid import settings", details: parsed.error.flatten() }, { status: 400 });
  const { boardId, intervalMinutes, limit } = parsed.data;

  try {
    const pins = (await listPinterestBoardPins(user.id, boardId)).slice(0, limit);
    if (!pins.length) return NextResponse.json({ imported: 0, message: "No importable image Pins found on this board." });
    const supabase = await createClient();
    const now = parsed.data.startAt ? new Date(parsed.data.startAt).getTime() : Date.now() + 60_000;
    const rows = pins.map((pin, index) => ({
      user_id: user.id,
      pinterest_pin_id: pin.id,
      pinterest_board_id: boardId,
      image_url: pin.imageUrl,
      source_url: pin.link || null,
      caption: [pin.title, pin.description, pin.link].filter(Boolean).join("\n\n").slice(0, 2200),
      scheduled_for: new Date(now + index * intervalMinutes * 60_000).toISOString(),
      status: "queued",
    }));
    const { data, error } = await supabase.from("pinterest_instagram_queue")
      .upsert(rows, { onConflict: "user_id,pinterest_pin_id", ignoreDuplicates: true })
      .select("id");
    if (error) throw new Error("Could not queue Pinterest Pins. Check the database migration.");
    return NextResponse.json({ imported: data?.length || 0, found: rows.length, intervalMinutes });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Pinterest import failed" }, { status: 400 });
  }
}
