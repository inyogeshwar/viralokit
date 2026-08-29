"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Sparkles, Trash2, Hand, AlertOctagon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface IceBreaker {
  question: string;
  payload: string;
}

interface EngagementPanelProps {
  setMessage: (msg: { kind: "ok" | "error"; text: string } | null) => void;
}

const MAX_QUESTIONS = 4;
const MAX_QUESTION_CHARS = 80;
const MAX_PAYLOAD_CHARS = 1000;

export function EngagementPanel({ setMessage }: EngagementPanelProps) {
  const [iceBreakers, setIceBreakers] = useState<IceBreaker[]>([]);
  const [loadingIce, setLoadingIce] = useState(true);
  const [savingIce, setSavingIce] = useState(false);
  const [draftQuestions, setDraftQuestions] = useState<Array<{ question: string; payload: string }>>([
    { question: "", payload: "" },
  ]);
  const [storyAutoReply, setStoryAutoReply] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/engagement/ice-breakers");
        const data = await res.json();
        if (!cancelled && data.ok) {
          const list: IceBreaker[] = data.iceBreakers ?? [];
          setIceBreakers(list);
          if (list.length > 0) {
            setDraftQuestions(list);
          }
        }
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoadingIce(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function saveIceBreakers() {
    const valid = draftQuestions
      .map((q) => ({ question: q.question.trim(), payload: q.payload.trim() }))
      .filter((q) => q.question && q.payload);
    if (valid.length === 0) {
      setMessage({ kind: "error", text: "Add at least one question + payload" });
      return;
    }
    if (valid.length > MAX_QUESTIONS) {
      setMessage({ kind: "error", text: `Maximum ${MAX_QUESTIONS} ice breakers` });
      return;
    }
    for (const q of valid) {
      if (q.question.length > MAX_QUESTION_CHARS) {
        setMessage({ kind: "error", text: `Question too long (max ${MAX_QUESTION_CHARS} chars)` });
        return;
      }
      if (q.payload.length > MAX_PAYLOAD_CHARS) {
        setMessage({ kind: "error", text: `Payload too long (max ${MAX_PAYLOAD_CHARS} chars)` });
        return;
      }
    }
    setSavingIce(true);
    try {
      const res = await fetch("/api/engagement/ice-breakers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: valid }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed to save");
      setIceBreakers(valid);
      setMessage({ kind: "ok", text: `Saved ${valid.length} ice breaker(s)` });
    } catch (err) {
      setMessage({ kind: "error", text: String(err instanceof Error ? err.message : err) });
    } finally {
      setSavingIce(false);
    }
  }

  async function deleteIceBreakers() {
    setSavingIce(true);
    try {
      const res = await fetch("/api/engagement/ice-breakers", { method: "DELETE" });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed to delete");
      setIceBreakers([]);
      setDraftQuestions([{ question: "", payload: "" }]);
      setMessage({ kind: "ok", text: "Ice breakers removed" });
    } catch (err) {
      setMessage({ kind: "error", text: String(err instanceof Error ? err.message : err) });
    } finally {
      setSavingIce(false);
    }
  }

  function addDraftQuestion() {
    if (draftQuestions.length >= MAX_QUESTIONS) return;
    setDraftQuestions([...draftQuestions, { question: "", payload: "" }]);
  }

  function removeDraftQuestion(idx: number) {
    setDraftQuestions(draftQuestions.filter((_, i) => i !== idx));
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-4" />
            Ice Breakers
          </CardTitle>
          <CardDescription>
            Conversation starters shown to users when they open a DM. Max {MAX_QUESTIONS} questions,
            each up to {MAX_QUESTION_CHARS} characters.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {loadingIce ? (
            <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
              <Loader2 className="mr-2 size-4 animate-spin" />
              Loading…
            </div>
          ) : (
            <>
              {draftQuestions.map((q, idx) => (
                <div key={idx} className="flex flex-col gap-2 rounded-md border p-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">Question {idx + 1}</Label>
                    {draftQuestions.length > 1 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-6"
                        onClick={() => removeDraftQuestion(idx)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    ) : null}
                  </div>
                  <Input
                    value={q.question}
                    onChange={(e) => {
                      const next = [...draftQuestions];
                      next[idx] = { ...next[idx], question: e.target.value };
                      setDraftQuestions(next);
                    }}
                    placeholder="e.g. What are your prices?"
                    maxLength={MAX_QUESTION_CHARS}
                  />
                  <Label className="text-xs">Payload (sent back when tapped)</Label>
                  <Textarea
                    value={q.payload}
                    onChange={(e) => {
                      const next = [...draftQuestions];
                      next[idx] = { ...next[idx], payload: e.target.value };
                      setDraftQuestions(next);
                    }}
                    placeholder="e.g. prices"
                    className="min-h-12"
                    maxLength={MAX_PAYLOAD_CHARS}
                  />
                </div>
              ))}
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addDraftQuestion}
                  disabled={draftQuestions.length >= MAX_QUESTIONS}
                >
                  <Plus className="mr-1.5 size-3.5" />
                  Add question
                </Button>
                <div className="flex gap-2">
                  {iceBreakers.length > 0 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={deleteIceBreakers}
                      disabled={savingIce}
                    >
                      {savingIce ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : <Trash2 className="mr-1.5 size-3.5" />}
                      Remove all
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    onClick={saveIceBreakers}
                    disabled={savingIce}
                  >
                    {savingIce ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : <Sparkles className="mr-1.5 size-3.5" />}
                    Save ice breakers
                  </Button>
                </div>
              </div>
              {iceBreakers.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="text-xs text-muted-foreground">Live on Instagram:</span>
                  {iceBreakers.map((q, i) => (
                    <Badge key={i} variant="secondary">{q.question}</Badge>
                  ))}
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hand className="size-4" />
            Story Mention Auto-Reply
          </CardTitle>
          <CardDescription>
            When someone mentions this account in their story, automatically DM them a thank-you /
            promo message. (Save as a Rules trigger = &quot;story_mention&quot; for full customization.)
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Textarea
            value={storyAutoReply}
            onChange={(e) => setStoryAutoReply(e.target.value)}
            placeholder="Thanks for the shoutout! Use code STORY10 for 10% off 🎉"
            className="min-h-20"
            maxLength={1000}
            disabled
          />
          <p className="text-xs text-muted-foreground">
            Coming soon: full story-trigger editor. For now, create a Rule with trigger = story_mention
            to customize the reply.
          </p>
          <Button disabled>
            <Hand className="mr-1.5 size-3.5" />
            Save (use Rules tab for now)
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertOctagon className="size-4" />
            Human Escalation
          </CardTitle>
          <CardDescription>
            When a user types a human-handoff keyword, automation pauses for that conversation and a
            team member is notified. The default keywords are: help, human, agent, support,
            representative, talk to a person, real person, speak to someone, operator, customer
            service.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <p>
            <Badge variant="success">Active</Badge> &nbsp; The user gets a one-time acknowledgment
            DM, then all future messages in that thread skip automation for 7 days.
          </p>
          <p className="text-xs text-muted-foreground">
            Escalated conversations surface in your Inbox for a human to follow up.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
