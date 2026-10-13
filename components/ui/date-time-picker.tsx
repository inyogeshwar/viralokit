"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  Zap,
  Check,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Button } from "./button";
import { Badge } from "./badge";

interface DateTimePickerProps {
  value: string; // format: "YYYY-MM-DDTHH:mm"
  onChange: (value: string) => void;
  onClear?: () => void;
  className?: string;
}

const PAD = (n: number) => String(n).padStart(2, "0");

// Convert a Date object to "YYYY-MM-DDTHH:mm"
export function formatToLocalInput(date: Date): string {
  const y = date.getFullYear();
  const m = PAD(date.getMonth() + 1);
  const d = PAD(date.getDate());
  const h = PAD(date.getHours());
  const min = PAD(date.getMinutes());
  return `${y}-${m}-${d}T${h}:${min}`;
}

// Format a date string to Indian Standard Time (IST) 12-hour display
export function formatIndianDateTimeDisplay(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
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
    return dateStr;
  }
}

// Relative time calculation
export function getRelativeTimeFromNow(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const target = new Date(dateStr).getTime();
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

export function DateTimePicker({
  value,
  onChange,
  onClear,
  className = "",
}: DateTimePickerProps) {
  // Parse current value or default to now + 1 hour
  const parsed = useMemo(() => {
    let d = value ? new Date(value) : new Date(Date.now() + 60 * 60 * 1000);
    if (isNaN(d.getTime())) {
      d = new Date(Date.now() + 60 * 60 * 1000);
    }
    const h24 = d.getHours();
    const period = h24 >= 12 ? ("PM" as const) : ("AM" as const);
    const hour12 = h24 % 12 === 0 ? 12 : h24 % 12;
    const minutes = d.getMinutes();
    const dateStr = `${d.getFullYear()}-${PAD(d.getMonth() + 1)}-${PAD(d.getDate())}`;

    return {
      dateStr,
      hour12,
      minutes,
      period,
    };
  }, [value]);

  const [selectedDate, setSelectedDate] = useState(parsed.dateStr);
  const [selectedHour, setSelectedHour] = useState(parsed.hour12);
  const [selectedMinute, setSelectedMinute] = useState(parsed.minutes);
  const [selectedPeriod, setSelectedPeriod] = useState<"AM" | "PM">(parsed.period);

  // Sync internal state when external value changes
  useEffect(() => {
    setSelectedDate(parsed.dateStr);
    setSelectedHour(parsed.hour12);
    setSelectedMinute(parsed.minutes);
    setSelectedPeriod(parsed.period);
  }, [parsed]);

  // Emit updated ISO/local string whenever date/time components change
  const applyChange = (
    newDate: string,
    newHour: number,
    newMinute: number,
    newPeriod: "AM" | "PM"
  ) => {
    let h24 = newHour;
    if (newPeriod === "AM") {
      h24 = newHour === 12 ? 0 : newHour;
    } else {
      h24 = newHour === 12 ? 12 : newHour + 12;
    }

    const finalVal = `${newDate}T${PAD(h24)}:${PAD(newMinute)}`;
    onChange(finalVal);
  };

  // Quick preset dates (Today, Tomorrow, Day After)
  const todayDate = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${PAD(now.getMonth() + 1)}-${PAD(now.getDate())}`;
  }, []);

  const tomorrowDate = useMemo(() => {
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    return `${tmrw.getFullYear()}-${PAD(tmrw.getMonth() + 1)}-${PAD(tmrw.getDate())}`;
  }, []);

  const dayAfterDate = useMemo(() => {
    const da = new Date();
    da.setDate(da.getDate() + 2);
    return `${da.getFullYear()}-${PAD(da.getMonth() + 1)}-${PAD(da.getDate())}`;
  }, []);

  // Quick preset helper
  const handlePreset = (type: "15m" | "30m" | "1h" | "tonight" | "tmrw_9am" | "tmrw_7pm") => {
    const now = new Date();
    let target = new Date();

    if (type === "15m") {
      target = new Date(now.getTime() + 15 * 60 * 1000);
    } else if (type === "30m") {
      target = new Date(now.getTime() + 30 * 60 * 1000);
    } else if (type === "1h") {
      target = new Date(now.getTime() + 60 * 60 * 1000);
    } else if (type === "tonight") {
      target.setHours(21, 0, 0, 0); // 9:00 PM
      if (target.getTime() <= now.getTime()) {
        target.setHours(22, 0, 0, 0); // 10:00 PM
      }
    } else if (type === "tmrw_9am") {
      target.setDate(target.getDate() + 1);
      target.setHours(9, 0, 0, 0);
    } else if (type === "tmrw_7pm") {
      target.setDate(target.getDate() + 1);
      target.setHours(19, 0, 0, 0);
    }

    onChange(formatToLocalInput(target));
  };

  const hoursList = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const minutesList = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  return (
    <div className={`p-4 rounded-2xl bg-zinc-950/80 border border-purple-500/30 shadow-2xl space-y-4 ${className}`}>
      {/* Top Header & Presets */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-300">
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span>1-Tap Instant Presets (IST):</span>
          </div>
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="text-[11px] text-zinc-400 hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3 h-3" />
              <span>Cancel</span>
            </button>
          )}
        </div>

        {/* 6 Quick Action Presets */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-[11px]">
          <button
            type="button"
            onClick={() => handlePreset("15m")}
            className="py-1.5 px-1 bg-white/5 hover:bg-purple-600/25 border border-white/10 hover:border-purple-500/50 rounded-xl text-zinc-300 hover:text-white transition-all text-center cursor-pointer active:scale-95"
          >
            +15m
          </button>
          <button
            type="button"
            onClick={() => handlePreset("30m")}
            className="py-1.5 px-1 bg-white/5 hover:bg-purple-600/25 border border-white/10 hover:border-purple-500/50 rounded-xl text-zinc-300 hover:text-white transition-all text-center cursor-pointer active:scale-95"
          >
            +30m
          </button>
          <button
            type="button"
            onClick={() => handlePreset("1h")}
            className="py-1.5 px-1 bg-white/5 hover:bg-purple-600/25 border border-white/10 hover:border-purple-500/50 rounded-xl text-zinc-300 hover:text-white transition-all text-center cursor-pointer active:scale-95"
          >
            +1 Hour
          </button>
          <button
            type="button"
            onClick={() => handlePreset("tonight")}
            className="py-1.5 px-1 bg-white/5 hover:bg-purple-600/25 border border-white/10 hover:border-purple-500/50 rounded-xl text-zinc-300 hover:text-white transition-all text-center cursor-pointer active:scale-95"
          >
            🌙 9 PM
          </button>
          <button
            type="button"
            onClick={() => handlePreset("tmrw_9am")}
            className="py-1.5 px-1 bg-white/5 hover:bg-purple-600/25 border border-white/10 hover:border-purple-500/50 rounded-xl text-zinc-300 hover:text-white transition-all text-center cursor-pointer active:scale-95"
          >
            🌅 Tmrw 9 AM
          </button>
          <button
            type="button"
            onClick={() => handlePreset("tmrw_7pm")}
            className="py-1.5 px-1 bg-white/5 hover:bg-purple-600/25 border border-white/10 hover:border-purple-500/50 rounded-xl text-zinc-300 hover:text-white transition-all text-center cursor-pointer active:scale-95"
          >
            🌇 Tmrw 7 PM
          </button>
        </div>
      </div>

      {/* Date Selector Tabs */}
      <div className="space-y-1.5 pt-1 border-t border-white/[0.08]">
        <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1.5">
          <CalendarIcon className="w-3.5 h-3.5 text-pink-400" />
          <span>Pick Date:</span>
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setSelectedDate(todayDate);
              applyChange(todayDate, selectedHour, selectedMinute, selectedPeriod);
            }}
            className={`py-2 px-2 text-xs rounded-xl font-medium border transition-all cursor-pointer text-center ${
              selectedDate === todayDate
                ? "bg-pink-600 text-white border-pink-500 shadow-md shadow-pink-500/20"
                : "bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10"
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedDate(tomorrowDate);
              applyChange(tomorrowDate, selectedHour, selectedMinute, selectedPeriod);
            }}
            className={`py-2 px-2 text-xs rounded-xl font-medium border transition-all cursor-pointer text-center ${
              selectedDate === tomorrowDate
                ? "bg-pink-600 text-white border-pink-500 shadow-md shadow-pink-500/20"
                : "bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10"
            }`}
          >
            Tomorrow
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedDate(dayAfterDate);
              applyChange(dayAfterDate, selectedHour, selectedMinute, selectedPeriod);
            }}
            className={`py-2 px-2 text-xs rounded-xl font-medium border transition-all cursor-pointer text-center ${
              selectedDate === dayAfterDate
                ? "bg-pink-600 text-white border-pink-500 shadow-md shadow-pink-500/20"
                : "bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10"
            }`}
          >
            Day After
          </button>
        </div>

        {/* Custom Calendar Date picker fallback */}
        <div className="pt-1">
          <input
            type="date"
            value={selectedDate}
            min={todayDate}
            onChange={(e) => {
              if (e.target.value) {
                setSelectedDate(e.target.value);
                applyChange(e.target.value, selectedHour, selectedMinute, selectedPeriod);
              }
            }}
            className="w-full bg-[#121214] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-pink-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Visual Time Selector (12-Hour AM/PM) */}
      <div className="space-y-2 pt-1 border-t border-white/[0.08]">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span>Select Indian Time (IST):</span>
          </label>

          {/* AM / PM Toggle Pills */}
          <div className="flex items-center p-0.5 bg-white/5 border border-white/10 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setSelectedPeriod("AM");
                applyChange(selectedDate, selectedHour, selectedMinute, "AM");
              }}
              className={`px-2.5 py-0.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                selectedPeriod === "AM"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              AM
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedPeriod("PM");
                applyChange(selectedDate, selectedHour, selectedMinute, "PM");
              }}
              className={`px-2.5 py-0.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                selectedPeriod === "PM"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              PM
            </button>
          </div>
        </div>

        {/* Hour & Minute Selectors */}
        <div className="grid grid-cols-2 gap-3">
          {/* Hour Select */}
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Hour</span>
            <select
              value={selectedHour}
              onChange={(e) => {
                const h = Number(e.target.value);
                setSelectedHour(h);
                applyChange(selectedDate, h, selectedMinute, selectedPeriod);
              }}
              className="w-full bg-[#121214] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              {hoursList.map((h) => (
                <option key={h} value={h} className="bg-zinc-900 text-white">
                  {PAD(h)} : 00
                </option>
              ))}
            </select>
          </div>

          {/* Minute Select */}
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Minute</span>
            <select
              value={
                minutesList.includes(selectedMinute)
                  ? selectedMinute
                  : Math.round(selectedMinute / 5) * 5 % 60
              }
              onChange={(e) => {
                const m = Number(e.target.value);
                setSelectedMinute(m);
                applyChange(selectedDate, selectedHour, m, selectedPeriod);
              }}
              className="w-full bg-[#121214] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              {minutesList.map((m) => (
                <option key={m} value={m} className="bg-zinc-900 text-white">
                  : {PAD(m)} min
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Live Indian Standard Time Preview Banner */}
      <div className="p-3 bg-gradient-to-r from-purple-950/40 via-pink-950/30 to-purple-950/40 border border-purple-500/40 rounded-xl space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-purple-200 flex items-center gap-1.5">
            <span>🇮🇳 Scheduled for:</span>
            <span className="text-white font-bold text-xs sm:text-sm">
              {formatIndianDateTimeDisplay(value)} (IST)
            </span>
          </span>
          <Badge className="bg-purple-500/25 text-purple-200 border-purple-500/50 text-[10px] shrink-0">
            {getRelativeTimeFromNow(value)}
          </Badge>
        </div>
        <p className="text-[10px] text-zinc-400">
          Auto-publishing engine will publish this post to your live Instagram feed at this exact Indian time.
        </p>
      </div>
    </div>
  );
}
