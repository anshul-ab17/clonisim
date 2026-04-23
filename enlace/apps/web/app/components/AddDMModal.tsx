"use client";

import { type FormEvent, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import type { Room } from "../types";

const API_URL = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:3003";

interface AddDMModalProps {
  children: React.ReactNode;
  onOpen: (targetUserId: string, targetUserName?: string) => Promise<Room | null>;
}

export function AddDMModal({ children, onOpen }: AddDMModalProps) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/users/by-name/${encodeURIComponent(username.trim())}`);
      if (!res.ok) { setError("User not found"); return; }
      const user = (await res.json()) as { id: string; name: string };
      const result = await onOpen(user.id, user.name);
      if (result) {
        setUsername("");
        setOpen(false);
      } else {
        setError("Could not open DM");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent title="New Direct Message">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            placeholder="Search by username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <Button type="submit" disabled={loading || !username.trim()} className="w-full">
            {loading ? "Opening..." : "Open DM"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
