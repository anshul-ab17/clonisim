"use client";

import { type FormEvent, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface CreateChannelModalProps {
  children: React.ReactNode;
  onCreate: (name: string) => Promise<void>;
}

export function CreateChannelModal({ children, onCreate }: CreateChannelModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onCreate(name.trim());
      setName("");
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent title="Create Channel">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            placeholder="channel-name"
            value={name}
            onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
            autoFocus
          />
          <Button type="submit" disabled={loading || !name.trim()} className="w-full">
            {loading ? "Creating..." : "Create Channel"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
