/**
 * 26 Scored Hook Formulas for Instagram Creators
 * Inspired by Jake Schincariol's battle-tested Instagram Agent Skill (MIT).
 */

export interface HookFormula {
  id: number;
  name: string;
  category: "Authority" | "Curiosity" | "Numbers" | "Contrarian" | "Speed" | "Story";
  template: string;
  example: string;
  onScreenText: string;
  bestFor: string;
  trap: string;
}

export const HOOK_FORMULAS: HookFormula[] = [
  {
    id: 1,
    name: "Cost Confession",
    category: "Numbers",
    template: "{Specific amount} is what {one mistake} cost me.",
    example: "$18,000 is what one missing clause cost me.",
    onScreenText: "$18,000 MISTAKE",
    bestFor: "Instant trust. People always finish the post where you are the one who took the hit.",
    trap: "A fake cost. 'Cost me my peace of mind' is not a number and audiences smell it instantly.",
  },
  {
    id: 2,
    name: "Negative Command",
    category: "Contrarian",
    template: "Stop {common habit}. Do {specific alternative} instead.",
    example: "Stop posting 3x a day. Post twice and reply to every comment for 30 minutes.",
    onScreenText: "STOP POSTING DAILY",
    bestFor: "High saves and comments. Imperatives grab immediate attention that statements miss.",
    trap: "Telling people to stop something nobody actually does. The habit must be painfully relatable.",
  },
  {
    id: 3,
    name: "Nobody Tells You",
    category: "Curiosity",
    template: "Nobody tells you that {uncomfortable truth about the thing they want}.",
    example: "Nobody tells you that your first 30 reels are supposed to flop.",
    onScreenText: "YOUR FIRST 30 WILL FLOP",
    bestFor: "Reaching non-followers. Positions you as the insider saying the quiet part out loud.",
    trap: "Picking a truth everyone already agrees on. If comments say 'obviously', it wasn't a secret.",
  },
  {
    id: 4,
    name: "The Replacement",
    category: "Numbers",
    template: "This {cheap tool} replaced {expensive service} for {price}.",
    example: "This $12 tool replaced the video editor I was paying $2,000 a month.",
    onScreenText: "$2,000 -> $12",
    bestFor: "Tutorials and tool showcases. The price gap does 90% of the persuasion.",
    trap: "Overstating the swap. If it only does 60% of the job, say 60%, or comments will tear it apart.",
  },
  {
    id: 5,
    name: "Time Collapse",
    category: "Speed",
    template: "This used to take me {long time}. It now takes {short time}.",
    example: "Writing carousels used to take me 4 hours. It takes 15 minutes now.",
    onScreenText: "4 HOURS -> 15 MIN",
    bestFor: "Workflow breakdowns where speed is the primary win. Reads in under 1 second.",
    trap: "Unbelievable ratios. '40 hours down to 2 seconds' gets flagged as a lie even if true.",
  },
  {
    id: 6,
    name: "The Receipt",
    category: "Numbers",
    template: "I {did action} for {N days}. Here are the exact numbers.",
    example: "I posted 1 carousel a day for 45 days. Here is what happened to my follower graph.",
    onScreenText: "45 DAYS. REAL NUMBERS.",
    bestFor: "Experiments and case studies. Pairs best with real screenshot proof.",
    trap: "Not showing the actual dashboard or proof. Claiming numbers without proof destroys credibility.",
  },
  {
    id: 7,
    name: "Wrong Way, Right Way",
    category: "Contrarian",
    template: "You are doing {thing} wrong, and it is not your fault. {The exact fix}.",
    example: "You are writing captions wrong, and it's not your fault. Instagram cuts off after line 1.",
    onScreenText: "YOUR CAPTIONS ARE CUT",
    bestFor: "Teaching frameworks. The 'not your fault' absolution stops it from feeling like an insult.",
    trap: "Skipping the absolution. 'You are doing it wrong' alone causes viewers to swipe away.",
  },
  {
    id: 8,
    name: "Insider Leak",
    category: "Authority",
    template: "I spent {N years} {inside industry}. Here is what nobody admits publicly.",
    example: "I spent 5 years managing creator brand deals. Here is what brands never tell you.",
    onScreenText: "5 YEARS INSIDE",
    bestFor: "Unmatched authority without bragging. Works only when the experience is 100% genuine.",
    trap: "Promising a leak and delivering a cliché. The comments will call you out.",
  },
  {
    id: 9,
    name: "The Unfair Advantage",
    category: "Curiosity",
    template: "The secret to {desired result} isn't {common belief}. It's {unexpected lever}.",
    example: "The secret to 100k views isn't fancy editing. It's the 125-character visible hook.",
    onScreenText: "THE 125-CHAR SECRET",
    bestFor: "Shifting paradigms. Great for educational carousels and tactical teardowns.",
    trap: "Clickbait with no payoff. The unexpected lever must be genuinely actionable.",
  },
  {
    id: 10,
    name: "The Micro-Habit",
    category: "Speed",
    template: "Do this for {2 minutes} before you {common activity}.",
    example: "Spend 3 minutes on this checklist before you hit publish on Instagram.",
    onScreenText: "3 MIN PRE-POST ROUTINE",
    bestFor: "Actionable routines. The tiny time investment lowers resistance to near zero.",
    trap: "The habit actually takes 45 minutes to execute. Keep it genuinely micro.",
  },
  {
    id: 11,
    name: "The Costly Mistake",
    category: "Story",
    template: "I wasted {time/money} on {thing} until I realized {key insight}.",
    example: "I wasted 6 months obsessing over hashtags until I realized Instagram is a semantic search engine.",
    onScreenText: "6 MONTHS WASTED",
    bestFor: "Vulnerability and relatable growth arcs. Saves creators from repeating the error.",
    trap: "Complaining without a clean turnaround lesson.",
  },
  {
    id: 12,
    name: "The Rule of 3",
    category: "Authority",
    template: "3 things I stopped doing to {reach milestone}.",
    example: "3 things I deleted from my Instagram strategy to cross 50,000 followers.",
    onScreenText: "3 THINGS I STOPPED",
    bestFor: "High-value listicles and carousels. Subtraction advice outperforms addition advice.",
    trap: "Adding generic tips like 'consistency' as one of the three. Be hyper-specific.",
  },
  {
    id: 13,
    name: "The Comparison Split",
    category: "Contrarian",
    template: "Amateurs {action A}. Professionals {action B}.",
    example: "Amateurs look for viral audios. Professionals optimize watch-through percentage.",
    onScreenText: "AMATEUR VS PRO",
    bestFor: "Positioning yourself as a top-tier operator in your niche.",
    trap: "Sounding condescending or elitist. Ground it in measurable mechanics.",
  },
  {
    id: 14,
    name: "The Framework Reveal",
    category: "Speed",
    template: "Steal my {exact framework} for {specific outcome} (step-by-step).",
    example: "Steal my 4-slide carousel structure that generates 200+ saves per post.",
    onScreenText: "STEAL THIS TEMPLATE",
    bestFor: "Carousels with maximum save rates. People save what they want to copy later.",
    trap: "Saying 'steal this' and giving vague mindset tips.",
  },
  {
    id: 15,
    name: "The Direct Callout",
    category: "Curiosity",
    template: "If your {content/metric} is stuck under {benchmark}, read this.",
    example: "If your reels are stuck under 1,000 views, your first 2 seconds are dying here.",
    onScreenText: "STUCK UNDER 1K VIEWS?",
    bestFor: "High qualification. Only the people in acute pain stop, but they read every single word.",
    trap: "Targeting a metric too wide or too narrow.",
  },
  {
    id: 16,
    name: "The Hard Truth",
    category: "Contrarian",
    template: "Your {skill/asset} isn't the problem. Your {hidden bottleneck} is.",
    example: "Your camera quality isn't the problem. Your pacing is.",
    onScreenText: "IT'S NOT YOUR CAMERA",
    bestFor: "Reframing excuses into actionable fixes.",
    trap: "Not providing a clear alternative solution.",
  },
  {
    id: 17,
    name: "The Prediction",
    category: "Authority",
    template: "In 2026, {industry trend} is changing forever. Here is how to prepare.",
    example: "In 2026, 30 hashtags hurt your reach. Here is what Meta's search engine actually indexes.",
    onScreenText: "2026 ALGORITHM SHIFT",
    bestFor: "Thought leadership, high shares to stories.",
    trap: "Fearmongering with zero data back up.",
  },
  {
    id: 18,
    name: "The Challenge",
    category: "Story",
    template: "Try {specific constraint} for 7 days and watch what happens.",
    example: "Cut your caption to 1 punchy sentence + 3 search tags for 7 days. Watch retention spike.",
    onScreenText: "7-DAY EXPERIMENT",
    bestFor: "Interactive community engagement and repeat viewers.",
    trap: "A challenge that requires buying something or extreme friction.",
  },
  {
    id: 19,
    name: "The Filter",
    category: "Curiosity",
    template: "Only watch this if you {specific identity or goal}.",
    example: "Only read this if you want clients from Instagram without sending 50 cold DMs a day.",
    onScreenText: "CLIENTS WITHOUT COLD DMs",
    bestFor: "Anti-rejection psychology. Exclusion breeds curiosity.",
    trap: "Generic exclusion ('Only watch if you want to be rich').",
  },
  {
    id: 20,
    name: "The Audit Teardown",
    category: "Authority",
    template: "Why {viral post} got {millions of views} (breakdown).",
    example: "Why this 6-second reel got 2.4 million views: Teardown of the visual loop.",
    onScreenText: "2.4M REEL BREAKDOWN",
    bestFor: "Analytical educational creators. Deconstructs success.",
    trap: "Surface level analysis without revealing the underlying psychological trigger.",
  },
  {
    id: 21,
    name: "The Mythbuster",
    category: "Contrarian",
    template: "{Popular advice} is keeping you broke/stuck.",
    example: "'Post every day at 6 PM' is keeping your reach flat. Here's why timing is secondary.",
    onScreenText: "THE 6 PM MYTH",
    bestFor: "Challenging conventional wisdom with real data.",
    trap: "Disagreeing just to be contrarian without a superior alternative.",
  },
  {
    id: 22,
    name: "The Question Trap",
    category: "Curiosity",
    template: "Have you ever wondered why {common mystery occurs}?",
    example: "Ever wondered why accounts with 1,000 followers get more brand deals than accounts with 50k?",
    onScreenText: "1K VS 50K FOLLOWERS",
    bestFor: "Instant curiosity gap that can only be resolved by reading.",
    trap: "A question with an obvious yes/no answer.",
  },
  {
    id: 23,
    name: "The Checklist",
    category: "Speed",
    template: "The exact {N-step} checklist I use to {result}.",
    example: "The exact 4-step checklist I run before exporting every carousel.",
    onScreenText: "4-STEP EXPORT CHECKLIST",
    bestFor: "Maximum utility and bookmarking. Highest save-to-reach ratio.",
    trap: "More than 5-6 steps. Overwhelming checklists don't get saved.",
  },
  {
    id: 24,
    name: "The Secret Weapon",
    category: "Numbers",
    template: "The {single metric} that actually determines your {growth/sales}.",
    example: "The single metric that Meta uses to push reels to non-followers (it's not shares).",
    onScreenText: "THE ONLY METRIC THAT MATTERS",
    bestFor: "Laser focus. Simplifies complex algorithm confusion into 1 lever.",
    trap: "Overhyping a metric that turns out to be basic.",
  },
  {
    id: 25,
    name: "The Before & After",
    category: "Story",
    template: "{Year A}: {Low state}. {Year B}: {Transformed state}. The one pivot.",
    example: "2024: 200 views per post. 2026: 45k monthly reach. The single hook pivot that changed it.",
    onScreenText: "200 -> 45,000 REACH",
    bestFor: "Personal narrative, building aspirational connection.",
    trap: "Making it feel like luck rather than an engineered system.",
  },
  {
    id: 26,
    name: "The Honest Teardown",
    category: "Story",
    template: "I analyzed my top 10 worst performing posts. Here is why they died.",
    example: "I analyzed 10 posts that completely flopped. Every single one had this in common.",
    onScreenText: "WHY MY POSTS FLOPPED",
    bestFor: "Radical honesty that builds immediate audience loyalty.",
    trap: "Blaming the algorithm instead of dissecting the actual creative friction.",
  },
];

