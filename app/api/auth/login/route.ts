import { getSignInUrl } from "@workos-inc/authkit-nextjs";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const proto = process.env.NODE_ENV === "production" ? "https" : "http";
    const host = process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, "") || "viralokit.vercel.app";
    const redirectUri = `${proto}://${host}/callback`.replace(/[\u200B-\u200D\uFEFF]/g, "").trim();

    const signInUrl = await getSignInUrl({ redirectUri });
    const cleanUrl = signInUrl.replace(/%EF%BB%BF/g, "").replace(/[\u200B-\u200D\uFEFF]/g, "");
    return NextResponse.redirect(cleanUrl);
  } catch (err: any) {
    return NextResponse.redirect(new URL("/", "https://viralokit.vercel.app"));
  }
}
