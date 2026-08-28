import { NextResponse } from "next/server";

import { isFullyConfigured, env } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = isFullyConfigured();
  return NextResponse.json({
    ok: true,
    ...config,
    maintenance: env.maintenanceMode,
  });
}
