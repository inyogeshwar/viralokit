import { createClient } from "@/lib/supabase/server";
import { decryptToken, encryptToken } from "@/lib/security/encryption";

export type PinterestBoard = { id: string; name: string; description?: string; pin_count?: number };
export type PinterestPin = {
  id: string;
  title?: string;
  description?: string;
  link?: string;
  imageUrl: string;
  boardId: string;
};

export async function getPinterestAccessToken(userId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data: account, error } = await supabase
    .from("pinterest_accounts")
    .select("id, access_token_encrypted, refresh_token_encrypted, token_expires_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !account) return null;

  const expiresAt = account.token_expires_at ? new Date(account.token_expires_at).getTime() : 0;
  const refreshToken = account.refresh_token_encrypted
    ? decryptToken(account.refresh_token_encrypted)
    : "";

  if (expiresAt && expiresAt < Date.now() + 5 * 60 * 1000 && refreshToken) {
    const clientId = process.env.PINTEREST_CLIENT_ID?.trim();
    const clientSecret = process.env.PINTEREST_CLIENT_SECRET?.trim();
    if (!clientId || !clientSecret) throw new Error("Pinterest OAuth credentials are not configured.");

    const response = await fetch("https://api.pinterest.com/v5/oauth/token", {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(clientId + ":" + clientSecret).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken }),
      cache: "no-store",
    });
    const refreshed = await response.json();
    if (!response.ok || !refreshed.access_token) {
      throw new Error(refreshed.message || "Pinterest token refresh failed. Reconnect Pinterest in ViraloKit.");
    }

    const { error: updateError } = await supabase.from("pinterest_accounts").update({
      access_token_encrypted: encryptToken(refreshed.access_token),
      refresh_token_encrypted: refreshed.refresh_token ? encryptToken(refreshed.refresh_token) : account.refresh_token_encrypted,
      token_expires_at: new Date(Date.now() + Number(refreshed.expires_in || 0) * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    }).eq("user_id", userId);
    if (updateError) throw new Error("Could not save refreshed Pinterest credentials.");
    return refreshed.access_token as string;
  }

  if (expiresAt && expiresAt <= Date.now()) {
    throw new Error("Pinterest connection expired. Reconnect Pinterest in ViraloKit.");
  }
  return decryptToken(account.access_token_encrypted);
}

async function pinterestGet<T>(path: string, token: string): Promise<T> {
  const response = await fetch("https://api.pinterest.com/v5" + path, {
    headers: { Authorization: "Bearer " + token, Accept: "application/json" },
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.error || "Pinterest API request failed.");
  }
  return data as T;
}

export async function listPinterestBoards(userId: string): Promise<PinterestBoard[]> {
  const token = await getPinterestAccessToken(userId);
  if (!token) throw new Error("Connect Pinterest first.");
  const data = await pinterestGet<{ items?: any[]; bookmark?: string | null }>("/boards?page_size=100", token);
  return (data.items || []).map((b) => ({
    id: String(b.id),
    name: String(b.name || "Untitled board"),
    description: b.description || "",
    pin_count: Number(b.pin_count || 0),
  }));
}

export async function listPinterestBoardPins(userId: string, boardId: string): Promise<PinterestPin[]> {
  const token = await getPinterestAccessToken(userId);
  if (!token) throw new Error("Connect Pinterest first.");
  const data = await pinterestGet<{ items?: any[] }>("/boards/" + encodeURIComponent(boardId) + "/pins?page_size=100", token);
  return (data.items || []).flatMap((pin) => {
    const images = pin.media?.images || {};
    const imageUrl =
      images.orig?.url ||
      images["1200x"]?.url ||
      images["600x"]?.url ||
      Object.values(images).map((image: any) => image?.url).find(Boolean);
    if (!imageUrl || typeof imageUrl !== "string" || !imageUrl.startsWith("https://")) return [];
    return [{
      id: String(pin.id),
      title: pin.title || "",
      description: pin.description || "",
      link: pin.link || "",
      imageUrl,
      boardId,
    }];
  });
}
