import { WorkOS } from "@workos-inc/node";
import { config } from "@/lib/config";

let workosInstance: WorkOS | null = null;

export function getWorkOS(): WorkOS | null {
  if (!config.workos.apiKey) {
    return null;
  }
  if (!workosInstance) {
    workosInstance = new WorkOS(config.workos.apiKey, {
      clientId: config.workos.clientId,
    });
  }
  return workosInstance;
}

export function isAuthKitConfigured(): boolean {
  return Boolean(config.workos.apiKey && config.workos.clientId);
}
