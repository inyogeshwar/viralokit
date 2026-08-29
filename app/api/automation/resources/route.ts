import { NextRequest, NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";

import { getDb, schema } from "@/lib/db";
import { requireUserId } from "@/lib/http";
import { getDashboardContext } from "@/lib/context";

export const dynamic = "force-dynamic";

/** GET /api/automation/resources — list all DM resources for the workspace */
export async function GET() {
  const auth = await requireUserId();
  if (auth.response) return auth.response;

  const ctx = await getDashboardContext();
  const db = getDb();
  if (!db) return NextResponse.json({ ok: true, resources: [] });

  const resources = await db
    .select()
    .from(schema.dmResources)
    .where(eq(schema.dmResources.workspaceId, ctx.workspace.id))
    .orderBy(desc(schema.dmResources.createdAt));

  return NextResponse.json({ ok: true, resources });
}

/** POST /api/automation/resources — create a new DM resource */
export async function POST(req: NextRequest) {
  const auth = await requireUserId();
  if (auth.response) return auth.response;

  const ctx = await getDashboardContext();
  const db = getDb();
  if (!db) return NextResponse.json({ ok: false, error: "No DB" }, { status: 500 });

  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const {
    accountId,
    name,
    triggerKeywords,
    matchType,
    resourceUrl,
    buttonLabel,
    teaserText,
    followPrompt,
    deliverText,
  } = body as Record<string, string | undefined>;

  if (!accountId || !name || !triggerKeywords || !resourceUrl) {
    return NextResponse.json(
      { ok: false, error: "Missing required fields: accountId, name, triggerKeywords, resourceUrl" },
      { status: 400 },
    );
  }

  // Verify the account belongs to this workspace
  const account = ctx.accounts.find((a) => a.id === accountId);
  if (!account) {
    return NextResponse.json({ ok: false, error: "Account not found" }, { status: 404 });
  }

  const [created] = await db
    .insert(schema.dmResources)
    .values({
      workspaceId: ctx.workspace.id,
      accountId,
      name,
      triggerKeywords,
      matchType: matchType ?? "contains",
      resourceUrl,
      buttonLabel: buttonLabel ?? "Download",
      teaserText: teaserText ?? "Check your DMs!",
      followPrompt:
        followPrompt ??
        "Please follow this page first to unlock the resource! Once you've followed, reply 'Done' here.",
      deliverText:
        deliverText ??
        "Here's your resource! Let us know if you need anything else 💪",
    })
    .returning();

  return NextResponse.json({ ok: true, resource: created }, { status: 201 });
}
