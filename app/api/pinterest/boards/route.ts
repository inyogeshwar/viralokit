import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { listPinterestBoards } from "@/lib/pinterest/api";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  try {
    return NextResponse.json({ boards: await listPinterestBoards(user.id) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load boards" }, { status: 400 });
  }
}
