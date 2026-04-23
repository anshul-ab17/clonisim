"use client";

import { create } from "zustand";

interface IncomingCall {
  fromUserId: string;
  fromUserName: string;
  callType: "audio" | "video";
  offer: RTCSessionDescriptionInit;
}

interface ActiveCall {
  userId: string;
  userName: string;
  callType: "audio" | "video";
}

interface CallState {
  incoming: IncomingCall | null;
  active: ActiveCall | null;
  pendingAnswer: RTCSessionDescriptionInit | null;
  pendingCandidates: RTCIceCandidateInit[];
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  muted: boolean;
  cameraOff: boolean;
  setIncoming: (call: IncomingCall) => void;
  setActive: (call: ActiveCall) => void;
  setPendingAnswer: (answer: RTCSessionDescriptionInit) => void;
  addPendingCandidate: (candidate: RTCIceCandidateInit) => void;
  clearPendingAnswer: () => void;
  clearPendingCandidates: () => void;
  setStreams: (local: MediaStream | null, remote: MediaStream | null) => void;
  setMuted: (muted: boolean) => void;
  setCameraOff: (off: boolean) => void;
  clear: () => void;
}

export const useCallStore = create<CallState>()((set) => ({
  incoming: null,
  active: null,
  pendingAnswer: null,
  pendingCandidates: [],
  localStream: null,
  remoteStream: null,
  muted: false,
  cameraOff: false,
  setIncoming: (incoming) => set({ incoming }),
  setActive: (active) => set({ active, incoming: null }),
  setPendingAnswer: (pendingAnswer) => set({ pendingAnswer }),
  addPendingCandidate: (c) => set((s) => ({ pendingCandidates: [...s.pendingCandidates, c] })),
  clearPendingAnswer: () => set({ pendingAnswer: null }),
  clearPendingCandidates: () => set({ pendingCandidates: [] }),
  setStreams: (localStream, remoteStream) => set({ localStream, remoteStream }),
  setMuted: (muted) => set({ muted }),
  setCameraOff: (cameraOff) => set({ cameraOff }),
  clear: () =>
    set({
      incoming: null,
      active: null,
      pendingAnswer: null,
      pendingCandidates: [],
      localStream: null,
      remoteStream: null,
      muted: false,
      cameraOff: false,
    }),
}));
