"use client";

import { type FormEvent, useState } from "react";
import { UserPlus } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

const API_URL = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:3003";

interface InviteToChannelModalProps {
  chatId: string;
  channelName: string;
  token: string;
  children: React.ReactNode;
}

export function InviteToChannelModal({ chatId, channelName, token, children }: InviteToChannelModalProps) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const handleInvite = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setStatus(null);
    setLoading(true);
    try {
      const userRes = await fetch(`${API_URL}/users/by-name/${encodeURIComponent(username.trim())}`, { headers });
      if (!userRes.ok) {
        setStatus({ ok: false, msg: "User not found" });
        return;
      }
      const { id: userId } = (await userRes.json()) as { id: string; name: string };
      const res = await fetch(`${API_URL}/chats/channels/${chatId}/join`, {
        method: "POST",
        headers,
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        setStatus({ ok: true, msg: `${username.trim()} added to #${channelName}` });
        setUsername("");
      } else {
        setStatus({ ok: false, msg: "Failed to invite user" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-bg-surface border border-border-subtle rounded-xl p-6 z-50 shadow-2xl">
          <Dialog.Title className="text-white font-semibold text-base mb-1">
            Invite to #{channelName}
          </Dialog.Title>
          <Dialog.Description className="text-gray-400 text-sm mb-4">
            Enter a username to add them to this channel.
          </Dialog.Description>
          <form onSubmit={handleInvite} className="flex gap-2">
            <Input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
            <Button type="submit" disabled={loading || !username.trim()}>
              <UserPlus size={15} />
              Invite
            </Button>
          </form>
          {status && (
            <p className={`text-sm mt-3 ${status.ok ? "text-green-400" : "text-red-400"}`}>
              {status.msg}
            </p>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
