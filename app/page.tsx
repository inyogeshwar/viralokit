import Link from "next/link";
import {
  BarChart3,
  CalendarDays,
  Images,
  LayoutDashboard,
  Sparkles,
  Users,
  Zap,
  Bot,
  Send,
  Shield,
  Clock,
  ArrowRight,
  Check,
  Star,
  Globe,
  TrendingUp,
  AtSign,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Reveal,
  StaggerGroup,
  StaggerItem,
  AnimatedCounter,
} from "@/components/landing/animated";
import { LandingHeader } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { CTAButton } from "@/components/landing/cta-button";

const features = [
  {
    icon: LayoutDashboard,
    title: "Multi-Account Dashboard",
    description: "Connect unlimited Instagram accounts. Switch between them in one click.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: Images,
    title: "Image, Carousel & Reels",
    description: "Publish single images, multi-image carousels, or video reels — all from one place.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: Sparkles,
    title: "AI Captions & Hashtags",
    description: "Gemini AI generates captions, hashtags, and keywords from your images and topics.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    icon: CalendarDays,
    title: "Smart Scheduling",
    description: "Drag-and-drop calendar. Schedule posts for the perfect time. Never miss a posting.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: BarChart3,
    title: "Real Analytics",
    description: "Followers, reach, profile views, engagement rates — real data from Instagram API.",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
  {
    icon: Bot,
    title: "DM Automation",
    description: "Auto-reply to DMs with smart rules. Keyword matching, quick replies, templates.",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
  {
    icon: AtSign,
    title: "Comment Automation",
    description: "Auto-reply to comments. Private replies to commenters. Full moderation suite.",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    icon: Shield,
    title: "Rate Limit Protection",
    description: "Built-in rate limiting per account. Never hit Instagram API limits.",
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
  {
    icon: Clock,
    title: "24h Window Tracking",
    description: "Tracks messaging windows. Human agent tag for 7-day replies. Meta compliant.",
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
  },
];

const stats = [
  { value: 100, suffix: "%", label: "Free Forever" },
  { value: 50, suffix: "+", label: "API Methods" },
  { value: 24, suffix: "/7", label: "Automation" },
  { value: 1, suffix: "s", label: "Deploy Time" },
];

const steps = [
  {
    step: "01",
    title: "Connect Instagram",
    description: "Sign in with your Instagram Business account. One click, done.",
    icon: Globe,
  },
  {
    step: "02",
    title: "Create & Schedule",
    description: "Write captions (or let AI generate them), upload media, pick a time.",
    icon: Send,
  },
  {
    step: "03",
    title: "Automate & Analyze",
    description: "Set up DM/comment automation. Track performance with real analytics.",
    icon: TrendingUp,
  },
];

const comparisons = [
  { feature: "Instagram Publishing", viralokit: true, buffer: true, hootsuite: true },
  { feature: "AI Captions", viralokit: true, buffer: false, hootsuite: false },
  { feature: "DM Automation", viralokit: true, buffer: false, hootsuite: false },
  { feature: "Comment Automation", viralokit: true, buffer: false, hootsuite: false },
  { feature: "Multi-Account", viralokit: true, buffer: true, hootsuite: true },
  { feature: "Calendar Scheduling", viralokit: true, buffer: true, hootsuite: true },
  { feature: "Real Analytics", viralokit: true, buffer: true, hootsuite: true },
  { feature: "Reels Publishing", viralokit: true, buffer: false, hootsuite: true },
  { feature: "Rate Limit Protection", viralokit: true, buffer: false, hootsuite: false },
  { feature: "Open Source", viralokit: true, buffer: false, hootsuite: false },
  { feature: "Free Forever", viralokit: true, buffer: false, hootsuite: false },
];

const faqs = [
  {
    q: "Kya ViraloKit sach mein free hai?",
    a: "Haan bhai, 100% free hai. Koi hidden charges nahi. Vercel, Neon, Clerk, Cloudinary sab free tier pe chalta hai. Jab tak 10,000 users nahi aate, ₹0 lagega.",
  },
  {
    q: "Mera Instagram account safe rahega?",
    a: "Bilkul safe hai. Hum sirf official Instagram API use karte hain. Tumhara password humare paas nahi hota. Sirf access token hota hai jo encrypted store hota hai.",
  },
  {
    q: "Kitne Instagram accounts connect kar sakte hain?",
    a: "Unlimited! Jitne chaaho utne accounts add karo. Har account ke liye alag automation rules bhi set kar sakte ho.",
  },
  {
    q: "AI captions kaise kaam karte hain?",
    a: "Gemini AI use karta hai. Tumhein bas topic ya image daalni hai, AI caption, hashtags, aur keywords generate kar dega. Image analysis bhi karta hai.",
  },
  {
    q: "DM automation kaise set karein?",
    a: "Automation page pe jao, naya rule banao. Trigger select karo (keyword ya all DMs), response likho. Done! Ab jab koi DM karega, auto-reply jayega.",
  },
  {
    q: "Kya main reels publish kar sakta hoon?",
    a: "Haan! Image, carousel, aur reels — teeno publish kar sakte ho. Video upload karo, caption daalo, publish karo.",
  },
  {
    q: "Webhook setup kaise karein?",
    a: "Meta Developer Dashboard pe webhook URL daalo. Hamara endpoint /api/webhooks/instagram hai. Verify token match karo. Done!",
  },
  {
    q: "Mobile pe chalega?",
    a: "Haan! Responsive design hai. Phone se bhi dashboard access kar sakte ho. PWA support bhi hai — home screen pe add kar sakte ho.",
  },
];

const testimonials = [
  {
    name: "Rahul S.",
    role: "Small Business Owner",
    text: "Best free tool for Instagram management. AI captions save me hours every week!",
    rating: 5,
  },
  {
    name: "Priya M.",
    role: "Content Creator",
    text: "DM automation is a game changer. My followers get instant replies now.",
    rating: 5,
  },
  {
    name: "Amit K.",
    role: "Marketing Agency",
    text: "Managing 10+ client accounts from one dashboard. Love the multi-account feature.",
    rating: 5,
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingHeader />

      <main className="flex-1">
        <Hero />

        {/* Stats */}
        <section className="border-y bg-muted/30 px-6 py-12">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4">
            <StaggerGroup>
              {stats.map((stat) => (
                <StaggerItem key={stat.label}>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-rose-500">
                      <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <div className="mb-12 text-center">
                <Badge variant="outline" className="mb-4">Features</Badge>
                <h2 className="text-3xl font-bold md:text-4xl">Everything you need</h2>
                <p className="mt-3 text-muted-foreground">
                  From publishing to automation — ViraloKit has it all.
                </p>
              </div>
            </Reveal>
            <StaggerGroup>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {features.map((feature) => (
                  <StaggerItem key={feature.title}>
                    <Card className="group h-full transition-all hover:-translate-y-0.5 hover:shadow-lg">
                      <CardContent className="p-6">
                        <div className={`mb-4 inline-flex rounded-xl p-3 ${feature.bg}`}>
                          <feature.icon className={`size-6 ${feature.color}`} />
                        </div>
                        <h3 className="mb-2 font-semibold">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </CardContent>
                    </Card>
                  </StaggerItem>
                ))}
              </div>
            </StaggerGroup>
          </div>
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="border-y bg-muted/30 px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <div className="mb-12 text-center">
                <Badge variant="outline" className="mb-4">How it Works</Badge>
                <h2 className="text-3xl font-bold md:text-4xl">3 simple steps</h2>
                <p className="mt-3 text-muted-foreground">Get started in minutes, not hours.</p>
              </div>
            </Reveal>
            <StaggerGroup>
              <div className="grid gap-8 md:grid-cols-3">
                {steps.map((step) => (
                  <StaggerItem key={step.step}>
                    <div className="relative text-center">
                      <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-rose-500/10">
                        <step.icon className="size-8 text-rose-500" />
                      </div>
                      <Badge variant="secondary" className="mb-3">Step {step.step}</Badge>
                      <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </StaggerItem>
                ))}
              </div>
            </StaggerGroup>
          </div>
        </section>

        {/* Comparison */}
        <section id="compare" className="px-6 py-20">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <div className="mb-12 text-center">
                <Badge variant="outline" className="mb-4">Comparison</Badge>
                <h2 className="text-3xl font-bold md:text-4xl">Why ViraloKit?</h2>
                <p className="mt-3 text-muted-foreground">See how we compare to paid alternatives.</p>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-3 text-left font-medium">Feature</th>
                        <th className="px-4 py-3 text-center font-medium text-rose-500">ViraloKit</th>
                        <th className="px-4 py-3 text-center font-medium text-muted-foreground">Buffer</th>
                        <th className="px-4 py-3 text-center font-medium text-muted-foreground">Hootsuite</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisons.map((row) => (
                        <tr key={row.feature} className="border-b transition-colors last:border-0 hover:bg-muted/40">
                          <td className="px-4 py-3">{row.feature}</td>
                          <td className="px-4 py-3 text-center">
                            {row.viralokit ? (
                              <Check className="mx-auto size-4 text-emerald-500" />
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {row.buffer ? (
                              <Check className="mx-auto size-4 text-emerald-500" />
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {row.hootsuite ? (
                              <Check className="mx-auto size-4 text-emerald-500" />
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-muted/50 font-semibold">
                        <td className="px-4 py-3">Price</td>
                        <td className="px-4 py-3 text-center text-rose-500">FREE</td>
                        <td className="px-4 py-3 text-center text-muted-foreground">$6/mo</td>
                        <td className="px-4 py-3 text-center text-muted-foreground">$99/mo</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>
            </Reveal>
          </div>
        </section>

        {/* Testimonials */}
        <section className="border-y bg-muted/30 px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <div className="mb-12 text-center">
                <Badge variant="outline" className="mb-4">Testimonials</Badge>
                <h2 className="text-3xl font-bold md:text-4xl">Loved by creators</h2>
              </div>
            </Reveal>
            <StaggerGroup>
              <div className="grid gap-6 md:grid-cols-3">
                {testimonials.map((t) => (
                  <StaggerItem key={t.name}>
                    <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-lg">
                      <CardContent className="p-6">
                        <div className="mb-3 flex gap-0.5">
                          {Array.from({ length: t.rating }).map((_, i) => (
                            <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <p className="mb-4 text-sm text-muted-foreground">&ldquo;{t.text}&rdquo;</p>
                        <div>
                          <p className="text-sm font-semibold">{t.name}</p>
                          <p className="text-xs text-muted-foreground">{t.role}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </StaggerItem>
                ))}
              </div>
            </StaggerGroup>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="px-6 py-20">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <div className="mb-12 text-center">
                <Badge variant="outline" className="mb-4">FAQ</Badge>
                <h2 className="text-3xl font-bold md:text-4xl">Frequently Asked Questions</h2>
              </div>
            </Reveal>
            <StaggerGroup>
              <div className="space-y-4">
                {faqs.map((faq) => (
                  <StaggerItem key={faq.q}>
                    <Card className="transition-colors hover:border-foreground/20">
                      <CardContent className="p-6">
                        <h3 className="mb-2 font-semibold">{faq.q}</h3>
                        <p className="text-sm text-muted-foreground">{faq.a}</p>
                      </CardContent>
                    </Card>
                  </StaggerItem>
                ))}
              </div>
            </StaggerGroup>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <div className="rounded-3xl bg-gradient-to-r from-rose-500 via-purple-500 to-amber-500 p-px">
                <div className="rounded-3xl bg-background px-8 py-16">
                  <h2 className="text-3xl font-bold md:text-4xl">Ready to go viral?</h2>
                  <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                    Join thousands of creators using ViraloKit to grow their Instagram. It&apos;s
                    free, it&apos;s powerful, it&apos;s yours.
                  </p>
                  <div className="mt-8 flex justify-center">
                    <CTAButton />
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t px-6 py-12">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 text-lg font-bold">
              <Zap className="size-5 text-rose-500" />
              ViraloKit
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              AI-powered social media management for Instagram. Free forever.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#features" className="transition-colors hover:text-foreground">Features</a></li>
              <li><a href="#how-it-works" className="transition-colors hover:text-foreground">How it Works</a></li>
              <li><a href="#compare" className="transition-colors hover:text-foreground">Compare</a></li>
              <li><a href="#faq" className="transition-colors hover:text-foreground">FAQ</a></li>
              <li><Link href="/help" className="transition-colors hover:text-foreground">Help Center</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy-policy" className="transition-colors hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="transition-colors hover:text-foreground">Terms of Service</Link></li>
              <li><Link href="/acceptable-use" className="transition-colors hover:text-foreground">Acceptable Use</Link></li>
              <li><Link href="/refund-policy" className="transition-colors hover:text-foreground">Refund Policy</Link></li>
              <li><Link href="/cookie-policy" className="transition-colors hover:text-foreground">Cookie Policy</Link></li>
              <li><Link href="/security" className="transition-colors hover:text-foreground">Security</Link></li>
              <li><Link href="/disclaimer" className="transition-colors hover:text-foreground">Disclaimer</Link></li>
              <li><Link href="/accessibility" className="transition-colors hover:text-foreground">Accessibility</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Connect</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/help" className="transition-colors hover:text-foreground">Help center</Link></li>
              <li><Link href="/contact" className="transition-colors hover:text-foreground">Contact Us</Link></li>
              <li><Link href="/about" className="transition-colors hover:text-foreground">About</Link></li>
              <li>
                <a href="https://github.com/inyogeshwar/viralo-kit" className="transition-colors hover:text-foreground" target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-6xl border-t pt-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} ViraloKit. Built with Next.js, Clerk, Neon, Drizzle,
          Cloudinary &amp; Gemini.
        </div>
      </footer>
    </div>
  );
}
