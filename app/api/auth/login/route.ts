import { getSignInUrl } from "@workos-inc/authkit-nextjs";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const redirectUri =
      process.env.NODE_ENV === "production"
        ? "https://viralokit.vercel.app/callback"
        : "http://localhost:3000/callback";

    const signInUrl = await getSignInUrl({ redirectUri });
    return NextResponse.redirect(signInUrl);
  } catch (err: any) {
    return NextResponse.redirect(new URL("/", "https://viralokit.vercel.app"));
  }
}
