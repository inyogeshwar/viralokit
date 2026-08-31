"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronsUpDown, Database } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Account {
  id: string;
  igUserId: string;
  username: string | null;
  name: string | null;
  tokenType: string;
  profilePictureUrl?: string | null;
}

export function AccountSwitcher({ mockMode }: { mockMode: boolean }) {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    fetch("/api/accounts")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setAccounts(data.accounts ?? []);
          setActiveId(data.activeId ?? "");
        }
      })
      .catch(() => undefined);
  }, []);

  async function onChange(id: string) {
    setActiveId(id);
    await fetch("/api/accounts/active", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  }

  const active = accounts.find((a) => a.id === activeId);

  return (
    <div className="flex items-center gap-2">
      {mockMode ? <Badge variant="warning">Mock</Badge> : null}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 px-2">
            <Avatar className="size-5">
              {active?.profilePictureUrl ? (
                <AvatarImage src={active.profilePictureUrl} alt={active.username ?? ""} />
              ) : null}
              <AvatarFallback>@</AvatarFallback>
            </Avatar>
            <span className="max-w-[120px] truncate text-xs font-medium">
              @{active?.username ?? (accounts.length ? "Select account" : "No accounts")}
            </span>
            <ChevronsUpDown className="size-3.5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex items-center gap-1.5 text-xs">
            <Database className="size-3.5" /> Switch account
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {accounts.length === 0 ? (
            <DropdownMenuItem disabled className="justify-center py-3 text-muted-foreground">
              No accounts connected
            </DropdownMenuItem>
          ) : (
            accounts.map((account) => (
              <DropdownMenuItem
                key={account.id}
                onClick={() => onChange(account.id)}
                className="gap-2"
              >
                <Avatar className="size-5">
                  {account.profilePictureUrl ? (
                    <AvatarImage src={account.profilePictureUrl} alt={account.username ?? ""} />
                  ) : null}
                  <AvatarFallback>@</AvatarFallback>
                </Avatar>
                <span className="flex-1 truncate">
                  @{account.username ?? account.igUserId}
                </span>
                {account.id === activeId && (
                  <CheckCircle2 className="size-4 text-emerald-500" />
                )}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
