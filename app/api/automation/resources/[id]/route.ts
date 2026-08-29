import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { getDb, schema } from "@/lib/db";
import { requireUserId } from "@/lib/http";
import { getDashboardContext } from "@/lib/context";

export const dynamic = "force-dynamic";

/** PATCH /api/automation/resources/[id] — update a resource */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireUserId();
  if (auth.response) return auth.response;

  const { id } = await params;
  const ctx = await getDashboardContext();
  const db = getDb();
  if (!db) return NextResponse.json({ ok: false, error: "No DB" }, { status: 500 });

  // Verify ownership
  const existing = await db
    .select()
    .from(schema.dmResources)
    .where(eq(schema.dmResources.id, id))
    .limit(1);
  if (!existing.length || existing[0].workspaceId !== ctx.workspace.id) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const allowed = [
    "name",
    "triggerKeywords",
    "matchType",
    "resourceUrl",
    "buttonLabel",
    "teaserText",
    "followPrompt",
    "deliverText",
    "isActive",
  ];
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }

  const [updated] = await db
    .update(schema.dmResources)
    .set(updates as Record<string, string | boolean>)
    .where(eq(schema.dmResources.id, id))
    .returning();

  return NextResponse.json({ ok: true, resource: updated });
}

/** DELETE /api/automation/resources/[id] — delete a resource */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireUserId();
  if (auth.response) return auth.response;

  const { id } = await params;
  const ctx = await getDashboardContext();
  const db = getDb();
  if (!db) return NextResponse.json({ ok: false, error: "No DB" }, { status: 500 });

  const existing = await db
    .select()
    .from(schema.dmResources)
    .where(eq(schema.dmResources.id, id))
    .limit(1);
  if (!existing.length || existing[0].workspaceId !== ctx.workspace.id) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  await db.delete(schema.dmResources).where(eq(schema.dmResources.id, id));
  return NextResponse.json({ ok: true });
}
