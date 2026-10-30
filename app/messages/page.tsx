"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  MessageSquare,
  Send,
  Heart,
  Flame,
  ThumbsUp,
  Volume2,
  FileText,
  User,
  RefreshCw,
  Loader2,
  CheckCheck,
  Eye,
  CornerUpLeft,
} from "lucide-react";
import { toast } from "sonner";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);
  const [recipientId, setRecipientId] = useState("");
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [attachmentMode, setAttachmentMode] = useState<"none" | "audio" | "file">("none");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);

  // Fetch capabilities & user
  const { data: authData } = useQuery({
    queryKey: ["auth-me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      return res.json();
    },
  });

  const { data: capabilities } = useQuery({
    queryKey: ["meta-account"],
    queryFn: async () => {
      const res = await fetch("/api/meta/account");
      return res.json();
    },
  });

  // Fetch conversations
  const {
    data: convData,
    isLoading: isConvLoading,
    refetch: refetchConversations,
  } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await fetch("/api/meta/conversations");
      return res.json();
    },
    refetchInterval: 12000, // Poll every 12s
  });

  // Fetch messages if a conversation is selected
  const {
    data: msgData,
    isLoading: isMsgLoading,
    refetch: refetchMessages,
  } = useQuery({
    queryKey: ["conversation-messages", selectedConversation?.id],
    queryFn: async () => {
      if (!selectedConversation?.id) return { messages: [] };
      const res = await fetch(`/api/meta/conversations?conversationId=${selectedConversation.id}`);
      return res.json();
    },
    enabled: !!selectedConversation?.id,
    refetchInterval: 6000, // Poll every 6s for active chat
  });

  const handleSelectConversation = (conv: any) => {
    setSelectedConversation(conv);
    const participant = conv.participants?.data?.[0];
    if (participant?.id) {
      setRecipientId(participant.id);
    }
    setReplyToId(null);
  };

  const handleSendDM = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text && !attachmentUrl.trim()) {
      toast.error("Please enter a message or attachment URL.");
      return;
    }

    if (!recipientId.trim()) {
      toast.error("Please specify a Recipient IGSID or select a conversation.");
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch("/api/meta/dm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_dm",
          recipientId: recipientId.trim(),
          messageText: text || undefined,
          attachmentType: attachmentMode !== "none" ? attachmentMode : undefined,
          attachmentUrl: attachmentUrl.trim() || undefined,
          replyToMessageId: replyToId || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Direct message sent successfully!");
        setInputText("");
        setAttachmentUrl("");
        setAttachmentMode("none");
        setReplyToId(null);
        refetchMessages();
      } else {
        toast.error(data.error || "Failed to deliver message.");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error sending DM.");
    } finally {
      setIsSending(false);
    }
  };

  const handleReact = async (messageId: string, emoji: string) => {
    if (!recipientId) return;
    try {
      const res = await fetch("/api/meta/dm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "react",
          recipientId,
          messageId,
          reaction: emoji,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Reacted with ${emoji}!`);
      } else {
        toast.error(data.error || "Failed to react.");
      }
    } catch (err: any) {
      toast.error(err.message || "Error reacting to message.");
    }
  };

  const handleMarkSeen = async () => {
    if (!recipientId) return;
    try {
      await fetch("/api/meta/dm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sender_action",
          recipientId,
          senderAction: "mark_seen",
        }),
      });
      toast.success("Marked conversation as seen!");
    } catch (err: any) {
      toast.error("Failed to mark as seen.");
    }
  };

  const conversations = convData?.conversations || [];
  const messages = msgData?.messages || [];

  return (
    <div className="flex min-h-screen bg-[#000000] text-zinc-100 font-sans selection:bg-pink-500 selection:text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
        <Header
          user={authData?.user}
          accountUsername={capabilities?.username}
          isConnected={capabilities?.connected}
        />

        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full flex flex-col h-[calc(100vh-5rem)]">
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400 bg-pink-500/10 border border-pink-500/25 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-pink-400" />
                  Instagram Direct
                </span>
                <span className="text-[10px] text-zinc-500">• Voice Notes & Attachments</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
                Direct Messaging Studio
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchConversations()}
                disabled={isConvLoading}
                className="text-xs border-white/[0.08]"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isConvLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>

          {/* Main Messaging Interface: Split View */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 min-h-0 bg-[#0C0C0C] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl">
            {/* Left Column: Conversations List */}
            <div className="border-r border-white/[0.08] flex flex-col min-h-0">
              <div className="p-3.5 border-b border-white/[0.08] flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-300">Chats ({conversations.length})</span>
                <span className="text-[10px] text-zinc-500">Live Sync</span>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
                {isConvLoading ? (
                  <div className="p-8 text-center text-zinc-500 text-xs flex flex-col items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-pink-400" />
                    <span>Loading Instagram chats...</span>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-6 text-center text-zinc-500 text-xs">
                    <p>No active direct conversations found.</p>
                    <p className="text-[11px] text-zinc-600 mt-1">
                      New messages sent by followers will appear here in real-time.
                    </p>
                  </div>
                ) : (
                  conversations.map((c: any) => {
                    const participant = c.participants?.data?.[0];
                    const isSelected = selectedConversation?.id === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => handleSelectConversation(c)}
                        className={`w-full text-left p-3.5 hover:bg-zinc-900/60 transition-all flex items-center justify-between gap-3 ${
                          isSelected ? "bg-pink-500/10 border-l-2 border-pink-500" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {participant?.username?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-white block truncate">
                              @{participant?.username || "Instagram User"}
                            </span>
                            <span className="text-[10px] text-zinc-500 block truncate">
                              ID: {participant?.id || c.id}
                            </span>
                          </div>
                        </div>

                        {c.unread_count > 0 && (
                          <Badge className="bg-pink-500 text-white text-[9px] px-1.5 py-0 h-4">
                            {c.unread_count}
                          </Badge>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Column: Chat Window & Composer */}
            <div className="md:col-span-2 flex flex-col min-h-0">
              {/* Chat Header */}
              <div className="p-3.5 border-b border-white/[0.08] flex items-center justify-between bg-zinc-950/40">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-bold text-white truncate">
                    {selectedConversation
                      ? `@${selectedConversation.participants?.data?.[0]?.username || "Chat"}`
                      : "Direct Messenger"}
                  </span>
                  {recipientId && (
                    <span className="text-[10px] text-zinc-500 font-mono truncate">({recipientId})</span>
                  )}
                </div>

                {recipientId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkSeen}
                    className="text-[10px] text-zinc-400 hover:text-white h-7 px-2"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Mark Seen
                  </Button>
                )}
              </div>

              {/* Chat Message Bubble Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col-reverse">
                {isMsgLoading ? (
                  <div className="p-8 text-center text-zinc-500 text-xs flex flex-col items-center gap-2 m-auto">
                    <Loader2 className="w-5 h-5 animate-spin text-pink-400" />
                    <span>Loading messages...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-zinc-500 text-xs m-auto p-4">
                    <p>Select a chat on the left or enter an Instagram Scoped User ID below to send a message.</p>
                  </div>
                ) : (
                  messages.map((m: any) => {
                    const isFromMe = m.from?.id === capabilities?.userId;
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col group ${isFromMe ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs relative ${
                            isFromMe
                              ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-br-none"
                              : "bg-zinc-800/90 text-zinc-100 rounded-bl-none border border-white/[0.06]"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{m.message}</p>

                          {/* Quick Emoji Reaction Pill */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-3 right-0 flex items-center gap-1 bg-zinc-900 border border-white/[0.1] rounded-full px-1.5 py-0.5 shadow-md">
                            <button
                              onClick={() => handleReact(m.id, "❤️")}
                              className="text-[11px] hover:scale-125 transition-transform"
                              title="Double-Tap Heart"
                            >
                              ❤️
                            </button>
                            <button
                              onClick={() => handleReact(m.id, "🔥")}
                              className="text-[11px] hover:scale-125 transition-transform"
                              title="Fire"
                            >
                              🔥
                            </button>
                            <button
                              onClick={() => handleReact(m.id, "👍")}
                              className="text-[11px] hover:scale-125 transition-transform"
                              title="Thumbs Up"
                            >
                              👍
                            </button>
                            <button
                              onClick={() => setReplyToId(m.id)}
                              className="text-zinc-400 hover:text-white p-0.5"
                              title="Quote Reply"
                            >
                              <CornerUpLeft className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <span className="text-[9px] text-zinc-500 mt-1 px-1">
                          {new Date(m.created_time).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Reply To Banner */}
              {replyToId && (
                <div className="bg-zinc-900 px-3 py-1.5 border-t border-white/[0.08] text-[10px] text-zinc-400 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <CornerUpLeft className="w-3 h-3 text-pink-400" />
                    Replying to message ID: <span className="font-mono text-pink-300">{replyToId}</span>
                  </span>
                  <button onClick={() => setReplyToId(null)} className="text-zinc-500 hover:text-white">
                    ✕
                  </button>
                </div>
              )}

              {/* Message Composer */}
              <form onSubmit={handleSendDM} className="p-3 border-t border-white/[0.08] bg-zinc-950/80 space-y-2">
                {!selectedConversation && (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={recipientId}
                      onChange={(e) => setRecipientId(e.target.value)}
                      placeholder="Recipient IGSID (Instagram Scoped User ID)"
                      className="w-full bg-zinc-900 border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-pink-500"
                    />
                  </div>
                )}

                {attachmentMode !== "none" && (
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={attachmentUrl}
                      onChange={(e) => setAttachmentUrl(e.target.value)}
                      placeholder={
                        attachmentMode === "audio"
                          ? "Direct URL to audio file (.m4a or .wav)"
                          : "Direct URL to document (.pdf)"
                      }
                      className="w-full bg-zinc-900 border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-pink-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setAttachmentMode("none");
                        setAttachmentUrl("");
                      }}
                      className="text-xs text-zinc-500 hover:text-white px-2"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setAttachmentMode(attachmentMode === "audio" ? "none" : "audio")}
                      className={`p-2 rounded-xl border transition-colors ${
                        attachmentMode === "audio"
                          ? "bg-pink-500/20 border-pink-500 text-pink-400"
                          : "border-white/[0.08] hover:bg-zinc-900 text-zinc-400"
                      }`}
                      title="Attach Voice Note (.m4a/.wav)"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setAttachmentMode(attachmentMode === "file" ? "none" : "file")}
                      className={`p-2 rounded-xl border transition-colors ${
                        attachmentMode === "file"
                          ? "bg-pink-500/20 border-pink-500 text-pink-400"
                          : "border-white/[0.08] hover:bg-zinc-900 text-zinc-400"
                      }`}
                      title="Attach Document (.pdf)"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type an Instagram direct message..."
                    className="flex-1 bg-zinc-900 border border-white/[0.1] rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-pink-500"
                  />

                  <Button
                    type="submit"
                    disabled={isSending}
                    className="primary-gradient-bg text-white text-xs px-4 py-2 rounded-xl shadow-lg shadow-pink-500/20 shrink-0"
                  >
                    {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
