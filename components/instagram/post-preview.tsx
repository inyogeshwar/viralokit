"use client";

import React, { useState } from "react";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Music,
  Share2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PostPreviewProps {
  username?: string;
  avatarUrl?: string | null;
  mediaType: "IMAGE" | "CAROUSEL" | "REELS" | "STORIES";
  imageUrls: string[];
  caption: string;
  hashtags?: string[];
  aspectRatio?: "1:1" | "4:5" | "9:16";
  className?: string;
}

export function InstagramPostPreview({
  username = "your_handle",
  avatarUrl,
  mediaType,
  imageUrls,
  caption,
  hashtags = [],
  aspectRatio = "4:5",
  className,
}: PostPreviewProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const images =
    imageUrls.length > 0
      ? imageUrls
      : ["https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80"];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveSlide((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveSlide((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const displayHashtags = Array.from(
    new Set([...hashtags, ...(caption.match(/#[a-zA-Z0-9_]+/g) || [])])
  );

  return (
    <div className={cn("w-full max-w-sm mx-auto flex flex-col items-center", className)}>
      {/* Device Shell */}
      <div className="w-full bg-zinc-900/90 border border-zinc-800 rounded-[2.2rem] p-3 shadow-[0_20px_40px_rgba(0,0,0,0.5)] relative overflow-hidden">
        {/* Phone Frame */}
        <div className="w-full bg-black border-[4px] border-zinc-900 rounded-[1.8rem] relative overflow-hidden flex flex-col shadow-inner">
          {/* Top Notch */}
          <div className="h-4 bg-black flex justify-center items-center z-30">
            <div className="w-20 h-3 bg-zinc-900 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-950 mr-2" />
              <div className="w-2 h-1 rounded-full bg-zinc-800" />
            </div>
          </div>

          {/* ==================== 1. STORY PREVIEW (Full 9:16) ==================== */}
          {mediaType === "STORIES" ? (
            <div className="relative aspect-[9/16] w-full bg-zinc-950 overflow-hidden flex flex-col justify-between">
              {/* Background Media */}
              <img
                src={images[0]}
                alt="Story Preview"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/70 pointer-events-none" />

              {/* Top Story Header & Progress Bar */}
              <div className="relative z-20 p-3 space-y-2">
                {/* Progress bar */}
                <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden flex gap-1">
                  <div className="h-full w-full bg-white rounded-full animate-pulse" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full p-[1px] bg-gradient-to-tr from-yellow-500 to-pink-500">
                      <div className="w-full h-full rounded-full bg-black overflow-hidden flex items-center justify-center">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] font-bold text-white">
                            {username.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-white shadow-sm">@{username}</span>
                    <span className="text-[10px] text-white/70">1h</span>
                  </div>

                  <X className="w-4 h-4 text-white/80 cursor-pointer" />
                </div>
              </div>

              {/* Story Overlay Caption if provided */}
              {caption && (
                <div className="relative z-20 px-4 text-center my-auto">
                  <div className="inline-block bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs text-white font-medium max-w-[85%] border border-white/10 shadow-lg">
                    {caption}
                  </div>
                </div>
              )}

              {/* Bottom Story Interactive Bar */}
              <div className="relative z-20 p-3 pb-4 flex items-center gap-2.5">
                <div className="flex-1 bg-white/20 backdrop-blur-md border border-white/20 rounded-full px-3.5 py-2 text-[11px] text-white/80 placeholder-white/60">
                  Send message...
                </div>
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white"
                >
                  <Heart className={cn("w-4 h-4", isLiked ? "text-red-500 fill-red-500" : "text-white")} />
                </button>
                <div className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white">
                  <Send className="w-4 h-4" />
                </div>
              </div>
            </div>
          ) : mediaType === "REELS" ? (
            /* ==================== 2. REEL PREVIEW (Full 9:16) ==================== */
            <div className="relative aspect-[9/16] w-full bg-zinc-950 overflow-hidden flex flex-col justify-between">
              {/* Reel Media */}
              <img
                src={images[0]}
                alt="Reel Preview"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />

              {/* Reel Top Bar */}
              <div className="relative z-20 px-3 py-2 flex items-center justify-between text-white">
                <span className="text-xs font-bold tracking-tight font-headline">Reels</span>
                <MoreHorizontal className="w-4 h-4" />
              </div>

              {/* Reel Bottom & Side Bar Layout */}
              <div className="relative z-20 p-3 pb-4 flex items-end justify-between">
                {/* Left: Creator info & Caption */}
                <div className="flex-1 space-y-2 pr-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-black overflow-hidden border border-white/20 flex items-center justify-center">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] font-bold text-white">
                          {username.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-white">@{username}</span>
                    <button className="text-[10px] font-bold text-white bg-white/20 border border-white/30 px-2 py-0.5 rounded-full">
                      Follow
                    </button>
                  </div>

                  {/* Caption snippet */}
                  <p className="text-[11px] text-white/95 line-clamp-2 leading-relaxed">
                    {caption || "Your aesthetic reel hook and caption will show here..."}
                  </p>

                  {/* Audio pill */}
                  <div className="flex items-center gap-1.5 text-[10px] text-white/80 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full w-fit">
                    <Music className="w-3 h-3 text-white" />
                    <span>Original Audio • @{username}</span>
                  </div>
                </div>

                {/* Right: Floating Reel Actions */}
                <div className="flex flex-col items-center gap-3.5 text-white pb-1">
                  <button onClick={() => setIsLiked(!isLiked)} className="flex flex-col items-center">
                    <Heart className={cn("w-5 h-5", isLiked ? "text-red-500 fill-red-500" : "text-white")} />
                    <span className="text-[9px] font-medium mt-0.5">{isLiked ? "2.5K" : "2.4K"}</span>
                  </button>
                  <div className="flex flex-col items-center">
                    <MessageCircle className="w-5 h-5 -scale-x-100" />
                    <span className="text-[9px] font-medium mt-0.5">84</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Share2 className="w-5 h-5" />
                    <span className="text-[9px] font-medium mt-0.5">312</span>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-zinc-800 border-2 border-white flex items-center justify-center animate-spin">
                    <div className="w-2 h-2 rounded-full bg-black" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ==================== 3. FEED / CAROUSEL PREVIEW ==================== */
            <>
              {/* App Top Header */}
              <div className="px-3 py-1.5 border-b border-zinc-900 flex justify-between items-center bg-black">
                <span className="text-white text-xs font-bold tracking-tight">Instagram</span>
                <span className="text-[10px] text-zinc-400 font-medium">New Post</span>
                <MoreHorizontal className="w-3.5 h-3.5 text-zinc-400" />
              </div>

              {/* Post Header */}
              <div className="flex items-center justify-between px-3 py-2 bg-black">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full p-[1.5px] bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[9px] font-bold text-white">
                          {username.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-white leading-none block">
                      {username}
                    </span>
                  </div>
                </div>
                <MoreHorizontal className="w-3.5 h-3.5 text-zinc-400" />
              </div>

              {/* Main Feed Media Container */}
              <div
                className={cn(
                  "relative w-full bg-zinc-950 overflow-hidden group transition-all duration-300",
                  aspectRatio === "1:1" && "aspect-square",
                  aspectRatio === "4:5" && "aspect-[4/5]",
                  aspectRatio === "9:16" && "aspect-[9/16]"
                )}
              >
                <img
                  src={images[activeSlide] || images[0]}
                  alt="Post Preview"
                  className="w-full h-full object-cover transition-transform duration-300"
                />

                {/* Carousel controls & counter */}
                {mediaType === "CAROUSEL" && images.length > 1 && (
                  <>
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-medium text-white/90">
                      {activeSlide + 1}/{images.length}
                    </div>

                    <button
                      onClick={handlePrev}
                      className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white opacity-80 hover:opacity-100"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleNext}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white opacity-80 hover:opacity-100"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>

              {/* Action Bar */}
              <div className="px-3 pt-2 pb-2 bg-black space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsLiked(!isLiked)}
                      className={cn("transition-transform", isLiked ? "text-red-500 fill-red-500" : "text-white")}
                    >
                      <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
                    </button>
                    <MessageCircle className="w-4 h-4 text-white -scale-x-100" />
                    <Send className="w-4 h-4 text-white" />
                  </div>

                  {mediaType === "CAROUSEL" && images.length > 1 && (
                    <div className="flex items-center gap-1">
                      {images.map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "rounded-full transition-all",
                            i === activeSlide ? "w-1.5 h-1.5 bg-blue-500" : "w-1 h-1 bg-zinc-600"
                          )}
                        />
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => setIsSaved(!isSaved)}
                    className={cn(isSaved ? "text-white fill-white" : "text-white")}
                  >
                    <Bookmark className={cn("w-4 h-4", isSaved && "fill-current")} />
                  </button>
                </div>

                {/* Likes line */}
                <p className="text-[11px] font-semibold text-white">
                  {isLiked ? "1,248 likes" : "1,247 likes"}
                </p>

                {/* Caption Area */}
                <div className="text-[11px] leading-relaxed space-y-1">
                  <p className="break-words">
                    <span className="font-semibold text-white mr-1.5">{username}</span>
                    <span className="text-zinc-300">
                      {caption || "Your generated caption will appear here in real-time."}
                    </span>
                  </p>

                  {displayHashtags.length > 0 && (
                    <p className="text-blue-400 text-[10px] flex flex-wrap gap-1">
                      {displayHashtags.map((tag, idx) => (
                        <span key={idx}>
                          {tag.startsWith("#") ? tag : `#${tag}`}
                        </span>
                      ))}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
