import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getDashboardContext } from "@/lib/context";
import { jsonError } from "@/lib/http";
import { exportWorkspaceData } from "@/lib/workspace";

export const dynamic = "force-dynamic";

/**
 * GET /api/account/export — returns a JSON dump of the user's workspace.
 * Includes accounts (without tokens), posts, media, comments, messages, and
 * automation rules. The response is sent as an attachment so browsers
 * offer to save it.
 */
export async function GET() {
  const { userId } = await auth();
  if (!userId) return jsonError("Unauthorized", 401);

  const ctx = await getDashboardContext();
  const data = await exportWorkspaceData(ctx.workspace.id);

  const body = JSON.stringify(data, null, 2);
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="viralo-kit-export-${new Date()
        .toISOString()
        .slice(0, 10)}.json"`,
    },
  });
}
