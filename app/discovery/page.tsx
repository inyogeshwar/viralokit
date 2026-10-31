"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Hash,
  Gauge,
  AlertTriangle,
  ExternalLink,
  Users,
  Image as ImageIcon,
  Heart,
  MessageCircle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  TrendingUp,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function DiscoveryPage() {
  const [activeTab, setActiveTab] = useState<"business" | "hashtag" | "quota" | "errors">("business");

  // Business Discovery State
  const [bizUsername, setBizUsername] = useState("");
  const [bizLoading, setBizLoading] = useState(false);
  const [bizResult, setBizResult] = useState<any>(null);
  const [bizError, setBizError] = useState<string | null>(null);

  // Hashtag State
  const [hashtagQuery, setHashtagQuery] = useState("");
  const [hashtagLoading, setHashtagLoading] = useState(false);
  const [hashtagId, setHashtagId] = useState<string | null>(null);
  const [hashtagMedia, setHashtagMedia] = useState<any[]>([]);
  const [hashtagMode, setHashtagMode] = useState<"top" | "recent">("top");
  const [hashtagError, setHashtagError] = useState<string | null>(null);

  // Quota Limit State
  const [quotaLoading, setQuotaLoading] = useState(false);
  const [quotaData, setQuotaData] = useState<any>(null);
  const [quotaError, setQuotaError] = useState<string | null>(null);

  // Error Code Resolver State
  const [errorCode, setErrorCode] = useState("");
  const [errorSubcode, setErrorSubcode] = useState("");
  const [errorResult, setErrorResult] = useState<any>(null);

  // Handle Business Discovery
  const handleDiscoverBusiness = async () => {
    if (!bizUsername.trim()) return;
    setBizLoading(true);
    setBizError(null);
    setBizResult(null);

    try {
      const res = await fetch(`/api/meta/discovery?action=business&username=${encodeURIComponent(bizUsername.trim())}`);
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to discover business profile");
      }
      setBizResult(data);
    } catch (err: any) {
      setBizError(err.message);
    } finally {
      setBizLoading(false);
    }
  };

  // Handle Hashtag Search
  const handleSearchHashtag = async (mode: "top" | "recent" = hashtagMode) => {
    if (!hashtagQuery.trim()) return;
    setHashtagLoading(true);
    setHashtagError(null);
    setHashtagMedia([]);

    try {
      // Step 1: Search hashtag ID
      const searchRes = await fetch(`/api/meta/discovery?action=search_hashtag&query=${encodeURIComponent(hashtagQuery.trim())}`);
      const searchData = await searchRes.json();
      if (!searchRes.ok || searchData.error || !searchData.length) {
        throw new Error(searchData.error || "Hashtag not found or restricted by Meta.");
      }

      const hId = searchData[0].id;
      setHashtagId(hId);

      // Step 2: Fetch media
      const mediaAction = mode === "top" ? "top_media" : "recent_media";
      const mediaRes = await fetch(`/api/meta/discovery?action=${mediaAction}&hashtagId=${hId}&limit=12`);
      const mediaData = await mediaRes.json();
      if (!mediaRes.ok || mediaData.error) {
        throw new Error(mediaData.error || "Failed to load hashtag media");
      }
      setHashtagMedia(Array.isArray(mediaData) ? mediaData : []);
    } catch (err: any) {
      setHashtagError(err.message);
    } finally {
      setHashtagLoading(false);
    }
  };

  // Handle Quota Check
  const handleCheckQuota = async () => {
    setQuotaLoading(true);
    setQuotaError(null);

    try {
      const res = await fetch("/api/meta/discovery?action=publishing_limit");
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to fetch publishing limit");
      }
      setQuotaData(data);
    } catch (err: any) {
      setQuotaError(err.message);
    } finally {
      setQuotaLoading(false);
    }
  };

  // Handle Error Resolver
  const handleResolveError = async () => {
    if (!errorCode.trim()) return;
    try {
      let url = `/api/meta/discovery?action=error_resolver&code=${encodeURIComponent(errorCode.trim())}`;
      if (errorSubcode.trim()) url += `&subcode=${encodeURIComponent(errorSubcode.trim())}`;
      const res = await fetch(url);
      const data = await res.json();
      setErrorResult(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === "quota" && !quotaData) {
      handleCheckQuota();
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 sm:p-6 space-y-6 pb-24 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-pink-500/40 text-pink-400 bg-pink-500/10 gap-1.5 py-1 px-2.5">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            Meta Official API Suite
          </Badge>
          <Badge variant="outline" className="border-blue-500/40 text-blue-400 bg-blue-500/10 py-1 px-2.5">
            Graph API v26.0
          </Badge>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Intelligence & Discovery Studio</h1>
        <p className="text-xs md:text-sm text-zinc-400 max-w-2xl">
          Conduct competitor intelligence via Meta Business Discovery, explore viral hashtags, monitor rolling 24-hour publishing quotas, and troubleshoot API error codes without touching a laptop.
        </p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-zinc-900 p-1.5 rounded-xl border border-zinc-800">
        <button
          onClick={() => setActiveTab("business")}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs md:text-sm font-semibold transition-all ${
            activeTab === "business"
              ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-500/20"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Competitors</span>
        </button>

        <button
          onClick={() => setActiveTab("hashtag")}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs md:text-sm font-semibold transition-all ${
            activeTab === "hashtag"
              ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-500/20"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
          }`}
        >
          <Hash className="w-4 h-4" />
          <span>Hashtags</span>
        </button>

        <button
          onClick={() => setActiveTab("quota")}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs md:text-sm font-semibold transition-all ${
            activeTab === "quota"
              ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-500/20"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
          }`}
        >
          <Gauge className="w-4 h-4" />
          <span>24h Quota</span>
        </button>

        <button
          onClick={() => setActiveTab("errors")}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs md:text-sm font-semibold transition-all ${
            activeTab === "errors"
              ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-500/20"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Error Resolver</span>
        </button>
      </div>

      {/* Tab 1: Business Discovery */}
      {activeTab === "business" && (
        <div className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg flex items-center gap-2">
                <Search className="w-5 h-5 text-pink-400" />
                Meta Business Discovery Search
              </CardTitle>
              <CardDescription className="text-xs text-zinc-400">
                Lookup public Instagram Business and Creator profiles to analyze their bio, follower count, and recent post engagement.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-zinc-500 font-bold text-sm">@</span>
                  <Input
                    placeholder="e.g. nike, natgeo, or any creator handle"
                    value={bizUsername}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBizUsername(e.target.value)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleDiscoverBusiness()}
                    className="pl-8 bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600"
                  />
                </div>
                <Button
                  onClick={handleDiscoverBusiness}
                  disabled={bizLoading || !bizUsername.trim()}
                  className="bg-pink-600 hover:bg-pink-700 text-white shrink-0"
                >
                  {bizLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Search Profile"}
                </Button>
              </div>

              {bizError && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                  <span>{bizError}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {bizResult && (
            <div className="space-y-6">
              {/* Profile Card */}
              <Card className="bg-gradient-to-br from-zinc-900 to-zinc-900 border-zinc-800 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                    {bizResult.profile_picture_url ? (
                      <img
                        src={bizResult.profile_picture_url}
                        alt={bizResult.username}
                        className="w-20 h-20 rounded-full border-2 border-pink-500/60 object-cover shadow-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                        <Users className="w-8 h-8" />
                      </div>
                    )}

                    <div className="flex-1 text-center sm:text-left space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <h2 className="text-xl font-bold text-white">@{bizResult.username}</h2>
                        {bizResult.name && (
                          <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 w-fit mx-auto sm:mx-0">
                            {bizResult.name}
                          </Badge>
                        )}
                      </div>

                      {bizResult.biography && (
                        <p className="text-xs text-zinc-300 max-w-xl whitespace-pre-wrap">{bizResult.biography}</p>
                      )}

                      {bizResult.website && (
                        <a
                          href={bizResult.website.startsWith("http") ? bizResult.website : `https://${bizResult.website}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-pink-400 hover:text-pink-300 flex items-center justify-center sm:justify-start gap-1 w-fit"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>{bizResult.website}</span>
                        </a>
                      )}

                      {/* Stat Counters */}
                      <div className="flex items-center justify-center sm:justify-start gap-6 pt-3">
                        <div className="text-center sm:text-left">
                          <span className="text-lg font-black text-white block">
                            {Number(bizResult.followers_count || 0).toLocaleString()}
                          </span>
                          <span className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider">Followers</span>
                        </div>
                        <div className="text-center sm:text-left">
                          <span className="text-lg font-black text-white block">
                            {Number(bizResult.follows_count || 0).toLocaleString()}
                          </span>
                          <span className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider">Following</span>
                        </div>
                        <div className="text-center sm:text-left">
                          <span className="text-lg font-black text-white block">
                            {Number(bizResult.media_count || 0).toLocaleString()}
                          </span>
                          <span className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider">Posts</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Media Feed */}
              {bizResult.media && bizResult.media.data && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-pink-400" />
                    Latest Public Media ({bizResult.media.data.length})
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bizResult.media.data.map((m: any) => (
                      <Card key={m.id} className="bg-zinc-900 border-zinc-800 overflow-hidden flex flex-col justify-between">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center justify-between text-[11px] text-zinc-400">
                            <Badge variant="outline" className="border-zinc-700 text-zinc-300">
                              {m.media_type || "MEDIA"}
                            </Badge>
                            {m.timestamp && <span>{new Date(m.timestamp).toLocaleDateString()}</span>}
                          </div>

                          {m.caption && (
                            <p className="text-xs text-zinc-300 line-clamp-3 leading-relaxed">{m.caption}</p>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-xs">
                            <div className="flex items-center gap-4 text-zinc-400">
                              <span className="flex items-center gap-1">
                                <Heart className="w-3.5 h-3.5 text-pink-400" />
                                {Number(m.like_count || 0).toLocaleString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle className="w-3.5 h-3.5 text-blue-400" />
                                {Number(m.comments_count || 0).toLocaleString()}
                              </span>
                            </div>

                            {m.permalink && (
                              <a
                                href={m.permalink}
                                target="_blank"
                                rel="noreferrer"
                                className="text-pink-400 hover:text-pink-300 flex items-center gap-1 text-[11px] font-semibold"
                              >
                                <span>View</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Hashtag Explorer */}
      {activeTab === "hashtag" && (
        <div className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg flex items-center gap-2">
                <Hash className="w-5 h-5 text-purple-400" />
                Meta Hashtag Intelligence Explorer
              </CardTitle>
              <CardDescription className="text-xs text-zinc-400">
                Discover viral hashtags and query top-performing posts and recent uploads using official Meta endpoints.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-zinc-500 font-bold text-sm">#</span>
                  <Input
                    placeholder="e.g. reelsviral, ai, tech, marketing"
                    value={hashtagQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHashtagQuery(e.target.value)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleSearchHashtag(hashtagMode)}
                    className="pl-8 bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600"
                  />
                </div>
                <Button
                  onClick={() => handleSearchHashtag(hashtagMode)}
                  disabled={hashtagLoading || !hashtagQuery.trim()}
                  className="bg-purple-600 hover:bg-purple-700 text-white shrink-0"
                >
                  {hashtagLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Search Tag"}
                </Button>
              </div>

              {hashtagId && (
                <div className="flex items-center justify-between flex-wrap gap-2 pt-2">
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <span>Static Hashtag ID:</span>
                    <Badge variant="outline" className="border-purple-500/40 text-purple-300 font-mono">
                      {hashtagId}
                    </Badge>
                  </div>

                  <div className="flex gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                    <button
                      onClick={() => {
                        setHashtagMode("top");
                        handleSearchHashtag("top");
                      }}
                      className={`text-xs py-1 px-3 rounded font-medium transition-all ${
                        hashtagMode === "top" ? "bg-purple-600 text-white" : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      Top Posts
                    </button>
                    <button
                      onClick={() => {
                        setHashtagMode("recent");
                        handleSearchHashtag("recent");
                      }}
                      className={`text-xs py-1 px-3 rounded font-medium transition-all ${
                        hashtagMode === "recent" ? "bg-purple-600 text-white" : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      Recent Posts
                    </button>
                  </div>
                </div>
              )}

              {hashtagError && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                  <span>{hashtagError}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {hashtagMedia.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {hashtagMedia.map((m: any) => (
                <Card key={m.id} className="bg-zinc-900 border-zinc-800 flex flex-col justify-between">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                        {m.media_type || "MEDIA"}
                      </Badge>
                      {m.timestamp && <span>{new Date(m.timestamp).toLocaleDateString()}</span>}
                    </div>

                    {m.caption && (
                      <p className="text-xs text-zinc-300 line-clamp-3 leading-relaxed">{m.caption}</p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-xs">
                      <div className="flex items-center gap-4 text-zinc-400">
                        {m.like_count !== undefined && (
                          <span className="flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5 text-pink-400" />
                            {Number(m.like_count).toLocaleString()}
                          </span>
                        )}
                        {m.comments_count !== undefined && (
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3.5 h-3.5 text-blue-400" />
                            {Number(m.comments_count).toLocaleString()}
                          </span>
                        )}
                      </div>

                      {m.permalink && (
                        <a
                          href={m.permalink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-[11px] font-semibold"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Publishing Limit & Quota */}
      {activeTab === "quota" && (
        <div className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-emerald-400" />
                  Meta Content Publishing Quota Monitor
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400">
                  Meta enforces a strict limit of 50 published posts (reels, carousels, photos) per rolling 24 hours.
                </CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCheckQuota}
                disabled={quotaLoading}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${quotaLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </CardHeader>

            <CardContent className="space-y-6">
              {quotaError ? (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                  <span>{quotaError}</span>
                </div>
              ) : quotaData ? (
                <div className="space-y-6">
                  {/* Quota Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-300 font-semibold">24-Hour Quota Usage</span>
                      <span className="font-mono text-emerald-400 font-bold">
                        {quotaData.quota_usage} / {quotaData.quota_total} Used ({quotaData.quota_remaining} Available)
                      </span>
                    </div>

                    <div className="w-full bg-zinc-950 rounded-full h-3.5 p-0.5 border border-zinc-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          quotaData.quota_usage > 40
                            ? "bg-red-500"
                            : quotaData.quota_usage > 25
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{
                          width: `${Math.min(100, (quotaData.quota_usage / quotaData.quota_total) * 100)}%`
                        }}
                      />
                    </div>
                  </div>

                  {/* Stat Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                      <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">Posts Published</span>
                      <p className="text-2xl font-black text-white mt-1">{quotaData.quota_usage}</p>
                      <span className="text-[10px] text-zinc-500">In last 24 hours</span>
                    </div>

                    <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                      <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">Remaining Quota</span>
                      <p className="text-2xl font-black text-emerald-400 mt-1">{quotaData.quota_remaining}</p>
                      <span className="text-[10px] text-zinc-500">Safe to publish</span>
                    </div>

                    <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                      <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">Window Reset</span>
                      <p className="text-2xl font-black text-blue-400 mt-1">24 Hours</p>
                      <span className="text-[10px] text-zinc-500">Rolling moving period</span>
                    </div>
                  </div>

                  {/* Best Practices Note */}
                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-emerald-300 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Official Meta Quota Rules:</span>
                    </div>
                    <p className="text-zinc-400 leading-relaxed text-[11px]">
                      Publishing single photos, reels, or multi-item carousels each count as 1 container publish. If quota reaches 50, Meta returns Error code 9 / Subcode 2207042 until previous posts clear the 24-hour moving window.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-zinc-500 text-xs">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-zinc-400" />
                  Loading rate limit usage...
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 4: Meta Error Code Troubleshooter */}
      {activeTab === "errors" && (
        <div className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Meta Graph API Error Resolver
              </CardTitle>
              <CardDescription className="text-xs text-zinc-400">
                Instant offline diagnostics and recommended fixes for Meta Graph API error codes & subcodes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-medium">Error Code (Required)</label>
                  <Input
                    placeholder="e.g. 100, 190, 9, 36000"
                    value={errorCode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setErrorCode(e.target.value)}
                    className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-medium">Error Subcode (Optional)</label>
                  <Input
                    placeholder="e.g. 2018007, 2207042, 2207004"
                    value={errorSubcode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setErrorSubcode(e.target.value)}
                    className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600"
                  />
                </div>
              </div>

              <Button
                onClick={handleResolveError}
                disabled={!errorCode.trim()}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold"
              >
                Resolve Error & Show Solution
              </Button>
            </CardContent>
          </Card>

          {errorResult && (
            <Card className="bg-zinc-900 border-amber-500/40 overflow-hidden">
              <CardHeader className="bg-amber-500/10 border-b border-amber-500/20 py-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-amber-500/50 text-amber-300 font-mono">
                    Code {errorResult.code} {errorResult.subcode ? `| Subcode ${errorResult.subcode}` : ""}
                  </Badge>
                  <span className="text-xs text-amber-400 font-bold">{errorResult.title}</span>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-4 text-xs">
                <div className="space-y-1">
                  <span className="text-zinc-400 font-semibold block uppercase tracking-wider text-[10px]">
                    Meta Error Message
                  </span>
                  <p className="text-zinc-200 bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 font-mono text-[11px]">
                    {errorResult.message}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-emerald-400 font-semibold block uppercase tracking-wider text-[10px]">
                    Recommended Fix & Solution
                  </span>
                  <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/40 text-emerald-300 leading-relaxed text-xs">
                    {errorResult.solution}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Common Codes */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-zinc-400">Common Creator Errors:</span>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Daily Quota Reached (Code 9 / 2207042)", c: "9", s: "2207042" },
                { label: "Direct Voice Note MP3 Error (Code 100 / 2018007)", c: "100", s: "2018007" },
                { label: "Token Expired (Code 190)", c: "190", s: "" },
                { label: "Image Exceeds 8MB (Code 36000 / 2207004)", c: "36000", s: "2207004" },
                { label: "Invalid Aspect Ratio (Code 36003 / 2207009)", c: "36003", s: "2207009" }
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setErrorCode(item.c);
                    setErrorSubcode(item.s);
                    handleResolveError();
                  }}
                  className="text-[11px] py-1 px-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
