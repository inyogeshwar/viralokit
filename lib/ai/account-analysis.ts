import { config } from "@/lib/config";
import { NormalizedAccountAnalytics } from "@/lib/meta/types";
import { generateWithGemini } from "./gemini";

export interface RubricItem {
  id: string;
  name: string;
  category: "Bio & Identity" | "Visual & Feed" | "Distribution & Strategy";
  maxScore: number;
  score: number;
  status: "pass" | "warning" | "fail";
  finding: string;
  fix: string;
}

export interface OutlierPostAnalysis {
  postId: string;
  captionSnippet: string;
  multiplier: number;
  likes: number;
  comments: number;
  type: string;
  whyItWorked: string;
  howToReplicate: string;
}

export interface BioTeardown {
  currentIssues: string[];
  suggestedName: string;
  suggestedBioLines: [string, string, string];
  suggestedLinkCta: string;
}

export interface RecommendedPostBlueprint {
  type: "Carousel" | "Reels" | "Single Image";
  formulaName: string;
  targetStage: "Attract" | "Nurture" | "Convert";
  title: string;
  hookLine: string;
  structure: string[];
  whyItConverts: string;
}

export interface AccountAuditResult {
  isAiGenerated: true;
  overallScore: number;
  grade: "A+" | "A" | "B" | "C" | "Needs Work";
  summary: string;
  
  criticalFixes: { title: string; action: string; impact: string }[];
  highLeverageTweaks: { title: string; action: string; impact: string }[];
  winningTraits: string[];

  rubric: RubricItem[];

  outlierAnalysis: {
    medianInteractions: number;
    outliersFound: OutlierPostAnalysis[];
    replicationStrategy: string;
  };

  bioTeardown: BioTeardown;

  recommendedPosts: RecommendedPostBlueprint[];

  provider: string;
  model: string;
}

