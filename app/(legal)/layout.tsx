import Link from "next/link";
import { Zap } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LegalAuditBanner } from "@/components/legal-audit-banner";
import { PRODUCT_NAME } from "@/lib/legal";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-card/80 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-lg font-bold">
            <Zap className="size-5 text-rose-500" />
            {PRODUCT_NAME}
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <LegalAuditBanner />
      <main className="flex-1">{children}</main>
      <footer className="border-t bg-card/50">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 py-8 text-center text-sm text-muted-foreground sm:flex-row sm:justify-between sm:text-left">
          <p>&copy; {new Date().getFullYear()} {PRODUCT_NAME}. All rights reserved.</p>
          <nav className="flex flex-wrap gap-x-4 gap-y-2">
            <Link href="/help" className="hover:text-foreground transition-colors">Help</Link>
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms-of-service" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/refund-policy" className="hover:text-foreground transition-colors">Refunds</Link>
            <Link href="/cookie-policy" className="hover:text-foreground transition-colors">Cookies</Link>
            <Link href="/acceptable-use" className="hover:text-foreground transition-colors">Acceptable use</Link>
            <Link href="/security" className="hover:text-foreground transition-colors">Security</Link>
            <Link href="/disclaimer" className="hover:text-foreground transition-colors">Disclaimer</Link>
            <Link href="/accessibility" className="hover:text-foreground transition-colors">Accessibility</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