export interface HookScoreBreakdown {
  score: number; // 0 - 100
  grade: "STRONG" | "GOOD" | "NEEDS WORK" | "WEAK";
  charCount: number;
  wordCount: number;
  feedCutoffText: string; // First 125 chars
  metrics: {
    specificity: number; // presence of numbers, concrete nouns
    stakes: number; // consequences, risk/reward
    frontload: number; // value in first 5 words without greetings
    cliffhanger: number; // open curiosity loop
  };
  dealbreakers: string[];
  suggestions: string[];
}

/**
 * Scores an Instagram hook / first line based on the 125-char cutoff rule
 * and creator retention benchmarks.
 */
export function scoreHook(hookText: string): HookScoreBreakdown {
  const clean = (hookText || "").trim();
  const first125 = clean.slice(0, 125);
  const words = clean.split(/\s+/).filter(Boolean);
  const dealbreakers: string[] = [];
  const suggestions: string[] = [];

  let specificity = 50;
  let stakes = 50;
  let frontload = 60;
  let cliffhanger = 50;

  // 1. Check for Dealbreakers
  const lower = clean.toLowerCase();
  if (/^(hey|hi|hello|what's up|yo|good morning|welcome)\b/i.test(lower)) {
    dealbreakers.push("Greeting opening: Strangers in the feed scroll past greetings. Start at the value.");
    frontload -= 40;
  }
  if (/^stop scrolling\b/i.test(lower)) {
    dealbreakers.push("Begging for attention ('Stop scrolling'): Proves you haven't earned it with a real hook.");
    stakes -= 30;
  }
  if (/^[\u{1F300}-\u{1FAFF}]/u.test(clean)) {
    dealbreakers.push("Leading emoji: An emoji as character #1 pushes your actual text further down the feed cutoff.");
    frontload -= 15;
  }

  // 2. Specificity (Numbers, currency, concrete timeframes)
  if (/\b\d+(\.\d+)?(k|m|%|\$)?\b/i.test(first125) || /\$\d+/i.test(first125)) {
    specificity += 40;
  }
  if (/\b(days?|hours?|minutes?|seconds?|weeks?|months?|years?)\b/i.test(first125)) {
    specificity += 20;
  }

  // 3. Stakes & Tension
  if (/\b(mistake|lost|wasted|cost|failed|ruined|secret|truth|never|stop|wrong|replaced|stuck)\b/i.test(first125)) {
    stakes += 35;
  }

  // 4. Cliffhanger / Open loop
  if (first125.endsWith("...") || /\b(here is why|here's how|this is what|reason why|exact steps)\b/i.test(first125)) {
    cliffhanger += 35;
  }

  // 5. Length Check (125 characters is the feed cutoff before "... more")
  if (clean.length > 125) {
    if (clean.charAt(124) !== " " && clean.charAt(125) !== " ") {
      suggestions.push("Line 1 will be cut mid-word by Instagram's 125-char limit. Shorten it so it ends on a cliffhanger.");
    }
  }

  specificity = Math.min(100, Math.max(10, specificity));
  stakes = Math.min(100, Math.max(10, stakes));
  frontload = Math.min(100, Math.max(10, frontload));
  cliffhanger = Math.min(100, Math.max(10, cliffhanger));

  let total = Math.round(specificity * 0.3 + stakes * 0.3 + frontload * 0.25 + cliffhanger * 0.15);

  if (dealbreakers.length > 0) {
    total = Math.min(total, 55);
  }

  let grade: "STRONG" | "GOOD" | "NEEDS WORK" | "WEAK" = "NEEDS WORK";
  if (total >= 80) grade = "STRONG";
  else if (total >= 65) grade = "GOOD";
  else if (total >= 45) grade = "NEEDS WORK";
  else grade = "WEAK";

  if (specificity < 60) {
    suggestions.push("Add a specific number, time duration, or dollar amount to ground the claim.");
  }
  if (stakes < 60) {
    suggestions.push("Clarify what is at risk if they ignore this or what specific pain is being solved.");
  }

  return {
    score: total,
    grade,
    charCount: clean.length,
    wordCount: words.length,
    feedCutoffText: first125,
    metrics: { specificity, stakes, frontload, cliffhanger },
    dealbreakers,
    suggestions,
  };
}