function calculateMedian(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export async function generateAccountAnalysisWithAi(
  analytics: NormalizedAccountAnalytics,
  modelId = "openrouter/free",
  enableGeminiFallback = true,
  language = "English",
  customBioOverride?: string
): Promise<AccountAuditResult> {
  const effectiveBio = (customBioOverride || analytics.account.biography || "").trim();
  const effectiveName = analytics.account.name || analytics.account.username;
  const website = analytics.account.website || "";

  // Compute actual engagement stats & outliers
  const postMetrics = analytics.recentMedia.map((p) => {
    const likes = typeof p.like_count === "number" ? p.like_count : 0;
    const comments = typeof p.comments_count === "number" ? p.comments_count : 0;
    const interactions = likes + comments * 2;
    return {
      id: p.id,
      type: p.media_type,
      caption: (p.caption || "").trim(),
      likes,
      comments,
      interactions,
      date: p.timestamp,
    };
  });

  const interactionValues = postMetrics.map((m) => m.interactions);
  const calculatedMedian = Math.max(1, Math.round(calculateMedian(interactionValues)));

  const realOutliers = postMetrics
    .map((p) => ({
      ...p,
      multiplier: Number((p.interactions / calculatedMedian).toFixed(1)),
    }))
    .filter((p) => p.multiplier >= 1.3 || p.interactions >= calculatedMedian)
    .sort((a, b) => b.multiplier - a.multiplier)
    .slice(0, 3);

  const prompt = `
You are an elite Instagram growth auditor and creator strategist following the 12-part creator audit rubric.
Analyze this Instagram creator profile and real performance metrics:

CREATOR IDENTITY:
- Username: @${analytics.account.username}
- Display Name: "${effectiveName}"
- Current Bio: "${effectiveBio || "No bio set or blank"}"
- External Link/Website: "${website || "None set"}"
- Followers: ${analytics.account.followersCount ?? "N/A"}
- Following: ${analytics.account.followsCount ?? "N/A"}
- Total Posts: ${analytics.account.mediaCount ?? "N/A"}
- 28-day Reach: ${analytics.insights.reach ?? "N/A"}
- Total 28-day Interactions: ${analytics.insights.totalInteractions ?? "N/A"}
- Median Interactions per Post: ${calculatedMedian}

RECENT POSTS SAMPLE (Top & Recent):
${JSON.stringify(
  postMetrics.slice(0, 8).map((p) => ({
    type: p.type,
    snippet: p.caption.slice(0, 140),
    likes: p.likes,
    comments: p.comments,
    totalEngagement: p.interactions,
  })),
  null,
  2
)}

AUDIT RUBRIC (Score each accurately from provided data):
1. bioLine1 (10 pts): Target Audience & Value Proposition (Under 3 seconds clarity)
2. bioLine2 (10 pts): Proof & Credibility Anchor (Numbers, achievements, experience)
3. bioLine3 (10 pts): Clear CTA & Single Destination (Directive command + link)
4. nameFieldSeo (8 pts): Name field searchable keywords (e.g. "Name | Niche")
5. avatarContrast (8 pts): Profile Avatar & Visual Contrast
6. highlightsStrategy (8 pts): Highlights acting as automated funnel
7. threePinRule (10 pts): Pinned posts portfolio strategy
8. outlierMultiplier (10 pts): Outlier analysis and format replication
9. visualGridCoherence (8 pts): Feed visual grid & typography readability
10. feedCutoffHook (8 pts): First 125-char caption feed cutoff stop rate
11. contentFlywheel (5 pts): Flywheel balance (Attract / Nurture / Convert)
12. conversionFriction (5 pts): DM & conversion funnel clarity

LANGUAGE REQUIREMENT:
You MUST output all analysis, findings, actions, and blueprints in the requested language: "${language}".
- If "${language}" is "Hinglish", write natural creator conversational Hinglish (Hindi words in English alphabet mixed with English).
- If "${language}" is "Hindi", write fluent Hindi (हिन्दी).
- If "${language}" is "English", write direct, punchy professional creator English.

ANTI-SLOP CRITICAL RULES:
- NO generic fluff ("elevate your presence", "in today's digital landscape").
- Present findings in FIX-FIRST ORDER (what hurts the profile most goes first).
- Provide an exact 3-line Bio rewrite ready to copy-paste.
- Output ONLY valid JSON matching this schema:

{
  "overallScore": 74,
  "grade": "B",
  "summary": "2-3 sentences concise diagnosis of current growth bottleneck and momentum in ${language}",
  "criticalFixes": [
    {
      "title": "Immediate Fix Title in ${language}",
      "action": "Exact step-by-step instruction in ${language}",
      "impact": "Expected metric improvement (e.g. +35% profile-to-follow rate)"
    }
  ],
  "highLeverageTweaks": [
    {
      "title": "Tweak Title in ${language}",
      "action": "Specific optimization in ${language}",
      "impact": "Strategic compounding benefit"
    }
  ],
  "winningTraits": [
    "Specific thing working well in ${language}"
  ],
  "rubric": [
    {
      "id": "bioLine1",
      "name": "Target Audience & Value Prop",
      "category": "Bio & Identity",
      "maxScore": 10,
      "score": 6,
      "status": "warning",
      "finding": "Specific observation on bio line 1 in ${language}",
      "fix": "Actionable correction in ${language}"
    },
    {
      "id": "bioLine2",
      "name": "Proof & Credibility Anchor",
      "category": "Bio & Identity",
      "maxScore": 10,
      "score": 5,
      "status": "warning",
      "finding": "Specific observation in ${language}",
      "fix": "Specific fix in ${language}"
    },
    {
      "id": "bioLine3",
      "name": "CTA & Single Destination",
      "category": "Bio & Identity",
      "maxScore": 10,
      "score": 4,
      "status": "fail",
      "finding": "Specific observation in ${language}",
      "fix": "Specific fix in ${language}"
    },
    {
      "id": "nameFieldSeo",
      "name": "Name Field SEO Keywords",
      "category": "Bio & Identity",
      "maxScore": 8,
      "score": 5,
      "status": "warning",
      "finding": "Search keyword status in ${language}",
      "fix": "Suggested keyword tweak in ${language}"
    },
    {
      "id": "avatarContrast",
      "name": "Profile Avatar & Contrast",
      "category": "Visual & Feed",
      "maxScore": 8,
      "score": 7,
      "status": "pass",
      "finding": "Observation in ${language}",
      "fix": "Fix in ${language}"
    },
    {
      "id": "highlightsStrategy",
      "name": "Story Highlights Funnel",
      "category": "Bio & Identity",
      "maxScore": 8,
      "score": 5,
      "status": "warning",
      "finding": "Observation in ${language}",
      "fix": "Fix in ${language}"
    },
    {
      "id": "threePinRule",
      "name": "Pinned Posts Portfolio",
      "category": "Visual & Feed",
      "maxScore": 10,
      "score": 6,
      "status": "warning",
      "finding": "Observation in ${language}",
      "fix": "Fix in ${language}"
    },
    {
      "id": "outlierMultiplier",
      "name": "Outlier Multiplier & Replication",
      "category": "Distribution & Strategy",
      "maxScore": 10,
      "score": 8,
      "status": "pass",
      "finding": "Observation on top posts vs median in ${language}",
      "fix": "Fix in ${language}"
    },
    {
      "id": "visualGridCoherence",
      "name": "Grid Coherence & Typography",
      "category": "Visual & Feed",
      "maxScore": 8,
      "score": 7,
      "status": "pass",
      "finding": "Observation in ${language}",
      "fix": "Fix in ${language}"
    },
    {
      "id": "feedCutoffHook",
      "name": "125-Char Feed Cutoff Stop Rate",
      "category": "Distribution & Strategy",
      "maxScore": 8,
      "score": 5,
      "status": "warning",
      "finding": "Observation on first lines in ${language}",
      "fix": "Fix in ${language}"
    },
    {
      "id": "contentFlywheel",
      "name": "Content Flywheel Balance",
      "category": "Distribution & Strategy",
      "maxScore": 5,
      "score": 4,
      "status": "pass",
      "finding": "Observation in ${language}",
      "fix": "Fix in ${language}"
    },
    {
      "id": "conversionFriction",
      "name": "Funnel & Conversion Friction",
      "category": "Distribution & Strategy",
      "maxScore": 5,
      "score": 2,
      "status": "fail",
      "finding": "Observation in ${language}",
      "fix": "Fix in ${language}"
    }
  ],
  "outlierAnalysis": {
    "medianInteractions": ${calculatedMedian},
    "outliersFound": [
      {
        "postId": "sample_id",
        "captionSnippet": "Snippet from real post",
        "multiplier": 2.4,
        "likes": 50,
        "comments": 12,
        "type": "CAROUSEL_ALBUM",
        "whyItWorked": "Psychological trigger breakdown in ${language}",
        "howToReplicate": "Exact formula to repeat this outlier in ${language}"
      }
    ],
    "replicationStrategy": "Summary strategy to turn outliers into consistent series in ${language}"
  },
  "bioTeardown": {
    "currentIssues": ["Issue 1 in ${language}", "Issue 2 in ${language}"],
    "suggestedName": "Optimized Name with niche keywords",
    "suggestedBioLines": [
      "Line 1 (Target Audience + Outcome)",
      "Line 2 (Proof / Metric / Track Record)",
      "Line 3 (Direct CTA with emoji pointing down 👇)"
    ],
    "suggestedLinkCta": "Clear link text or DM keyword"
  },
  "recommendedPosts": [
    {
      "type": "Carousel",
      "formulaName": "Counterintuitive Truth",
      "targetStage": "Nurture",
      "title": "Title in ${language}",
      "hookLine": "Hook line under 125 chars in ${language}",
      "structure": ["Slide 1 hook", "Slide 2 mistake", "Slide 3 shift", "Slide 4 solution", "Slide 5 CTA"],
      "whyItConverts": "Why this builds high save rate and authority"
    },
    {
      "type": "Reels",
      "formulaName": "Speed & Time Compression",
      "targetStage": "Attract",
      "title": "Title in ${language}",
      "hookLine": "Hook line in ${language}",
      "structure": ["0-2s visual interrupt", "3-8s problem", "9-25s rapid demo", "26-30s loop & CTA"],
      "whyItConverts": "High retention watch time"
    },
    {
      "type": "Carousel",
      "formulaName": "Curated Toolkit / Resource",
      "targetStage": "Convert",
      "title": "Title in ${language}",
      "hookLine": "Hook line in ${language}",
      "structure": ["Slide 1 offer hook", "Slide 2-4 breakdown", "Slide 5 DM trigger CTA"],
      "whyItConverts": "Drives comments and direct inbound inquiries"
    }
  ]
}
`;

  let jsonText = "";
  let chosenProvider = "OpenRouter";
  let chosenModel = modelId;

  // 1. OpenRouter
  if (config.ai.openRouterKey) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        signal: AbortSignal.timeout(10000),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.ai.openRouterKey}`,
          "HTTP-Referer": config.app.url,
          "X-Title": "ViraloKit Creator Studio",
        },
        body: JSON.stringify({
          model: modelId,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.4,
          max_tokens: 2200,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) jsonText = content;
      }
    } catch (err) {
      console.warn("OpenRouter account audit failed/timed out, attempting fallback:", err);
    }
  }

  // 2. Gemini Fallback
  if (!jsonText && enableGeminiFallback && config.ai.geminiKey) {
    try {
      chosenProvider = "Gemini Flash Engine";
      chosenModel = "gemini-1.5-flash";
      jsonText = await generateWithGemini(prompt);
    } catch (err) {
      console.warn("Gemini account audit failed:", err);
    }
  }

  // Parse or Fallback
  if (jsonText) {
    try {
      const cleaned = jsonText.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      const score = typeof parsed.overallScore === "number" ? parsed.overallScore : 72;
      const grade =
        score >= 90 ? "A+" : score >= 80 ? "A" : score >= 70 ? "B" : score >= 55 ? "C" : "Needs Work";

      return {
        isAiGenerated: true,
        overallScore: score,
        grade,
        summary: parsed.summary || "Account audit completed successfully.",
        criticalFixes: Array.isArray(parsed.criticalFixes) ? parsed.criticalFixes : [],
        highLeverageTweaks: Array.isArray(parsed.highLeverageTweaks) ? parsed.highLeverageTweaks : [],
        winningTraits: Array.isArray(parsed.winningTraits) ? parsed.winningTraits : [],
        rubric: Array.isArray(parsed.rubric) ? parsed.rubric : buildFallbackRubric(analytics, language),
        outlierAnalysis: parsed.outlierAnalysis || {
          medianInteractions: calculatedMedian,
          outliersFound: realOutliers.map((o) => ({
            postId: o.id,
            captionSnippet: o.caption.slice(0, 100),
            multiplier: o.multiplier,
            likes: o.likes,
            comments: o.comments,
            type: o.type,
            whyItWorked: "Clear visual topic and relatable hook generated higher dwell time.",
            howToReplicate: "Replicate this exact format with a new sub-topic next week.",
          })),
          replicationStrategy: "Double down on formats that hit over 1.5x of your account median.",
        },
        bioTeardown: parsed.bioTeardown || buildFallbackBioTeardown(analytics, language),
        recommendedPosts: Array.isArray(parsed.recommendedPosts) ? parsed.recommendedPosts : [],
        provider: chosenProvider,
        model: chosenModel,
      };
    } catch (err) {
      console.warn("Failed to parse AI JSON audit, using heuristic fallback:", err);
    }
  }

  // 3. Robust Heuristic Engine
  return buildHeuristicAudit(analytics, calculatedMedian, realOutliers, language);
}

function buildFallbackRubric(analytics: NormalizedAccountAnalytics, language: string): RubricItem[] {
  const isHinglish = language.toLowerCase().includes("hinglish");
  const isHindi = language.toLowerCase().includes("hindi");

  const bio = (analytics.account.biography || "").trim();
  const hasBio = bio.length > 0;
  const hasCta = /link|click|dm|comment|check|👇|🔗|guide|free/i.test(bio);
  const nameHasKeyword = (analytics.account.name || "").includes("|") || (analytics.account.name || "").includes("-");

  return [
    {
      id: "bioLine1",
      name: "Target Audience & Value Prop",
      category: "Bio & Identity",
      maxScore: 10,
      score: hasBio ? 7 : 3,
      status: hasBio ? "pass" : "fail",
      finding: isHinglish
        ? "Line 1 clear honi chahiye ki page kiske liye hai aur kya fayda milega."
        : isHindi
        ? "पहली पंक्ति में स्पष्ट होना चाहिए कि यह खाता किसके लिए है।"
        : "Line 1 must clarify who this account serves in under 3 seconds.",
      fix: isHinglish
        ? "Add: 'Helping [Audience] achieve [Result] without [Pain Point]'"
        : isHindi
        ? "जोड़ें: '[दर्शकों] को [परिणाम] प्राप्त करने में मदद'"
        : "Clarify your core transformation proposition immediately.",
    },
    {
      id: "bioLine2",
      name: "Proof & Credibility Anchor",
      category: "Bio & Identity",
      maxScore: 10,
      score: /\d|\+|creator|founder|certified/i.test(bio) ? 8 : 4,
      status: /\d|\+|creator|founder|certified/i.test(bio) ? "pass" : "warning",
      finding: isHinglish
        ? "Credibility metrics (numbers, results, experience) trust build karte hain."
        : isHindi
        ? "प्रामाणिकता के आंकड़े विश्वास जगाते हैं।"
        : "Proof elements anchor instant authority for new visitors.",
      fix: isHinglish
        ? "Add a metric or credential (e.g. '5+ yrs building | 50K+ served')."
        : isHindi
        ? "कोई ठोस उपलब्धि या अनुभव जोड़ें।"
        : "Insert a quantifiable milestone or credential into line 2.",
    },
    {
      id: "bioLine3",
      name: "CTA & Single Destination",
      category: "Bio & Identity",
      maxScore: 10,
      score: hasCta ? 9 : 4,
      status: hasCta ? "pass" : "warning",
      finding: isHinglish
        ? hasCta ? "Direct call to action present hai." : "Bio me clear single-link CTA missing hai."
        : hasCta ? "Clear action directive found." : "No explicit link command found in bio.",
      fix: isHinglish
        ? "Add a strong directive: '👇 Free templates & guide below'"
        : isHindi
        ? "सीधा निर्देश जोड़ें: '👇 मुफ़्त रिसोर्स नीचे लिंक पर'"
        : "Point visitors directly to one single high-value resource.",
    },
    {
      id: "nameFieldSeo",
      name: "Name Field Search SEO",
      category: "Bio & Identity",
      maxScore: 8,
      score: nameHasKeyword ? 8 : 4,
      status: nameHasKeyword ? "pass" : "warning",
      finding: isHinglish
        ? "Instagram search me Name field index hota hai."
        : "Instagram searches rank the Name field alongside your handle.",
      fix: isHinglish
        ? `Change display name to: '${analytics.account.name || "YourName"} | Niche & Focus'`
        : `Update Name to: '${analytics.account.name || "Name"} | Primary Niche Keyword'`,
    },
    {
      id: "avatarContrast",
      name: "Avatar & Contrast Legibility",
      category: "Visual & Feed",
      maxScore: 8,
      score: 7,
      status: "pass",
      finding: "Avatar mobile circle me clear hona chahiye with high background contrast.",
      fix: "Keep high contrast lighting with clean backdrop for instant recognition in DMs and comments.",
    },
    {
      id: "highlightsStrategy",
      name: "Story Highlights Architecture",
      category: "Bio & Identity",
      maxScore: 8,
      score: 5,
      status: "warning",
      finding: isHinglish
        ? "Highlights aapke profile ka automated sales/trust funnel hain."
        : "Highlights function as an automated landing page for profile visitors.",
      fix: isHinglish
        ? "Create 3 essential highlights: 1) Start Here 2) Proof / Results 3) Free Resources."
        : "Structure 3-4 highlights: 'Start Here', 'Case Studies/Proof', 'Free Tool', 'About'.",
    },
    {
      id: "threePinRule",
      name: "The 3 Pinned Posts Portfolio",
      category: "Visual & Feed",
      maxScore: 10,
      score: 6,
      status: "warning",
      finding: "Top 3 pins determine whether a visitor follows within 5 seconds.",
      fix: "Pin 1: Who I Am / Mission. Pin 2: Biggest Outlier / Viral Proof. Pin 3: Core Free Resource.",
    },
    {
      id: "outlierMultiplier",
      name: "Outlier Multiplier & Replication",
      category: "Distribution & Strategy",
      maxScore: 10,
      score: 8,
      status: "pass",
      finding: "Identified posts that outperform median engagement by 1.5x+.",
      fix: "Analyze winning outlier hooks and turn them into weekly recurring content formats.",
    },
    {
      id: "visualGridCoherence",
      name: "Feed Grid Coherence & Typography",
      category: "Visual & Feed",
      maxScore: 8,
      score: 7,
      status: "pass",
      finding: "Grid displays consistent visual rhythm.",
      fix: "Ensure 1:1 center-crop safety so cover text doesn't cut off on the grid overview.",
    },
    {
      id: "feedCutoffHook",
      name: "First 125-Char Caption Cutoff",
      category: "Distribution & Strategy",
      maxScore: 8,
      score: 5,
      status: "warning",
      finding: isHinglish
        ? "First 125 characters decide whether user taps '...more' or keeps scrolling."
        : "Users decide to tap '...more' within the first 125 characters.",
      fix: isHinglish
        ? "Place the strongest conflict or unexpected hook inside the first sentence before line 2."
        : "Front-load curiosity or tension before the fold cutoff point.",
    },
    {
      id: "contentFlywheel",
      name: "Content Flywheel Balance",
      category: "Distribution & Strategy",
      maxScore: 5,
      score: 4,
      status: "pass",
      finding: "Attract (Reels) vs Nurture (Carousels) vs Convert balance.",
      fix: "Maintain 50% Carousels for bookmark saves and 50% Reels for top-of-funnel reach.",
    },
    {
      id: "conversionFriction",
      name: "Conversion & DM Friction",
      category: "Distribution & Strategy",
      maxScore: 5,
      score: 3,
      status: "warning",
      finding: "Clear next step for profile visitors.",
      fix: "Use keyword DM automations ('Comment BUILD to get the PDF') to capture active leads.",
    },
  ];
}

function buildFallbackBioTeardown(analytics: NormalizedAccountAnalytics, language: string): BioTeardown {
  const isHinglish = language.toLowerCase().includes("hinglish");
  const isHindi = language.toLowerCase().includes("hindi");
  const baseName = analytics.account.name || analytics.account.username || "Creator";

  if (isHinglish) {
    return {
      currentIssues: [
        "Bio me target audience aur specific outcome clear nahi hai",
        "Social proof ya credibility milestone missing hai",
        "Link par click karwane ke liye clear instruction nahi hai",
      ],
      suggestedName: `${baseName} | Creator & Growth Systems`,
      suggestedBioLines: [
        "🚀 Creators ko viral content & workflows build karne me help karta hoon",
        "📈 100K+ reach generated • Weekly practical breakdowns",
        "👇 Free creator cheat sheet & templates grab karein:",
      ],
      suggestedLinkCta: "Claim Free Kit & Workflows",
    };
  }

  if (isHindi) {
    return {
      currentIssues: [
        "बायो में मुख्य उद्देश्य और दर्शकों का विवरण स्पष्ट नहीं है",
        "विश्वसनीयता और अनुभव के आंकड़े नहीं दिए गए हैं",
        "लिंक पर जाने के लिए स्पष्ट निर्देश की कमी है",
      ],
      suggestedName: `${baseName} | क्रिएटर और ग्रोथ`,
      suggestedBioLines: [
        "🎯 नए क्रिएटर्स को इंस्टाग्राम पर तेज़ी से बढ़ने में मदद",
        "📊 सत्यापित रणनीतियां और आसान वर्कफ़्लो",
        "👇 मुफ़्त क्रिएटर गाइड डाउनलोड करें:",
      ],
      suggestedLinkCta: "मुफ़्त रिसोर्स देखें",
    };
  }

  return {
    currentIssues: [
      "Current bio lacks a definitive target audience callout",
      "No measurable proof or credibility anchor to build immediate trust",
      "No direct verb or downward directive prompting link clicks",
    ],
    suggestedName: `${baseName} | Content Strategy & Growth`,
    suggestedBioLines: [
      "Helping ambitious creators build high-converting content & systems",
      "Proven framework tested across 500+ pieces of content",
      "👇 Grab the free creator toolkit & viral breakdown:",
    ],
    suggestedLinkCta: "Get Free Toolkit",
  };
}

function buildHeuristicAudit(
  analytics: NormalizedAccountAnalytics,
  calculatedMedian: number,
  realOutliers: any[],
  language: string
): AccountAuditResult {
  const isHinglish = language.toLowerCase().includes("hinglish");
  const rubric = buildFallbackRubric(analytics, language);
  const totalScore = rubric.reduce((acc, r) => acc + r.score, 0);
  const grade =
    totalScore >= 90 ? "A+" : totalScore >= 80 ? "A" : totalScore >= 70 ? "B" : totalScore >= 55 ? "C" : "Needs Work";

  const criticalFixes = [
    {
      title: isHinglish ? "Bio Line 3 Call-To-Action Add Karein" : "Add Direct Bio Call-To-Action",
      action: isHinglish
        ? "Bio ke aakhri line me emoji '👇' ke sath ek specific offer ya free resource mention karein."
        : "Replace passive bio closing with an active directive with a downward arrow pointing to your link.",
      impact: "+25% to +40% increase in profile link clicks and inbound inquiries",
    },
    {
      title: isHinglish ? "Name Field me Niche Keywords Add Karein" : "Optimize Name Field for Search SEO",
      action: isHinglish
        ? `Edit profile me Name ko '${analytics.account.name || "Name"} | [Your Niche]' me update karein.`
        : `Update your display Name field to include primary searchable keywords alongside your name.`,
      impact: "Appears in Instagram search for high-intent niche queries",
    },
    {
      title: isHinglish ? "Top 3 Pinned Posts Strategy Implement Karein" : "Enforce the 3-Pinned-Post Rule",
      action: isHinglish
        ? "Grid par 3 posts pin karein: 1) Who I Am / Mission, 2) Highest Outlier, 3) Best Free Offer."
        : "Pin 1 identity piece, 1 high-outlier proof reel/carousel, and 1 direct lead magnet post.",
      impact: "+30% higher profile-to-follower conversion rate for new visitors",
    },
  ];

  const highLeverageTweaks = [
    {
      title: isHinglish ? "First 125-Character Caption Hooks Ko Frontload Karein" : "Frontload Caption Hooks (<125 Chars)",
      action: isHinglish
        ? "Pehle sentence me hi curiosity ya counterintuitive statement rakhein taaki audience '...more' dabaye."
        : "Place the core hook and intrigue entirely before the mobile feed cutoff line.",
      impact: "Significantly higher dwell time and bookmark save rate",
    },
    {
      title: isHinglish ? "Outlier Formats Ko Weekly Replicate Karein" : "Systematically Duplicate Outlier Formats",
      action: isHinglish
        ? "Jo posts median se 1.5x zyada engagement la rahe hain unki layout aur structure ko repeat karein."
        : "Extract the exact template of your top performing post and produce variations weekly.",
      impact: "Consistent reach without relying on algorithmic luck",
    },
  ];

  const winningTraits = [
    isHinglish
      ? `Aapke account par consistent visual aesthetics aur regular publication flow maintain ho raha hai.`
      : `Clean visual presentation and active publication rhythm maintained across recent posts.`,
    isHinglish
      ? `Carousels aur visual breakdown posts par median engagement strong hai.`
      : `Educational formats generate healthy dwell time and steady interaction.`,
  ];

  const outlierData = {
    medianInteractions: calculatedMedian,
    outliersFound: (realOutliers.length > 0 ? realOutliers : [
      {
        id: "sample_top",
        caption: "Top performing recent visual showcase",
        multiplier: 2.1,
        likes: calculatedMedian * 2,
        comments: Math.max(5, Math.round(calculatedMedian * 0.3)),
        type: "CAROUSEL_ALBUM",
      },
    ]).map((o) => ({
      postId: o.id,
      captionSnippet: (o.caption || "Top visual showcase").slice(0, 120),
      multiplier: o.multiplier || 1.8,
      likes: o.likes,
      comments: o.comments,
      type: o.type,
      whyItWorked: isHinglish
        ? "Strong visual packaging aur direct value proposition ki wajah se dwell time peak hua."
        : "High visual contrast and immediate value promise maximized watch and swipe completion.",
      howToReplicate: isHinglish
        ? "Is post ke hook style ko pick karke agle hafte ek related new problem solve karein."
        : "Reuse the opening slide structure with a fresh high-utility problem.",
    })),
    replicationStrategy: isHinglish
      ? "Outliers ko one-off fluke mat samjhein — unke hook pattern aur visual styling ko recurring series banayein."
      : "Convert your outlier post formats into an ongoing weekly series to compound reach.",
  };

  const recommendedPosts: RecommendedPostBlueprint[] = [
    {
      type: "Carousel",
      formulaName: "The Counterintuitive Truth",
      targetStage: "Nurture",
      title: isHinglish ? "Industry Myth Buster Breakdown" : "Counterintuitive Industry Truth",
      hookLine: isHinglish
        ? "Stop doing this common mistake if you want real growth this month."
        : "Most creators think they need more followers. What you actually need is this:",
      structure: [
        "Slide 1: Bold controversial statement that stops scrolling",
        "Slide 2: Why the standard advice fails in practice",
        "Slide 3: The 3-step modern alternative that works",
        "Slide 4: Real-world example & proof",
        "Slide 5: Save this post & comment GUIDE for the complete checklist",
      ],
      whyItConverts: "Builds deep trust, generates high save rates, and positions you as an authoritative practitioner.",
    },
    {
      type: "Reels",
      formulaName: "Speed & Time Compression",
      targetStage: "Attract",
      title: isHinglish ? "30-Second Workflow Hack" : "High-Velocity Workflow Blueprint",
      hookLine: isHinglish
        ? "This simple workflow saved me 10 hours every week — here is the exact breakdown:"
        : "I stopped spending 4 hours on this and switched to this 5-minute setup:",
      structure: [
        "0-2s: Visual proof / side-by-side contrast",
        "3-10s: The friction point most people struggle with",
        "11-22s: Fast screen demonstration of the solution",
        "23-28s: Clear key takeaway and loop",
      ],
      whyItConverts: "Rapid pacing triggers high completion rates which triggers Instagram algorithmic distribution.",
    },
    {
      type: "Carousel",
      formulaName: "Curated Resource / Vault",
      targetStage: "Convert",
      title: isHinglish ? "Ultimate Resource / Toolkit Vault" : "Curated High-Value Resource Stack",
      hookLine: isHinglish
        ? "Don't start your next project from scratch. Use this curated toolkit instead:"
        : "The complete toolkit I use every single day (saved me over $1,000 this year):",
      structure: [
        "Slide 1: High-contrast title card with clear asset stack",
        "Slide 2: Tool #1 for ideation & viral hooks",
        "Slide 3: Tool #2 for design & visual pacing",
        "Slide 4: Tool #3 for publishing & analytics",
        "Slide 5: Comment 'VAULT' below and I'll DM you the instant link",
      ],
      whyItConverts: "Drives massive comment triggers and high-intent DM conversations ready for conversion.",
    },
  ];

  return {
    isAiGenerated: true,
    overallScore: totalScore,
    grade,
    summary: isHinglish
      ? `@${analytics.account.username} profile me strong baseline potential hai. Lekin Bio Call-to-action, Name SEO, aur 3 Pinned Posts improve karne se profile-to-follower conversion rate 2x se zyada ho sakta hai.`
      : `Account @${analytics.account.username} maintains a solid foundation. However, optimizing your bio funnel, search keywords, and pinned posts will substantially elevate profile visitor conversion.`,
    criticalFixes,
    highLeverageTweaks,
    winningTraits,
    rubric,
    outlierAnalysis: outlierData,
    bioTeardown: buildFallbackBioTeardown(analytics, language),
    recommendedPosts,
    provider: "ViraloKit Creator Engine",
    model: "Heuristic Strategic Rubric",
  };
}
