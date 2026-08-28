import { NextResponse } from "next/server";

import { requireUserId } from "@/lib/http";
import { ensureWorkspace, exportWorkspaceData } from "@/lib/workspace";

export const dynamic = "force-dynamic";

/**
 * GET /api/account/export
 * Streams a JSON dump of the current user's workspace. OAuth tokens are
 * redacted before being written to the response body.
 */
export async function GET() {
  const auth = await requireUserId();
  if (auth.response) return auth.response;

  const workspace = await ensureWorkspace(auth.userId, {});
  const data = await exportWorkspaceData(workspace.id);
  if (!data) {
    return NextResponse.json(
      { ok: false, error: "Workspace not found" },
      { status: 404 },
    );
  }

  const date = new Date().toISOString().slice(0, 10);
  const filename = `viralo-kit-export-${date}.json`;

  return new NextResponse(JSON.stringify(data, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
