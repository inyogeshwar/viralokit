"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles } from "lucide-react";

interface LogoProps {
  compact?: boolean;
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
  showSubtitle?: boolean;
}

export function ViraloKitLogo({
  compact = false,
  size = "md",
  href = "/dashboard",
  className = "",
  showSubtitle = true,
}: LogoProps) {
  const iconSize = size === "sm" ? 28 : size === "lg" ? 44 : 36;
  const textSize = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg";
  const subSize = size === "sm" ? "text-[9px]" : "text-[10px]";

  const content = (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      {/* App Icon Mark */}
      <div className="relative shrink-0">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-xl opacity-75 blur-sm group-hover:opacity-100 transition duration-300" />
        <div
          className="relative rounded-xl overflow-hidden bg-zinc-950 border border-pink-500/40 shadow-md group-hover:scale-105 transition-transform flex items-center justify-center"
          style={{ width: iconSize, height: iconSize }}
        >
          <Image
            src="/icon.png"
            alt="ViraloKit Logo"
            width={iconSize}
            height={iconSize}
            className="object-cover w-full h-full"
            priority
          />
        </div>
      </div>

      {/* Brand Wordmark */}
      {!compact && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`font-extrabold tracking-tight text-white ${textSize}`}>
              Viralo<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-pink-500">Kit</span>
            </span>
            <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-pink-500/15 text-pink-300 border border-pink-500/30">
              <Sparkles className="w-2.5 h-2.5 mr-0.5" />
              v23.0
            </span>
          </div>
          {showSubtitle && (
            <span className={`${subSize} text-zinc-400 font-medium tracking-wider uppercase -mt-0.5`}>
              Creator Studio
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
