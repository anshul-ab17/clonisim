"use client";

import { type FormEvent, useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar } from "./ui/avatar";
import { useUserStore } from "../store/useUserStore";

const API_URL = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:3003";

interface EditProfileModalProps {
  children: React.ReactNode;
}

export function EditProfileModal({ children }: EditProfileModalProps) {
  const [open, setOpen] = useState(false);
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const user = useUserStore((s) => s.user);
  const token = useUserStore((s) => s.token);

  // Load existing bio when modal opens
  useEffect(() => {
    if (!open || !user) return;
    fetch(`${API_URL}/users/${user.id}`)
      .then((r) => r.json())
      .then((data: { bio?: string }) => setBio(data.bio ?? ""))
      .catch(() => {});
  }, [open, user?.id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    setSaved(false);
    try {
      await fetch(`${API_URL}/users/me`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ bio }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <>{children}</>;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent title="Edit Profile">
        <div className="flex flex-col gap-5">
          {/* Profile preview */}
          <div className="flex items-center gap-3 p-4 bg-bg-base rounded-lg">
            <Avatar name={user.name} size="lg" />
            <div>
              <p className="text-white font-semibold">{user.name}</p>
              <p className="text-gray-500 text-xs font-mono mt-0.5">{user.id}</p>
              {bio && <p className="text-gray-400 text-sm mt-1 italic">"{bio}"</p>}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">
                Username
              </label>
              <Input value={user.name} disabled className="opacity-50 cursor-not-allowed" />
            </div>

            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">
                About me
              </label>
              <textarea
                className="w-full bg-bg-base border border-border-subtle rounded-lg px-4 py-2.5 text-white text-sm outline-none placeholder-gray-500 focus:border-primary transition-colors resize-none"
                placeholder="Tell people a bit about yourself..."
                rows={3}
                maxLength={200}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
              <p className="text-gray-600 text-xs mt-1 text-right">{bio.length}/200</p>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Saving..." : saved ? "Saved!" : "Save Changes"}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
