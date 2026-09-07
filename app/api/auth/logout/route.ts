import { signOut } from "@workos-inc/authkit-nextjs";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await signOut();
  } catch (err: any) {
    // Ignore signout errors
  }
  return NextResponse.redirect(new URL("/", "https://viralokit.vercel.app"));
}
