"use client";

import React, { useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  UploadCloud,
  Sparkles,
  Layers,
  Image as ImageIcon,
  Trash2,
  MoveLeft,
  MoveRight,
  Send,
  Loader2,
  CheckCircle2,
  RefreshCw,
  Wand2,
  Hash,
  AlertCircle,
  Calendar,
  Bookmark,
  Plus,
  X,
  Sliders,
  Check,
  ShieldCheck,
  Eye,
  Info,
  Clock,
  Link as LinkIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Header } from "@/components/layout/header";
import { InstagramPostPreview } from "@/components/instagram/post-preview";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageAnalysisResult } from "@/lib/ai/image-analysis";
import { HOOK_FORMULAS, scoreHook } from "@/lib/ai/hooks-data";
import { humanizeCaption } from "@/lib/ai/humanizer";
import { lintInstagramCaption } from "@/lib/ai/caption-linter";
import { DateTimePicker, formatIndianDateTimeDisplay } from "@/components/ui/date-time-picker";

function sanitizeCaption(text: string): string {
  if (!text) return "";
  const trimmed = text.trim();
  if (trimmed.startsWith("{") && (trimmed.includes('"caption"') || trimmed.includes("'caption'"))) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && parsed.caption) return String(parsed.caption);
    } catch {
      const match = trimmed.match(/"caption"\s*:\s*"([\s\S]*?)(?:"\s*,\s*"(?:cta|hashtags)"|"$|(?<!\\)")/);
      if (match && match[1]) {
        return match[1].replace(/\\n/g, "\n").replace(/\\"/g, '"').trim();
      }
    }
  }
  return text;
}

