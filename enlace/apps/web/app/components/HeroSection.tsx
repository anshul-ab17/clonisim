"use client";

import { MessageSquare, Video, Users, Zap } from "lucide-react";
import { AuthModal } from "./AuthModal";
import { Button } from "./ui/button";

const features = [
  { icon: MessageSquare, label: "Channels", desc: "Organized topic-based chat rooms" },
  { icon: Users, label: "Friends", desc: "Add friends, send requests" },
  { icon: Video, label: "Video Calls", desc: "HD peer-to-peer calling" },
  { icon: Zap, label: "Real-time", desc: "Instant WebSocket messaging" },
];

export function HeroSection() {
  return (
    <div className="min-h-screen bg-bg-base flex flex-col select-none">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-border-subtle">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <MessageSquare size={14} className="text-white" />
          </div>
          <span className="text-white font-bold tracking-tight">Meet</span>
        </div>
        <div className="flex gap-2">
          <AuthModal defaultMode="signup">
            <Button variant="ghost" size="sm">Sign In</Button>
          </AuthModal>
          <AuthModal defaultMode="signin">
            <Button size="sm">Sign Up</Button>
          </AuthModal>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-6">
        <div className="inline-flex items-center gap-2 bg-bg-surface border border-border-subtle rounded-full px-3 py-1 text-xs text-gray-400">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          WebSocket · WebRTC · Neo4j
        </div>

        <div className="flex flex-col gap-3">
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-none">
            Chat, call,
            <br />
            <span className="text-primary">connect.</span>
          </h1>
          <p className="text-gray-500 text-base md:text-lg max-w-md mx-auto leading-relaxed">
            Channels, direct messages, friend lists, and peer-to-peer HD calls — all in one place.
          </p>
        </div>

        <div className="flex gap-3">
          <AuthModal defaultMode="signin">
            <Button size="lg" className="px-7 font-semibold">
              Get started free
            </Button>
          </AuthModal>
          <AuthModal defaultMode="signup">
            <Button size="lg" variant="outline" className="px-7">
              Sign in
            </Button>
          </AuthModal>
        </div>
      </div>

      {/* Feature strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px border-t border-border-subtle bg-border-subtle">
        {features.map(({ icon: Icon, label, desc }) => (
          <div key={label} className="bg-bg-base px-6 py-6 flex flex-col gap-1.5">
            <Icon size={18} className="text-primary mb-0.5" />
            <p className="text-white font-semibold text-sm">{label}</p>
            <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
