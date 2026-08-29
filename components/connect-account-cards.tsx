import { Check, ShieldCheck } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BothIcon, FacebookIcon, InstagramIcon } from "@/components/social-icon";

/**
 * Three-card "Connect Account" row (Instagram / Facebook / Both).
 * Reused on both `/connect` (focused onboarding) and `/accounts` (above the
 * existing connected-accounts list).
 *
 * All icons and badges are served from /public (Next.js convention) and
 * resolve at the site root — no remote CDN references.
 */
export function ConnectAccountCards() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Instagram */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-rose-500/10">
                <InstagramIcon className="size-8" />
              </div>
              <CardTitle className="text-base">Instagram Account</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Reply to comments and DMs from your Instagram business account.
            </p>
            <ul className="space-y-1.5 text-sm">
              <li className="flex items-start gap-2 text-muted-foreground">
                <Check className="mt-0.5 size-4 shrink-0 text-rose-500" />
                <span>AutoDM on Instagram post, reel &amp; story comments</span>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <Check className="mt-0.5 size-4 shrink-0 text-rose-500" />
                <span>Inbox automation for Instagram DMs</span>
              </li>
            </ul>
            <a href="/api/instagram/connect" className="mt-auto">
              <Button className="w-full bg-rose-500 text-white shadow-xs hover:bg-rose-600">
                Connect Instagram
              </Button>
            </a>
          </CardContent>
        </Card>

        {/* Facebook — coming soon */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                <FacebookIcon className="size-8" />
              </div>
              <CardTitle className="text-base">Facebook Page</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Reply to comments and DMs from your Facebook Page.
            </p>
            <ul className="space-y-1.5 text-sm">
              <li className="flex items-start gap-2 text-muted-foreground">
                <Check className="mt-0.5 size-4 shrink-0 text-blue-500" />
                <span>AutoDM on Facebook post, reel &amp; story comments</span>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <Check className="mt-0.5 size-4 shrink-0 text-blue-500" />
                <span>Inbox automation for Facebook DMs</span>
              </li>
            </ul>
            <Button
              disabled
              className="mt-auto w-full cursor-not-allowed bg-blue-600/60 text-white"
            >
              Coming soon
            </Button>
          </CardContent>
        </Card>

        {/* Both */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-foreground/10">
                <BothIcon className="h-8 w-12" />
              </div>
              <CardTitle className="text-base">Instagram + Facebook</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Connect both your Instagram account and Facebook Page for complete
              coverage and easier management.
            </p>
            <ul className="space-y-1.5 text-sm">
              <li className="flex items-start gap-2 text-muted-foreground">
                <Check className="mt-0.5 size-4 shrink-0 text-foreground" />
                <span>AutoDM on Instagram and Facebook post, reel &amp; story comments</span>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <Check className="mt-0.5 size-4 shrink-0 text-foreground" />
                <span>AutoDM on cross-posted content</span>
              </li>
            </ul>
            <a href="/api/instagram/connect" className="mt-auto">
              <Button className="w-full bg-foreground text-background shadow-xs hover:bg-foreground/90">
                Connect Both
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>

      {/* Meta Business Partner trust strip */}
      <div className="flex flex-col items-center justify-between gap-3 rounded-lg border bg-muted/20 px-4 py-3 sm:flex-row">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="size-4 shrink-0 text-foreground" />
          <span>
            <span className="font-medium text-foreground">ViraloKit</span> uses official
            Meta APIs. Your tokens are encrypted and stored securely.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Image
            src="/meta_partner.png"
            alt="Meta Business Partner"
            width={120}
            height={40}
            className="h-10 w-auto"
            unoptimized
          />
          <Image
            src="/meta_tech.png"
            alt="Meta Tech Provider"
            width={120}
            height={40}
            className="h-10 w-auto"
            unoptimized
          />
        </div>
      </div>
    </div>
  );
}