// Converts Date to local format "YYYY-MM-DDTHH:mm" for HTML5 datetime-local input
function formatToLocalDateTimeInput(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Formats a local date-time string into Indian Standard Time (IST) 12-hour AM/PM format
function formatIndianDateTime(isoOrLocalString: string): string {
  if (!isoOrLocalString) return "";
  try {
    const d = new Date(isoOrLocalString);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return isoOrLocalString;
  }
}

// Relative countdown in human-friendly format
function getRelativeTimeIST(isoOrLocalString: string): string {
  if (!isoOrLocalString) return "";
  try {
    const target = new Date(isoOrLocalString).getTime();
    const diffMs = target - Date.now();
    if (diffMs <= 0) return "Right now";
    const diffMins = Math.round(diffMs / (60 * 1000));
    if (diffMins < 60) return `in ${diffMins} min${diffMins > 1 ? "s" : ""}`;
    const diffHours = Math.floor(diffMins / 60);
    const remMins = diffMins % 60;
    if (diffHours < 24) {
      return `in ${diffHours}h ${remMins > 0 ? `${remMins}m` : ""}`;
    }
    const days = Math.floor(diffHours / 24);
    return `in ${days} day${days > 1 ? "s" : ""}`;
  } catch {
    return "";
  }
}

// Quick Indian Time presets generator
function getPresetTime(type: "15m" | "30m" | "1h" | "tonight" | "tomorrow_morning" | "tomorrow_evening"): string {
  const now = new Date();
  if (type === "15m") {
    return formatToLocalDateTimeInput(new Date(now.getTime() + 15 * 60 * 1000));
  }
  if (type === "30m") {
    return formatToLocalDateTimeInput(new Date(now.getTime() + 30 * 60 * 1000));
  }
  if (type === "1h") {
    return formatToLocalDateTimeInput(new Date(now.getTime() + 60 * 60 * 1000));
  }
  if (type === "tonight") {
    const tonight = new Date();
    tonight.setHours(21, 0, 0, 0); // 9:00 PM
    if (tonight.getTime() <= now.getTime()) {
      tonight.setHours(22, 0, 0, 0); // 10:00 PM
    }
    return formatToLocalDateTimeInput(tonight);
  }
  if (type === "tomorrow_morning") {
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    tmrw.setHours(9, 0, 0, 0); // 9:00 AM
    return formatToLocalDateTimeInput(tmrw);
  }
  if (type === "tomorrow_evening") {
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    tmrw.setHours(19, 0, 0, 0); // 7:00 PM
    return formatToLocalDateTimeInput(tmrw);
  }
  return formatToLocalDateTimeInput(new Date(now.getTime() + 60 * 60 * 1000));
}

export default function CreatePostPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [postType, setPostType] = useState<"IMAGE" | "CAROUSEL" | "REELS" | "STORIES">("IMAGE");
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "4:5" | "9:16">("4:5");
  const [images, setImages] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState<string[]>(["#digitalmarketing", "#contentcreator"]);
  const [customTagInput, setCustomTagInput] = useState("");
  const [scheduledFor, setScheduledFor] = useState<string>("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [mediaUrlInput, setMediaUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Load saved creator theme from settings if available
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("viralokit_creator_theme");
      if (saved) setCustomPrompt(saved);
      const savedKey = localStorage.getItem("viralokit_gemini_api_key");
      if (savedKey) setUserGeminiKey(savedKey);
      const savedModel = localStorage.getItem("viralokit_gemini_model");
      if (savedModel && savedModel !== "gemini-1.5-flash" && savedModel !== "openrouter/free") {
        setSelectedModel(savedModel);
      } else {
        setSelectedModel("gemini-3.5-flash");
      }
    }
  }, []);

  // AI & Upload States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, "uploading" | "done" | "error">>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ImageAnalysisResult | null>(null);
  const [selectedTone, setSelectedTone] = useState("Creator");
  const [selectedModel, setSelectedModel] = useState("gemini-3.5-flash");
  const [userGeminiKey, setUserGeminiKey] = useState<string>("");
  const [selectedHookFormulaId, setSelectedHookFormulaId] = useState<number | null>(3); // Default to #3 "Nobody Tells You"
  const [showFeedInspector, setShowFeedInspector] = useState(true);
  const [publishStatus, setPublishStatus] = useState<
    "idle" | "uploading" | "creating_container" | "processing" | "publishing" | "published" | "failed"
  >("idle");

  // Real-time Hook Score & Caption Linter (Jake Schincariol 125-char algorithm logic)
  const hookScore = useMemo(() => {
    const firstLine = (caption || "").split("\n")[0] || "";
    return scoreHook(firstLine);
  }, [caption]);

  const lintReport = useMemo(() => {
    return lintInstagramCaption(caption || "");
  }, [caption]);

  // Fetch Connected Account Info
  const { data: accountData } = useQuery({
    queryKey: ["meta-account"],
    queryFn: async () => {
      const res = await fetch("/api/meta/account");
      return res.json();
    },
  });

  // Fetch Dynamic Free Models
  const { data: modelsData, isLoading: isModelsLoading } = useQuery({
    queryKey: ["ai-models"],
    queryFn: async () => {
      const res = await fetch("/api/ai/models");
      return res.json();
    },
  });

  // Client-side image optimizer to stay well below Vercel's 4.5MB limit
  const optimizeImageForUpload = async (file: File): Promise<File | Blob> => {
    if (file.size <= 1.2 * 1024 * 1024) return file;
    if (!file.type.startsWith("image/") || file.type.includes("gif") || file.type.includes("svg")) return file;

    return new Promise((resolve) => {
      let resolved = false;
      let objectUrl = "";

      const safeResolve = (res: File | Blob) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeoutId);
          try {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
          } catch {}
          resolve(res);
        }
      };

      // 3.5s timeout safety: if canvas or image decoding hangs, don't stall upload
      const timeoutId = setTimeout(() => {
        safeResolve(file);
      }, 3500);

      try {
        objectUrl = URL.createObjectURL(file);
      } catch {
        safeResolve(file);
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          const maxDimension = 1920;
          let { width, height } = img;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            safeResolve(file);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob && blob.size < file.size) {
                safeResolve(new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), { type: "image/jpeg" }));
              } else {
                safeResolve(file);
              }
            },
            "image/jpeg",
            0.88
          );
        } catch {
          safeResolve(file);
        }
      };
      img.onerror = () => {
        safeResolve(file);
      };
      img.src = objectUrl;
    });
  };

  // Auto-populate hook from AI audit blueprint if passed in URL
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const incomingHook = params.get("hook");
      if (incomingHook) {
        setCaption((prev) => (prev ? prev : `${incomingHook}\n\n`));
      }
    }
  }, []);

  // Process files with instant optimistic local preview + sequential CDN sync
  const processAndUploadFiles = async (files: FileList | File[]) => {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    if (postType === "IMAGE" && fileList.length > 1) {
      toast.info("Switched to Carousel mode for multiple images.");
      setPostType("CAROUSEL");
    }

    if (postType === "CAROUSEL" && images.length + fileList.length > 10) {
      toast.error("Instagram carousels support a maximum of 10 images.");
      return;
    }
    
    if ((postType === "REELS" || postType === "STORIES" || postType === "IMAGE") && fileList.length > 1) {
      toast.error(`Only 1 file can be uploaded for ${postType}.`);
      return;
    }

    // 1. INSTANT LOCAL PREVIEWS: Shows thumbnails in editor & Live Phone Preview IMMEDIATELY!
    const localPreviews = fileList.map((file) => URL.createObjectURL(file));

    if (postType === "IMAGE" || postType === "REELS" || postType === "STORIES") {
      setImages([localPreviews[0]]);
    } else {
      setImages((prev) => [...prev, ...localPreviews].slice(0, 10));
    }

    // Mark newly selected previews as actively syncing to CDN
    setUploadProgress((prev) => {
      const next = { ...prev };
      localPreviews.forEach((url) => {
        next[url] = "uploading";
      });
      return next;
    });

    setIsUploading(true);
    let successCount = 0;

    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const localUrl = localPreviews[i];

        toast.loading(`Uploading slide ${i + 1} of ${fileList.length} to Cloudinary...`, { id: "upload-toast" });

        try {
          const optimized = await optimizeImageForUpload(file);
          const formData = new FormData();
          formData.append("file", optimized);

          const res = await fetch("/api/cloudinary/upload", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            const rawText = await res.text();
            let errText = `Upload failed for ${file.name}`;
            try {
              const parsed = JSON.parse(rawText);
              errText = parsed.error || errText;
            } catch {
              if (rawText.includes("Request Entity Too Large") || res.status === 413) {
                errText = `Image "${file.name}" is too large. Please select a smaller image.`;
              }
            }
            throw new Error(errText);
          }

          const data = await res.json();
          const uploadedUrl = data.assets?.[0]?.secureUrl || data.asset?.secureUrl;
          if (!uploadedUrl) {
            throw new Error("No secure CDN URL returned from Cloudinary.");
          }

          // Swap local preview URL with secure Cloudinary CDN URL immediately
          setImages((prev) =>
            prev.map((img) => (img === localUrl ? uploadedUrl : img))
          );

          setUploadProgress((prev) => ({
            ...prev,
            [localUrl]: "done",
            [uploadedUrl]: "done",
          }));

          successCount++;
        } catch (slideErr: any) {
          console.error(`Slide ${i + 1} upload failed:`, slideErr);
          setUploadProgress((prev) => ({
            ...prev,
            [localUrl]: "error",
          }));
          toast.error(`Slide ${i + 1} upload failed: ${slideErr?.message || "CDN error"}`, {
            id: `upload-err-${i}`,
          });
        }
      }

      if (successCount === fileList.length) {
        toast.success(`Successfully uploaded all ${successCount} slide(s) to Cloudinary CDN!`, { id: "upload-toast" });
      } else if (successCount > 0) {
        toast.info(`${successCount} of ${fileList.length} slide(s) uploaded. Remove failed slides before publishing.`, { id: "upload-toast" });
      } else {
        toast.error("Failed to upload slides to CDN. Please check connection and try again.", { id: "upload-toast" });
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload images.", { id: "upload-toast" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processAndUploadFiles(e.target.files);
    }
  };

  const handleAddMediaUrl = () => {
    const url = mediaUrlInput.trim();
    if (!url) return;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      toast.error("Please enter a valid HTTP or HTTPS media URL.");
      return;
    }
    if (postType === "IMAGE" && images.length >= 1) {
      toast.info("Switched to Carousel mode for multiple images.");
      setPostType("CAROUSEL");
    }
    setImages((prev) => [...prev, url].slice(0, 10));
    setMediaUrlInput("");
    setShowUrlInput(false);
    toast.success("Media URL added to post!");
  };

  // Reordering carousel slides
  const moveImage = (index: number, direction: "left" | "right") => {
    const newIndex = direction === "left" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;
    const copy = [...images];
    const temp = copy[index];
    copy[index] = copy[newIndex];
    copy[newIndex] = temp;
    setImages(copy);
  };

  const removeImage = (index: number) => {
    const target = images[index];
    if (target && target.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(target);
      } catch {}
    }
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (target) {
      setUploadProgress((prev) => {
        const copy = { ...prev };
        delete copy[target];
        return copy;
      });
    }
  };

  const handlePurgeFromCloudinary = async () => {
    try {
      toast.loading("Purging images from Cloudinary to free CDN space...", { id: "purge-cdn" });
      const res = await fetch("/api/cloudinary/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_all" }),
      });
      const data = await res.json();
      if (data.success) {
        setImages([]);
        toast.success(data.message || "All uploads purged from Cloudinary! CDN quota freed.", { id: "purge-cdn" });
      } else {
        toast.error(data.error || "Failed to purge CDN media", { id: "purge-cdn" });
      }
    } catch {
      toast.error("Network error while purging CDN storage", { id: "purge-cdn" });
    }
  };

  // AI Image Analysis
  const handleAnalyzeImage = async () => {
    if (images.length === 0) {
      toast.error("Please upload an image first to analyze.");
      return;
    }

    if (isUploading || images[0].startsWith("blob:")) {
      toast.info("Please wait a moment for the image to finish syncing to CDN before AI analysis.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/ai/analyze-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(userGeminiKey ? { "x-gemini-api-key": userGeminiKey } : {}),
        },
        body: JSON.stringify({
          imageUrl: images[0],
          modelId: selectedModel,
          apiKey: userGeminiKey || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to analyze image");
      }

      setAnalysisResult(data);
      toast.success("AI Image Analysis complete!");
    } catch (err: any) {
      toast.error(err?.message || "AI Analysis unavailable. Check your Gemini API key in Settings.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // AI Caption Generation
  const handleGenerateCaption = async (action: string = "generate") => {
    setIsGeneratingCaption(true);
    try {
      const context = analysisResult
        ? `Subject: ${analysisResult.subject}. Mood: ${analysisResult.mood}. Style: ${analysisResult.style}. Keywords: ${analysisResult.keywords.join(", ")}`
        : "Visual creator Instagram post.";

      const res = await fetch("/api/ai/generate-caption", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(userGeminiKey ? { "x-gemini-api-key": userGeminiKey } : {}),
        },
        body: JSON.stringify({
          imageUrl: images.length > 0 ? images[0] : undefined,
          customPrompt: customPrompt.trim() || undefined,
          context,
          tone: selectedTone,
          action,
          currentCaption: caption,
          modelId: selectedModel,
          apiKey: userGeminiKey || undefined,
          hookFormulaId: selectedHookFormulaId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Caption generation failed");
      }

      const cleanCaption = sanitizeCaption(data.caption);
      setCaption(cleanCaption);
      if (Array.isArray(data.hashtags) && data.hashtags.length > 0) {
        setHashtags(data.hashtags.slice(0, 5));
      }
      toast.success(
        data.hookScore?.grade === "STRONG"
          ? `Generated with Hook Score: ${data.hookScore.score}/100 (Strong)!`
          : "Caption generated with AI!"
      );
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate caption.");
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  // Instant Anti-AI Slop Humanizer (Strips buzzwords & em dashes)
  const handleHumanize = () => {
    if (!caption) {
      toast.error("Write or generate a caption first.");
      return;
    }
    const res = humanizeCaption(caption);
    setCaption(res.humanized);
    if (res.flaggedWords.length > 0) {
      toast.success(`Humanized! Cleaned AI words: ${res.flaggedWords.join(", ")}`);
    } else {
      toast.success("Caption is already 100% human-grade!");
    }
  };

  // Publish Post Flow
  const handlePublish = async () => {
    if (images.length === 0) {
      toast.error("Please upload at least one image before publishing.");
      return;
    }

    if (isUploading) {
      toast.error("Please wait for all images to finish syncing to Cloudinary CDN.");
      return;
    }

    if (images.some((img) => img.startsWith("blob:"))) {
      toast.error("Some slides haven't finished uploading to CDN. Please wait or remove failed slides.");
      return;
    }

    if (postType === "CAROUSEL" && images.length < 2) {
      toast.error("Instagram carousel posts require at least 2 images (up to 10).");
      return;
    }

    if (!accountData?.connected) {
      toast.error("No Instagram account connected. Please visit Settings to connect.");
      return;
    }

    setPublishStatus("uploading");

    try {
      setPublishStatus("creating_container");
      // Sanitize and append hashtags to caption if not already present
      const cleanUserCaption = sanitizeCaption(caption);
      let finalCaption = cleanUserCaption;
      if (hashtags.length > 0 && !finalCaption.includes("#")) {
        finalCaption = `${finalCaption}\n\n${hashtags.join(" ")}`;
      }

      setPublishStatus("processing");
      const res = await fetch("/api/meta/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaType: postType,
          caption: finalCaption,
          imageUrls: images,
          scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Publishing rejected by Meta Graph API");
      }

      if (data.status === "scheduled") {
        setPublishStatus("idle");
        toast.success(`Post successfully scheduled for ${formatIndianDateTimeDisplay(scheduledFor)} (IST)!`);
        setTimeout(() => {
          router.push("/posts");
        }, 1200);
        return;
      }

      setPublishStatus("published");
      toast.success("Successfully published to Instagram!");
      setTimeout(() => {
        router.push("/posts");
      }, 1500);
    } catch (err: any) {
      setPublishStatus("failed");
      toast.error(err?.message || "Failed to publish post.");
    }
  };

  const addHashtag = (rawTag: string) => {
    let clean = rawTag.trim();
    if (!clean) return;
    if (!clean.startsWith("#")) clean = `#${clean}`;
    if (!hashtags.includes(clean)) {
      setHashtags((prev) => [...prev, clean]);
      toast.success(`Added ${clean}`);
    }
    setCustomTagInput("");
  };

  const removeHashtag = (tagToRemove: string) => {
    setHashtags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleSaveDraft = () => {
    try {
      localStorage.setItem(
        "viralokit_post_draft",
        JSON.stringify({
          postType,
          aspectRatio,
          images,
          caption,
          hashtags,
          selectedTone,
          savedAt: new Date().toISOString(),
        })
      );
      toast.success("Draft saved to browser storage!");
    } catch {
      toast.error("Failed to save draft locally.");
    }
  };

  const tones = ["Creator", "Aesthetic", "Minimal", "Casual", "Professional", "Hinglish", "Hindi", "English"];
  const suggestedTags = ["#growth", "#creatorlife", "#instatips", "#aesthetic", "#reelstrending", "#foryou"];

  return (
    <div className="flex min-h-screen bg-[#050505] overflow-hidden relative text-zinc-100 font-sans selection:bg-pink-500 selection:text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
        <Header
          accountUsername={accountData?.username}
          isConnected={accountData?.connected}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8 relative z-10">
          <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-pink-600/10 to-transparent blur-[120px] pointer-events-none" />
          
          {/* Top Bar: Title & Primary Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-pink-400 bg-pink-500/10 border border-pink-500/25 px-2.5 py-0.5 rounded-full">
                  Post Studio
                </span>
                <span className="text-[11px] text-zinc-500">• Meta Graph v23.0 Verified</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-headline flex items-center gap-2">
                Create & Publish
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Craft, analyze, and publish high-definition carousels and posts to @{accountData?.username || "Instagram"}.
              </p>
            </div>

            {/* Quick Top Actions */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveDraft}
                className="glass-panel text-xs gap-1.5 text-zinc-300 hover:text-white border-zinc-800 hover:border-zinc-700"
              >
                <Bookmark className="w-3.5 h-3.5 text-zinc-400" />
                <span>Save Draft</span>
              </Button>

              <div className="relative flex items-center">
                {scheduledFor ? (
                  <div className="flex items-center gap-1.5 bg-purple-950/40 border border-purple-500/40 px-2.5 py-1 rounded-lg text-xs">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-purple-200 font-medium text-[11px]">
                      🇮🇳 {formatIndianDateTimeDisplay(scheduledFor)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setScheduledFor("")}
                      className="text-zinc-400 hover:text-white ml-1 text-xs cursor-pointer"
                      title="Clear schedule (Publish immediately)"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => {
                      const d = new Date(Date.now() + 60 * 60 * 1000);
                      const pad = (n: number) => String(n).padStart(2, "0");
                      setScheduledFor(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
                    }}
                    className="glass-panel text-xs gap-1.5 text-zinc-300 hover:text-white border-zinc-800 hover:border-zinc-700 h-8 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    <span>Schedule Post</span>
                  </Button>
                )}
              </div>

              <Button
                size="sm"
                onClick={handlePublish}
                disabled={
                  images.length === 0 ||
                  isUploading ||
                  images.some((img) => img.startsWith("blob:")) ||
                  (postType === "CAROUSEL" && images.length < 2) ||
                  (publishStatus !== "idle" && publishStatus !== "failed")
                }
                className="primary-gradient-bg glow-primary text-white text-xs font-semibold gap-1.5 border-0 hover:opacity-95 shadow-lg transition-all"
              >
                {isUploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : publishStatus === "creating_container" ||
                publishStatus === "processing" ||
                publishStatus === "publishing" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>
                  {isUploading
                    ? "Syncing CDN..."
                    : scheduledFor
                    ? "Schedule Post"
                    : "Publish Now"}
                </span>
              </Button>
            </div>
          </div>

          {/* Publishing Workspace Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Media Upload & AI Studio (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Media Assets Section */}
              <div className="glass-card bg-white/5 border border-white/10 rounded-[2rem] p-6 sm:p-7 space-y-6 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
                  <div>
                    <h2 className="text-base font-bold text-white font-headline flex items-center gap-2">
                      <UploadCloud className="w-4 h-4 text-pink-400" />
                      <span>Media Assets</span>
                      {images.length > 0 && (
                        <Badge variant="secondary" className="text-[10px] py-0.5 px-2 bg-pink-500/10 text-pink-300 border-pink-500/20">
                          {images.length} {postType === "CAROUSEL" ? "/ 10 slides" : "selected"}
                        </Badge>
                      )}
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1">Upload high-resolution images or carousels (25 GB isolated CDN)</p>
                  </div>

                  {/* Post Type Selector (Single Image vs Carousel) */}
                  <div className="flex items-center gap-1 p-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl self-start sm:self-auto">
                    <button
                      onClick={() => {
                        setPostType("IMAGE");
                        setAspectRatio("4:5");
                        if (images.length > 1) setImages([images[0]]);
                      }}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                        postType === "IMAGE"
                          ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md font-semibold"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Single</span>
                    </button>

                    <button
                      onClick={() => {
                        setPostType("CAROUSEL");
                        setAspectRatio("4:5");
                      }}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                        postType === "CAROUSEL"
                          ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md font-semibold"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Carousel</span>
                    </button>

                    <button
                      onClick={() => {
                        setPostType("REELS");
                        setAspectRatio("9:16");
                        if (images.length > 1) setImages([images[0]]);
                      }}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                        postType === "REELS"
                          ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md font-semibold"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Reels (9:16)</span>
                    </button>

                    <button
                      onClick={() => {
                        setPostType("STORIES");
                        setAspectRatio("9:16");
                        if (images.length > 1) setImages([images[0]]);
                      }}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                        postType === "STORIES"
                          ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md font-semibold"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Stories (9:16)</span>
                    </button>
                  </div>
                </div>

                {/* Aspect Ratio Selector Pills */}
                <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                  <span className="text-zinc-400 text-xs font-medium flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-zinc-500" />
                    Preview Aspect Ratio:
                  </span>
                  <div className="flex items-center gap-2">
                    {(["1:1", "4:5", "9:16"] as const).map((ratio) => (
                      <button
                        key={ratio}
                        onClick={() => setAspectRatio(ratio)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                          aspectRatio === ratio
                            ? "bg-pink-500/20 text-pink-300 border border-pink-500/50 shadow-sm font-semibold"
                            : "bg-[#141414] border border-white/[0.08] text-zinc-400 hover:text-zinc-200 hover:border-white/20"
                        }`}
                      >
                        {ratio === "1:1" && "1:1 Square"}
                        {ratio === "4:5" && "4:5 Portrait"}
                        {ratio === "9:16" && "9:16 Story"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dotted Upload Dropzone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      processAndUploadFiles(e.dataTransfer.files);
                    }
                  }}
                  className="border-2 border-dashed border-zinc-700/80 hover:border-pink-500/60 bg-gradient-to-b from-zinc-900/40 via-zinc-950/50 to-zinc-900/30 hover:bg-zinc-900/40 rounded-2xl p-7 text-center cursor-pointer transition-all duration-300 group shadow-inner"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={postType === "REELS" ? "video/*" : postType === "STORIES" ? "image/*,video/*" : "image/*"}
                    multiple={postType === "CAROUSEL"}
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500/15 to-purple-500/15 border border-pink-500/25 flex items-center justify-center mx-auto mb-3 text-pink-400 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(244,82,173,0.3)] transition-all">
                    {isUploading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-pink-400" />
                    ) : (
                      <UploadCloud className="w-6 h-6" />
                    )}
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-zinc-200">
                    {isUploading
                      ? "Syncing slides to Cloudinary CDN..."
                      : images.length > 0
                      ? "Add more slides (Drag & Drop or Browse)"
                      : "Drag and drop your media here"}
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Supports JPG, PNG, WEBP, MP4
                    {postType === "CAROUSEL" && " • Select 2 to 10 images for carousel"}
                    {postType === "REELS" && " • Select 1 video for reels"}
                    {postType === "STORIES" && " • Select 1 image or video for stories"}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3.5 bg-zinc-900/80 border-zinc-700/80 hover:border-pink-500/50 text-xs text-zinc-200 pointer-events-none group-hover:border-pink-500/60"
                  >
                    Browse Files
                  </Button>
                </div>

                {/* Direct URL Input Toggle & Field */}
                <div className="pt-1">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setShowUrlInput(!showUrlInput)}
                      className="text-xs text-pink-400 hover:text-pink-300 flex items-center gap-1.5 font-medium cursor-pointer transition-colors"
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>{showUrlInput ? "Hide Direct URL Input" : "Or paste image/video URL directly"}</span>
                    </button>
                  </div>
                  {showUrlInput && (
                    <div className="flex items-center gap-2 mt-2.5">
                      <input
                        type="url"
                        value={mediaUrlInput}
                        onChange={(e) => setMediaUrlInput(e.target.value)}
                        placeholder="https://example.com/image.jpg or CDN link..."
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddMediaUrl();
                          }
                        }}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-pink-500"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleAddMediaUrl}
                        className="bg-pink-600 hover:bg-pink-500 text-white text-xs h-9 px-3.5 rounded-xl cursor-pointer"
                      >
                        Add URL
                      </Button>
                    </div>
                  )}
                </div>

                {/* Uploaded Thumbnails Carousel Manager */}
                {images.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-zinc-400 flex items-center gap-2">
                        <span>{postType === "CAROUSEL" ? "Slides:" : "Selected Image:"}</span>
                        {isUploading && (
                          <span className="text-[10px] text-pink-400 font-normal animate-pulse flex items-center gap-1">
                            <Loader2 className="w-2.5 h-2.5 animate-spin" />
                            Syncing to CDN...
                          </span>
                        )}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePurgeFromCloudinary}
                          className="text-[11px] text-zinc-400 hover:text-red-400 border-zinc-800 hover:border-red-500/40 h-6 px-2 gap-1"
                          title="Permanently delete uploaded images from Cloudinary to keep 25 GB CDN storage free"
                        >
                          <Trash2 className="w-3 h-3 text-zinc-500 hover:text-red-400" />
                          <span>Purge CDN</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setImages([])}
                          className="text-[11px] text-zinc-400 hover:text-white h-6 px-2"
                        >
                          Clear
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
                      {images.map((img, idx) => (
                        <div
                          key={idx}
                          className={`relative group rounded-xl overflow-hidden border aspect-square shadow-md transition-all ${
                            uploadProgress[img] === "uploading" || img.startsWith("blob:")
                              ? "border-pink-500/80 shadow-[0_0_12px_rgba(236,72,153,0.3)] bg-pink-950/20"
                              : uploadProgress[img] === "error"
                              ? "border-red-500/80 bg-red-950/20"
                              : "border-zinc-700 hover:border-zinc-500 bg-zinc-900"
                          }`}
                        >
                          {img.toLowerCase().endsWith(".mp4") || img.toLowerCase().endsWith(".mov") ? (
                            <video src={img} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                          ) : (
                            <img src={img} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                          )}

                          <span className="absolute top-1 left-1 bg-black/75 backdrop-blur-sm rounded px-1.5 text-[10px] font-bold text-white z-10">
                            #{idx + 1}
                          </span>

                          {/* CDN Upload Status Indicator Badge */}
                          {uploadProgress[img] === "uploading" || img.startsWith("blob:") ? (
                            <div
                              className="absolute top-1 right-1 bg-black/80 backdrop-blur-sm rounded-full p-1 border border-pink-500/60 z-10 flex items-center justify-center"
                              title="Syncing to Cloudinary CDN..."
                            >
                              <Loader2 className="w-3 h-3 text-pink-400 animate-spin" />
                            </div>
                          ) : uploadProgress[img] === "error" ? (
                            <div
                              className="absolute top-1 right-1 bg-red-950/90 backdrop-blur-sm rounded px-1 text-[9px] text-red-400 font-bold border border-red-500/50 z-10"
                              title="Failed to upload to CDN"
                            >
                              Err
                            </div>
                          ) : (
                            <div
                              className="absolute top-1 right-1 bg-emerald-950/80 backdrop-blur-sm rounded-full p-0.5 text-emerald-400 border border-emerald-500/30 z-10 flex items-center justify-center"
                              title="Ready on Cloudinary CDN"
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            </div>
                          )}

                          {/* Hover overlay controls */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity">
                            {postType === "CAROUSEL" && idx > 0 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveImage(idx, "left");
                                }}
                                className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white"
                                title="Move Left"
                              >
                                <MoveLeft className="w-3 h-3" />
                              </button>
                            )}

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage(idx);
                              }}
                              className="p-1 rounded bg-red-600 hover:bg-red-500 text-white"
                              title="Remove"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>

                            {postType === "CAROUSEL" && idx < images.length - 1 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveImage(idx, "right");
                                }}
                                className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white"
                                title="Move Right"
                              >
                                <MoveRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Vision Analysis Trigger Button */}
                {images.length > 0 && (
                  <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                    <div className="text-xs text-zinc-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                      <span>Deep visual analysis with Google Gemini Multimodal Vision</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleAnalyzeImage}
                      disabled={isAnalyzing}
                      className="text-xs gap-1.5 text-pink-300 border-pink-500/30 hover:bg-pink-500/10"
                    >
                      {isAnalyzing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Wand2 className="w-3.5 h-3.5 text-pink-400" />
                      )}
                      <span>{isAnalyzing ? "Analyzing..." : "Analyze Image"}</span>
                    </Button>
                  </div>
                )}
              </div>

              {/* AI Image Analysis Breakdown Results */}
              {analysisResult && (
                <div className="glass-panel rounded-2xl p-5 border-pink-500/30 space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-pink-400" />
                      <h3 className="text-sm font-semibold text-white">AI Visual Analysis</h3>
                      <Badge variant="default" className="text-[10px] py-0 px-1.5 bg-gradient-to-r from-pink-500 to-purple-600">
                        Multimodal Verified
                      </Badge>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {analysisResult.model}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                        <span className="text-zinc-500 text-[10px] uppercase font-bold block mb-0.5">Subject</span>
                        <span className="text-zinc-200 font-medium">{analysisResult.subject}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                        <span className="text-zinc-500 text-[10px] uppercase font-bold block mb-0.5">Style & Mood</span>
                        <span className="text-zinc-200 font-medium">
                          {analysisResult.style} • {analysisResult.mood}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-1.5">
                      <span className="text-zinc-500 text-[10px] uppercase font-bold block">Keywords</span>
                      <div className="flex flex-wrap gap-1.5">
                        {analysisResult.keywords.map((kw, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px]">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-zinc-400">
                        Alt Text: <span className="text-zinc-300 italic">{analysisResult.altText}</span>
                      </span>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setCaption(analysisResult.suggestedCaption);
                          setHashtags(analysisResult.suggestedHashtags);
                          toast.success("Applied AI caption and hashtags!");
                        }}
                        className="text-xs h-7 gap-1"
                      >
                        Apply to Studio
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Caption & Details Studio */}
              <div className="glass-card bg-white/5 border border-white/10 rounded-[2rem] p-6 sm:p-7 space-y-6 shadow-2xl">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <h2 className="text-base font-bold text-white font-headline">Google Gemini AI Engine</h2>
                    {userGeminiKey ? (
                      <span className="text-[10px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full font-medium">
                        Custom Key Active
                      </span>
                    ) : (
                      <a
                        href="/settings"
                        className="text-[10px] text-pink-400 hover:text-pink-300 bg-pink-500/10 border border-pink-500/25 px-2 py-0.5 rounded-full font-medium hover:underline"
                        title="Add your 100% Free Gemini API key in Settings"
                      >
                        + Add Free Key in Settings
                      </a>
                    )}
                  </div>

                  {/* Gemini AI Model Picker */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-zinc-400 text-[11px]">Model:</span>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-pink-500 cursor-pointer"
                    >
                      {modelsData?.freeTextModels?.map((m: any) => (
                        <option key={m.id} value={m.id} className="bg-zinc-950">
                          {m.name}
                        </option>
                      )) || (
                        <>
                          <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fast & Free)</option>
                          <option value="gemini-2.0-flash">Gemini 2.0 Flash (Next-Gen Speed)</option>
                          <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Reasoning)</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                {/* Page Theme / Custom Prompt for 1-Click Gemini Vision */}
                <div className="space-y-2 p-4 rounded-2xl bg-black/40 border border-white/[0.08]">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                      <Wand2 className="w-3.5 h-3.5 text-pink-400" />
                      <span>Page Theme / Custom Prompt:</span>
                    </label>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {images.length > 0 ? "Gemini Multimodal Active" : "Text Prompt"}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="e.g. Aesthetic anime DP / matching PFP, minimal shayari, luxury travel..."
                    className="w-full bg-[#121214] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-pink-500 transition-colors"
                  />
                  <p className="text-[10px] text-zinc-500">
                    Gemini Vision directly scans your image + uses this theme to generate natural, relevant captions (no robotic boilerplate).
                  </p>
                </div>

                {/* 26 Proven Hook Formulas (Jake Schincariol Creator Architecture) */}
                <div className="space-y-2.5 p-4 rounded-2xl bg-black/40 border border-white/[0.08]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                      <span>26 Proven Hook Formulas:</span>
                    </label>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      Scored for First 125 Chars
                    </span>
                  </div>

                  {/* Formula Selector Dropdown */}
                  <select
                    value={selectedHookFormulaId || ""}
                    onChange={(e) => setSelectedHookFormulaId(e.target.value ? Number(e.target.value) : null)}
                    className="w-full bg-[#121214] border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-pink-500 cursor-pointer"
                  >
                    <option value="">Auto Hook (AI chooses best formula)</option>
                    {HOOK_FORMULAS.map((f) => (
                      <option key={f.id} value={f.id}>
                        #{f.id} {f.name} ({f.category}) — e.g. "{f.onScreenText}"
                      </option>
                    ))}
                  </select>

                  {/* Popular Quick Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[3, 1, 4, 6, 2, 5, 8, 21].map((id) => {
                      const f = HOOK_FORMULAS.find((item) => item.id === id);
                      if (!f) return null;
                      const isSelected = selectedHookFormulaId === f.id;
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setSelectedHookFormulaId(isSelected ? null : f.id)}
                          className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-pink-500/20 border-pink-500/60 text-pink-200 font-semibold shadow-sm"
                              : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                          }`}
                          title={f.example}
                        >
                          #{f.id} {f.name}
                        </button>
                      );
                    })}
                  </div>

                  {selectedHookFormulaId && (
                    <div className="p-2.5 rounded-xl bg-pink-500/5 border border-pink-500/20 text-[11px] space-y-1">
                      <div className="flex items-center justify-between text-pink-300 font-semibold">
                        <span>Formula: {HOOK_FORMULAS.find((f) => f.id === selectedHookFormulaId)?.name}</span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-200">
                          {HOOK_FORMULAS.find((f) => f.id === selectedHookFormulaId)?.category}
                        </span>
                      </div>
                      <p className="text-zinc-300 font-mono text-[11px]">
                        Template: {HOOK_FORMULAS.find((f) => f.id === selectedHookFormulaId)?.template}
                      </p>
                      <p className="text-zinc-400 text-[10px]">
                        Example: "{HOOK_FORMULAS.find((f) => f.id === selectedHookFormulaId)?.example}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Caption Textarea with Character Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span className="font-medium">Caption Editor</span>
                    <span className={caption.length > 2200 ? "text-red-400 font-bold" : "text-zinc-400"}>
                      {caption.length} / 2,200 characters
                    </span>
                  </div>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Write your Instagram caption here or click Generate with AI..."
                    rows={5}
                    className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-pink-500/80 focus:ring-2 focus:ring-pink-500/20 resize-y leading-relaxed transition-all"
                  />
                </div>

                {/* Real-Time 125-Character Feed Window & Hook Scorer */}
                {caption.trim().length > 0 && (
                  <div className="rounded-2xl p-4 bg-black/60 border border-white/[0.08] space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-white">
                        <Eye className="w-3.5 h-3.5 text-pink-400" />
                        <span>Feed Preview (Before "... more" cutoff):</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-zinc-400">
                          {hookScore.feedCutoffText.length} / 125 chars
                        </span>
                        <Badge
                          variant={
                            hookScore.grade === "STRONG"
                              ? "success"
                              : hookScore.grade === "GOOD"
                              ? "default"
                              : "destructive"
                          }
                          className="text-[10px] py-0 px-2"
                        >
                          Hook Score: {hookScore.score}/100 • {hookScore.grade}
                        </Badge>
                      </div>
                    </div>

                    {/* The exact box representation */}
                    <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/90 text-xs text-zinc-200 leading-relaxed font-sans">
                      <span className="text-white font-medium">{hookScore.feedCutoffText}</span>
                      <span className="text-zinc-500 font-normal"> ... more</span>
                    </div>

                    {/* Feedback and Warnings */}
                    {hookScore.dealbreakers.length > 0 ? (
                      <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-start gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{hookScore.dealbreakers[0]}</span>
                      </div>
                    ) : hookScore.suggestions.length > 0 ? (
                      <p className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                        <Info className="w-3 h-3 text-blue-400 shrink-0" />
                        <span>Tip: {hookScore.suggestions[0]}</span>
                      </p>
                    ) : (
                      <p className="text-[11px] text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                        <span>Hook is concrete and primed for high feed click-through!</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Quick AI Action Modifiers */}
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleGenerateCaption("generate")}
                    disabled={isGeneratingCaption}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs h-9 px-4 rounded-xl gap-2 font-medium cursor-pointer shadow-md shadow-pink-500/20"
                  >
                    {isGeneratingCaption ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Wand2 className="w-3.5 h-3.5" />
                    )}
                    <span>{images.length > 0 ? "Generate with Gemini Vision" : "Generate with AI"}</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleHumanize}
                    disabled={!caption}
                    className="text-xs h-9 px-3.5 rounded-xl gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 cursor-pointer"
                    title="Clean AI giveaway vocabulary (delve, elevate, tapestry) and em dashes"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>Humanize (Anti-Slop)</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleGenerateCaption("shorten")}
                    disabled={isGeneratingCaption || !caption}
                    className="text-xs h-9 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-zinc-200 cursor-pointer"
                  >
                    Shorten
                  </Button>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleGenerateCaption("improve")}
                    disabled={isGeneratingCaption || !caption}
                    className="text-xs h-9 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-zinc-200 cursor-pointer"
                  >
                    Improve
                  </Button>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleGenerateCaption("add_cta")}
                    disabled={isGeneratingCaption || !caption}
                    className="text-xs h-9 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-zinc-200 cursor-pointer"
                  >
                    Add CTA
                  </Button>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleGenerateCaption("add_hashtags")}
                    disabled={isGeneratingCaption}
                    className="text-xs h-9 px-3 rounded-xl gap-1 bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-zinc-200 cursor-pointer"
                  >
                    <Hash className="w-3 h-3 text-pink-400" />
                    AI Hashtags
                  </Button>
                </div>

                {/* Interactive Hashtag Manager */}
                <div className="space-y-3 pt-4 border-t border-white/[0.08]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-300 flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-pink-400" />
                      Hashtag Manager ({hashtags.length})
                    </span>
                    {hashtags.length > 0 && (
                      <button
                        onClick={() => setHashtags([])}
                        className="text-[11px] text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        Clear tags
                      </button>
                    )}
                  </div>

                  {/* Interactive Chip List */}
                  <div className="flex flex-wrap items-center gap-2">
                    {hashtags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#141414] border border-white/[0.1] text-xs text-pink-300 group hover:border-pink-500/40 transition-colors"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => removeHashtag(tag)}
                          className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.1] transition-colors cursor-pointer"
                          title="Remove hashtag"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}

                    {/* Quick Add Tag Input */}
                    <div className="inline-flex items-center gap-1.5">
                      <input
                        type="text"
                        value={customTagInput}
                        onChange={(e) => setCustomTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addHashtag(customTagInput);
                          }
                        }}
                        placeholder="+ Add tag..."
                        className="bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-3.5 py-1 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-pink-500 w-32"
                      />
                      {customTagInput.trim() && (
                        <button
                          type="button"
                          onClick={() => addHashtag(customTagInput)}
                          className="p-1 rounded-full bg-pink-600 hover:bg-pink-500 text-white cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Suggestion Chips */}
                  <div className="flex items-center gap-2 flex-wrap pt-1 text-[11px] text-zinc-500">
                    <span>Suggested:</span>
                    {suggestedTags.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => addHashtag(t)}
                        className="hover:text-pink-400 transition-colors cursor-pointer"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Live Instagram Preview & Publishing (5 Cols) */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
              {/* Device Preview Card */}
              <div className="glass-card bg-white/5 border border-white/10 rounded-[2rem] p-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <h3 className="text-sm font-bold text-white font-headline">Live Phone Preview</h3>
                  </div>
                  <Badge variant="secondary" className="text-[10px] py-0.5 px-2 bg-black/60 text-zinc-400 border border-white/[0.1]">
                    {aspectRatio}
                  </Badge>
                </div>

                <div className="flex flex-col items-center">
                  <InstagramPostPreview
                    username={accountData?.username || "creator_handle"}
                    avatarUrl={accountData?.profilePictureUrl}
                    mediaType={postType}
                    imageUrls={images}
                    caption={sanitizeCaption(caption)}
                    hashtags={hashtags}
                    aspectRatio={aspectRatio}
                  />
                </div>
              </div>

              {/* Publish Control Card */}
              <div className="glass-card bg-white/5 border border-white/10 rounded-[2rem] p-6 space-y-4 shadow-2xl">
                {publishStatus !== "idle" && (
                  <div className="p-4 bg-black/60 rounded-2xl border border-white/[0.08] text-xs space-y-2.5">
                    <div className="flex items-center gap-2 font-medium">
                      {publishStatus === "published" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : publishStatus === "failed" ? (
                        <AlertCircle className="w-4 h-4 text-red-400" />
                      ) : (
                        <Loader2 className="w-4 h-4 animate-spin text-pink-400" />
                      )}
                      <span className="capitalize text-zinc-200">
                        {publishStatus === "creating_container"
                          ? "Creating Meta Media Container..."
                          : publishStatus === "processing"
                          ? "Polling Instagram Container Status..."
                          : publishStatus === "publishing"
                          ? "Publishing Container to Live Feed..."
                          : publishStatus === "published"
                          ? "Confirmed Published by Meta!"
                          : publishStatus === "failed"
                          ? "Publishing Failed"
                          : "Preparing Media..."}
                      </span>
                    </div>

                    {/* Step Progress Bar */}
                    <div className="w-full bg-[#141414] rounded-full h-2 overflow-hidden border border-white/[0.05]">
                      <div
                        className="bg-gradient-to-r from-pink-500 to-purple-600 h-full transition-all duration-500 rounded-full"
                        style={{
                          width:
                            publishStatus === "uploading"
                              ? "25%"
                              : publishStatus === "creating_container"
                              ? "50%"
                              : publishStatus === "processing"
                              ? "75%"
                              : publishStatus === "publishing"
                              ? "90%"
                              : publishStatus === "published"
                              ? "100%"
                              : "0%",
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Post Scheduling Controls */}
                <div className="p-4 bg-black/40 rounded-2xl border border-white/[0.08] space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-semibold text-white">Schedule for Later (Indian Time IST)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (scheduledFor) {
                          setScheduledFor("");
                        } else {
                          const d = new Date(Date.now() + 60 * 60 * 1000);
                          const pad = (n: number) => String(n).padStart(2, "0");
                          setScheduledFor(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
                        }
                      }}
                      className={`text-xs px-2.5 py-1 rounded-lg transition-all cursor-pointer font-medium ${
                        scheduledFor
                          ? "bg-purple-500/25 text-purple-300 border border-purple-500/50 shadow-sm"
                          : "bg-white/5 text-zinc-400 hover:text-white border border-white/10"
                      }`}
                    >
                      {scheduledFor ? "Schedule Active" : "Schedule Post"}
                    </button>
                  </div>

                  {scheduledFor && (
                    <DateTimePicker
                      value={scheduledFor}
                      onChange={(newVal) => setScheduledFor(newVal)}
                      onClear={() => setScheduledFor("")}
                    />
                  )}
                </div>

                <Button
                  size="lg"
                  onClick={handlePublish}
                  disabled={
                    images.length === 0 ||
                    isUploading ||
                    images.some((img) => img.startsWith("blob:")) ||
                    (postType === "CAROUSEL" && images.length < 2) ||
                    (publishStatus !== "idle" && publishStatus !== "failed")
                  }
                  className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:opacity-95 text-white font-bold text-sm gap-2 h-12 rounded-xl shadow-2xl shadow-pink-500/20 transition-all cursor-pointer"
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : publishStatus === "creating_container" ||
                  publishStatus === "processing" ||
                  publishStatus === "publishing" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>
                    {isUploading
                      ? "Syncing Slides to Cloudinary CDN..."
                      : postType === "CAROUSEL"
                      ? scheduledFor ? `Schedule Carousel (${images.length} slides)` : `Publish Carousel (${images.length} slides)`
                      : scheduledFor ? "Schedule to Instagram" : "Publish to Instagram"}
                  </span>
                </Button>

                <p className="text-[11px] text-zinc-500 text-center">
                  Official Meta Graph API v23.0 • Direct server-side token connection
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
