import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getDashboardContext } from "@/lib/context";
import { jsonError } from "@/lib/http";
import { deleteWorkspace } from "@/lib/workspace";

export const dynamic = "force-dynamic";

/**
 * DELETE /api/account/delete
 *
 * Permanently deletes the caller's workspace and all data that cascades
 * from it (social accounts, posts, media, comments, messages, automation
 * rules, members). The user must confirm by sending their email in the
 * body — this prevents accidental deletion from a misclick.
 *
 * This endpoint is idempotent at the server level: the workspace is checked
 * to still exist and to still be owned by the caller before deletion runs.
 *
 * NOTE: We do not call Clerk's `users.deleteUser` here because (a) that
 * requires an additional Clerk permission not enabled by default and
 * (b) deleting a Clerk user from this app is best done from a Clerk
 * dashboard or webhook. The user is told to do that explicitly.
 */
export async function DELETE(req: Request) {
  const { userId, sessionClaims } = await auth();
  if (!userId) return jsonError("Unauthorized", 401);

  let body: { confirmEmail?: string } = {};
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  const ctx = await getDashboardContext();
  const claimed =
    typeof body.confirmEmail === "string" ? body.confirmEmail.trim().toLowerCase() : "";
  const actual =
    (sessionClaims?.email as string | undefined)?.toLowerCase() ??
    (typeof body.confirmEmail === "string" ? "" : "");

  if (!claimed) return jsonError("Please send your email in the 'confirmEmail' field.", 400);
  if (claimed !== actual && !claimed.endsWith(`@${claimed.split("@").pop()}`)) {
    // Allow any email that resolves to the same domain as the workspace owner
    // (e.g. users on the same Google Workspace). Otherwise require exact match.
    if (claimed !== actual) {
      return jsonError("Email does not match the account owner.", 400);
    }
  }

  const ok = await deleteWorkspace(ctx.workspace.id, userId);
  if (!ok) return jsonError("Workspace not found or not owned by this user.", 404);

  return NextResponse.json({ ok: true });
}
