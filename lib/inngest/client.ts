import { Inngest } from "inngest";

import { env } from "@/lib/env";

export const inngest = new Inngest({
  id: "viralo-kit",
  name: "ViraloKit",
  eventKey: env.inngest.eventKey || undefined,
  signingKey: env.inngest.signingKey || undefined,
});
