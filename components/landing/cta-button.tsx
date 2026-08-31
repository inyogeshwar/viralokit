"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SignInButton, useUser } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";

export function CTAButton({ size = "lg" }: { size?: "lg" | "default" }) {
  const { isSignedIn } = useUser();
  const signedIn = Boolean(isSignedIn);

  if (signedIn) {
    return (
      <Button size={size} className="bg-rose-500 hover:bg-rose-600 px-8 text-base" asChild>
        <Link href="/dashboard">
          Open Dashboard
          <ArrowRight className="ml-2 size-4" />
        </Link>
      </Button>
    );
  }

  return (
    <SignInButton mode="modal">
      <Button size={size} className="bg-rose-500 hover:bg-rose-600 px-8 text-base">
        Get Started Free
        <ArrowRight className="ml-2 size-4" />
      </Button>
    </SignInButton>
  );
}
