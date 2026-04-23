"use client";

import { type FormEvent, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useUserStore } from "../store/useUserStore";
import type { User } from "../types";

const API_URL = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:3003";

type Mode = "signup" | "signin";

interface AuthModalProps {
  children: React.ReactNode;
  defaultMode?: Mode;
}

export function AuthModal({ children, defaultMode = "signup" }: AuthModalProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const setSession = useUserStore((s) => s.setSession);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !password) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), password }),
      });
      const body = (await res.json()) as { user: User; token: string } | { error: string };
      if (!res.ok) {
        setError("error" in body ? body.error : "Something went wrong");
        return;
      }
      if ("token" in body) {
        setSession(body.user, body.token);
        setOpen(false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <div className="flex gap-1 mb-6 bg-bg-base rounded-lg p-1">
          {(["signup", "signin"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors capitalize ${mode === m ? "bg-primary text-white" : "text-gray-400 hover:text-gray-200"
                }`}
            >
              {m === "signup" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            placeholder="Username"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <Button
            type="submit"
            disabled={loading || !name.trim() || !password}
            className="w-full mt-1"
            size="lg"
          >
            {loading ? "..." : mode === "signup" ? "Sign In" : "Create Account"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
