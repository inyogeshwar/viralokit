/**
 * GET /api/accounts/health
 *
 * Returns the health of every Instagram account connected to the
 * current workspace. Used by the dashboard to render a re-auth banner
 * when one of the accounts has an expired or revoked token.
 *
 * Response: { ok: true, accounts: AccountHealthInfo[] }
 */

import { NextResponse } from "next/server";

import { requireUserId } from "@/lib/http";
import { getAccountsHealth } from "@/lib/social-account-status";
import { ensureWorkspace } from "@/lib/workspace";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireUserId();
  if (auth.response) return auth.response;

  const workspace = await ensureWorkspace(auth.userId, {});
  const accounts = await getAccountsHealth(workspace.id);
  return NextResponse.json({ ok: true, accounts });
}
