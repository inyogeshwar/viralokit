"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Search,
  ExternalLink,
  ChevronRight,
  FileText,
  Sparkles,
  ArrowLeft,
  Copy,
  Check,
  RefreshCw
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DocItem {
  title: string;
  file: string;
  url: string;
  size: number;
  category: string;
}

export default function DocsPage() {
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  // Active reading document
  const [selectedDoc, setSelectedDoc] = useState<DocItem | null>(null);
  const [docContent, setDocContent] = useState<string | null>(null);
  const [docLoading, setDocLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/meta/docs")
      .then((res) => res.json())
      .then((data) => {
        if (data.docs) setDocs(data.docs);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSelectDoc = async (doc: DocItem) => {
    setSelectedDoc(doc);
    setDocLoading(true);
    setDocContent(null);

    try {
      const res = await fetch(`/api/meta/docs?path=${encodeURIComponent(doc.file)}`);
      const data = await res.json();
      setDocContent(data.content || "No content found");
    } catch (err: any) {
      setDocContent(`Error loading document: ${err.message}`);
    } finally {
      setDocLoading(false);
    }
  };

  const categories = ["All", ...Array.from(new Set(docs.map((d) => d.category)))];

  const filteredDocs = docs.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.file.toLowerCase().includes(search.toLowerCase()) ||
      d.category.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === "All" || d.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleCopyContent = () => {
    if (!docContent) return;
    navigator.clipboard.writeText(docContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 sm:p-6 space-y-6 pb-24 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-pink-500/40 text-pink-400 bg-pink-500/10 gap-1.5 py-1 px-2.5">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            Offline Documentation Archive
          </Badge>
          <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 py-1 px-2.5">
            70 Official Guides
          </Badge>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Meta Official API Documentation</h1>
        <p className="text-xs md:text-sm text-zinc-400 max-w-2xl">
          Browse, search, and read the entire official Meta Instagram Graph API documentation library offline on your smartphone or desktop.
        </p>
      </div>

      {/* Main Content: Reader Mode vs List Mode */}
      {selectedDoc ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDoc(null)}
              className="border-zinc-800 text-zinc-300 hover:bg-zinc-900 gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Library</span>
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyContent}
                className="border-zinc-800 text-zinc-300 hover:bg-zinc-900 gap-1.5"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copied" : "Copy Markdown"}</span>
              </Button>

              <a
                href={selectedDoc.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-pink-600 hover:bg-pink-700 text-white transition-colors"
              >
                <span>Meta Official Docs</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
            <div className="p-4 border-b border-zinc-800 bg-zinc-950/40 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-base md:text-lg font-bold text-white">{selectedDoc.title}</h2>
                <p className="text-[11px] font-mono text-zinc-400 mt-0.5">{selectedDoc.file}</p>
              </div>
              <Badge variant="outline" className="border-pink-500/30 text-pink-300">
                {selectedDoc.category}
              </Badge>
            </div>

            <CardContent className="p-4 md:p-6">
              {docLoading ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-pink-400" />
                  Loading guide contents...
                </div>
              ) : (
                <div className="bg-zinc-950 p-4 md:p-6 rounded-md border border-zinc-800 overflow-x-auto text-xs md:text-sm font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-[75vh] overflow-y-auto">
                  {docContent}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Search & Category Filter */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <Input
                placeholder="Search all 70 Meta official guides (e.g. webhooks, carousel, comments, hashtags, limits)..."
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                className="pl-9 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs py-1.5 px-3 rounded-lg font-medium whitespace-nowrap transition-all shrink-0 ${
                    selectedCategory === cat
                      ? "bg-pink-600 text-white font-semibold shadow-md shadow-pink-500/20"
                      : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Docs Grid */}
          {loading ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-pink-400" />
              Indexing official Meta guides...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredDocs.map((doc, idx) => (
                <Card
                  key={idx}
                  onClick={() => handleSelectDoc(doc)}
                  className="bg-zinc-900 border-zinc-800 hover:border-pink-500/50 hover:bg-zinc-900 transition-all cursor-pointer group"
                >
                  <CardContent className="p-4 flex items-center justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                        <FileText className="w-4 h-4 text-pink-400" />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <h3 className="text-xs md:text-sm font-bold text-white truncate group-hover:text-pink-300 transition-colors">
                          {doc.title}
                        </h3>
                        <p className="text-[11px] font-mono text-zinc-400 truncate">{doc.file}</p>
                        <div className="flex items-center gap-2 pt-1">
                          <Badge variant="outline" className="border-zinc-800 text-[10px] text-zinc-400 px-1.5 py-0">
                            {doc.category}
                          </Badge>
                          <span className="text-[10px] text-slate-500">{(doc.size / 1024).toFixed(1)} KB</span>
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-pink-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
