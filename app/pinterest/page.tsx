"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

type Board = { id: string; name: string; pin_count?: number; description?: string };

export default function PinterestAutomationPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [boardId, setBoardId] = useState("");
  const [intervalMinutes, setIntervalMinutes] = useState("1440");
  const [limit, setLimit] = useState("20");
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  const loadBoards = useCallback(async () => {
    try {
      const response = await fetch("/api/pinterest/boards", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Pinterest is not connected.");
      setBoards(data.boards || []);
      setConnected(true);
      if (data.boards?.length) setBoardId((current) => current || data.boards[0].id);
    } catch {
      setConnected(false);
    }
  }, []);

  useEffect(() => { void loadBoards(); }, [loadBoards]);

  async function importBoard() {
    if (!boardId) return toast.error("Choose a Pinterest Board first.");
    setLoading(true);
    try {
      const response = await fetch("/api/pinterest/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boardId, intervalMinutes: Number(intervalMinutes), limit: Number(limit) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not queue Pins.");
      toast.success(`Queued ${data.imported} Pins for Instagram.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Import failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-5 md:p-10">
      <div className="mx-auto max-w-3xl space-y-7">
        <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-white">← Back to Dashboard</Link>
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-pink-400">Creator Automation</p>
          <h1 className="text-3xl md:text-4xl font-bold">Pinterest → Instagram</h1>
          <p className="text-zinc-400">Import image Pins from a board and queue them as single-image Instagram posts.</p>
        </header>
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 md:p-7 space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div><h2 className="font-semibold">1. Connect Pinterest</h2><p className="text-sm text-zinc-400">Authorization is handled through Pinterest OAuth.</p></div>
            <span className={connected ? "text-xs text-emerald-400" : "text-xs text-amber-300"}>{connected ? "Connected" : "Not connected"}</span>
          </div>
          {!connected && <a href="/api/pinterest/connect" className="inline-flex rounded-xl bg-white px-4 py-2.5 font-semibold text-zinc-950 hover:bg-zinc-200">Connect Pinterest</a>}
          <div className="border-t border-zinc-800 pt-5 space-y-4">
            <h2 className="font-semibold">2. Choose Board & schedule</h2>
            <label className="block space-y-2 text-sm"><span className="text-zinc-300">Pinterest Board</span>
              <select value={boardId} onChange={(e) => setBoardId(e.target.value)} disabled={!boards.length} className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3">
                {boards.length ? boards.map((board) => <option key={board.id} value={board.id}>{board.name} ({board.pin_count ?? 0} Pins)</option>) : <option value="">Connect Pinterest to load Boards</option>}
              </select>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-2 text-sm"><span className="text-zinc-300">Post interval</span>
                <select value={intervalMinutes} onChange={(e) => setIntervalMinutes(e.target.value)} className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3">
                  <option value="15">Every 15 minutes</option><option value="30">Every 30 minutes</option><option value="60">Every hour</option><option value="120">Every 2 hours</option><option value="240">Every 4 hours</option><option value="480">Every 8 hours</option><option value="720">Every 12 hours</option><option value="1440">Daily</option><option value="10080">Weekly</option>
                </select>
              </label>
              <label className="block space-y-2 text-sm"><span className="text-zinc-300">Maximum Pins to queue</span>
                <select value={limit} onChange={(e) => setLimit(e.target.value)} className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3">
                  <option value="5">5 Pins</option><option value="10">10 Pins</option><option value="20">20 Pins</option><option value="50">50 Pins</option>
                </select>
              </label>
            </div>
            <button onClick={importBoard} disabled={!connected || loading || !boardId} className="w-full rounded-xl bg-gradient-to-r from-pink-600 to-violet-600 px-4 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-50">{loading ? "Importing Pins…" : "Import Board & Queue Instagram Posts"}</button>
            <p className="text-xs leading-relaxed text-zinc-500">Only image Pins with public HTTPS media URLs are queued. Respect image ownership and permissions. Queue processing requires the scheduled worker and a valid Instagram Professional account connection.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
