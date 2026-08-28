import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@clerk/nextjs/server";

import { jsonError, requireUserId } from "@/lib/http";
import { deleteWorkspace } from "@/lib/workspace";

export const dynamic = "force-dynamic";

const DeleteSchema = z.object({
  confirmEmail: z.string().email(),
});

/**
 * DELETE /api/account/delete
 * Permanently deletes the caller's workspace. The user must type their
 * email to confirm. The workspace's foreign-key cascade removes related
 * accounts, posts, comments, messages, and automations.
 */
export async function DELETE(req: NextRequest) {
  const auth = await requireUserId();
  if (auth.response) return auth.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON");
  }
  const parsed = DeleteSchema.safeParse(body);
  if (!parsed.success) return jsonError("Confirmation email is required.");

  const user = await currentUser();
  const ownerEmail =
    user?.emailAddresses?.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ??
    user?.emailAddresses?.[0]?.emailAddress ??
    null;
  if (!ownerEmail || parsed.data.confirmEmail.toLowerCase() !== ownerEmail.toLowerCase()) {
    return jsonError("The email you entered does not match your account email.");
  }

  const { ensureWorkspace } = await import("@/lib/workspace");
  const workspace = await ensureWorkspace(auth.userId, {});
  try {
    await deleteWorkspace(workspace.id, auth.userId);
  } catch (err) {
    return jsonError(
      err instanceof Error ? err.message : "Failed to delete workspace",
    );
  }

  return NextResponse.json({ ok: true });
}
