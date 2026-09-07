import { getSignInUrl } from "@workos-inc/authkit-nextjs";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const signInUrl = await getSignInUrl();
    return NextResponse.redirect(signInUrl);
  } catch (err: any) {
    return NextResponse.redirect(new URL("/", "https://viralokit.vercel.app"));
  }
}
