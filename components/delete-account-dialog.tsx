"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DeleteAccountDialog({
  ownerEmail,
  disabled = false,
}: {
  ownerEmail: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = confirm.trim().toLowerCase();
  const owner = ownerEmail.trim().toLowerCase();
  const matches = trimmed === owner;

  async function onConfirm() {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/account/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmEmail: confirm }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Could not delete account. Please try again.");
        setSubmitting(false);
        return;
      }
      setOpen(false);
      router.push("/?deleted=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        setConfirm("");
        setError(null);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" disabled={disabled}>
          <Trash2 className="mr-1.5 size-3.5" />
          Delete workspace
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-5" />
            Delete this workspace?
          </DialogTitle>
          <DialogDescription>
            This permanently deletes the workspace and every connected Instagram
            account, scheduled post, media file, comment, message, and automation
            rule. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="confirm-email">
            Type <span className="font-mono">{ownerEmail}</span> to confirm
          </Label>
          <Input
            id="confirm-email"
            type="email"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder={ownerEmail}
            autoComplete="off"
            spellCheck={false}
          />
          {error ? (
            <p className="text-xs text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={!matches || submitting}
            aria-disabled={!matches || submitting}
          >
            {submitting ? "Deleting…" : "Delete forever"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
