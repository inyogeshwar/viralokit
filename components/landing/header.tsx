"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Menu, X, Zap } from "lucide-react";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it Works" },
  { href: "#compare", label: "Compare" },
  { href: "#faq", label: "FAQ" },
];

export function LandingHeader() {
  const [open, setOpen] = useState(false);
  const { isSignedIn } = useUser();
  const signedIn = Boolean(isSignedIn);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <Zap className="size-6 text-rose-500" />
          ViraloKit
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {signedIn ? <UserButton /> : null}
          {signedIn ? (
            <Button size="sm" className="bg-rose-500 hover:bg-rose-600" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm">Sign in</Button>
              </SignInButton>
              <SignInButton mode="modal">
                <Button size="sm" className="bg-rose-500 hover:bg-rose-600">
                  Get Started Free
                  <ArrowRight className="ml-1.5 size-3.5" />
                </Button>
              </SignInButton>
            </>
          )}

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground md:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t bg-background md:hidden"
          >
            <nav className="flex flex-col gap-1 px-6 py-4">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
