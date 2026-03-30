"use client";

import { type FormEvent, useState } from "react";
import { useUserStore } from "../store/useUserStore";
import type { User } from "../types";

interface LoginScreenProps {
  apiUrl: string;
}

type Mode = "login" | "register";

export function LoginScreen({ apiUrl }: LoginScreenProps) {
  const [mode, setMode] = useState<Mode>("login");
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
      const res = await fetch(`${apiUrl}/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), password }),
      });

      const body = (await res.json()) as
        | { user: User; token: string }
        | { error: string };

      if (!res.ok) {
        setError("error" in body ? body.error : "Something went wrong");
        return;
      }

      if ("token" in body) {
        setSession(body.user, body.token);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center">
      <div className="bg-bg-surface rounded-xl p-8 w-full max-w-sm shadow-2xl">
        <h1 className="text-2xl font-bold text-white mb-1">Enlazar</h1>

        <div className="flex gap-1 mb-6 bg-bg-base rounded-lg p-1">
          {(["login", "register"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); }}
              className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
                mode === m
                  ? "bg-primary text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            className="w-full bg-bg-base border border-border-subtle rounded-lg px-4 py-3 text-white outline-none focus:border-primary transition-colors"
            placeholder="Username"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <input
            type="password"
            className="w-full bg-bg-base border border-border-subtle rounded-lg px-4 py-3 text-white outline-none focus:border-primary transition-colors"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading || !name.trim() || !password}
            className="w-full bg-primary text-white rounded-lg py-3 font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed capitalize"
          >
            {loading ? "..." : mode}
          </button>
        </form>
      </div>
    </div>
  );
}
