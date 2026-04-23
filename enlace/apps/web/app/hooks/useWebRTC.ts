"use client";

import { useEffect, useRef, useCallback } from "react";
import { useCallStore } from "../store/useCallStore";

const ICE_SERVERS = [{ urls: "stun:stun.l.google.com:19302" }];

export function useWebRTC(send: (data: object) => void) {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const {
    incoming,
    active,
    pendingAnswer,
    pendingCandidates,
    setActive,
    setStreams,
    clear,
    clearPendingAnswer,
    clearPendingCandidates,
    muted,
    cameraOff,
  } = useCallStore();

  const closePC = useCallback(() => {
    const pc = pcRef.current;
    if (!pc) return;
    pc.getSenders().forEach((s) => s.track?.stop());
    pc.close();
    pcRef.current = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  }, []);

  const createPC = useCallback(
    (targetUserId: string) => {
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      pcRef.current = pc;

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          send({ type: "ice-candidate", targetUserId, candidate: e.candidate.toJSON() });
        }
      };

      pc.ontrack = (e) => {
        const stream = e.streams[0];
        if (remoteVideoRef.current && stream) {
          remoteVideoRef.current.srcObject = stream;
        }
        setStreams(null, stream ?? null);
      };

      return pc;
    },
    [send, setStreams]
  );

  const getMedia = useCallback(async (callType: "audio" | "video") => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: callType === "video",
    });
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    setStreams(stream, null);
    return stream;
  }, [setStreams]);

  const startCall = useCallback(
    async (targetUserId: string, targetUserName: string, callType: "audio" | "video") => {
      const stream = await getMedia(callType);
      const pc = createPC(targetUserId);
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      send({ type: "call-offer", targetUserId, callType, offer });
      setActive({ userId: targetUserId, userName: targetUserName, callType });
    },
    [getMedia, createPC, send, setActive]
  );

  const acceptCall = useCallback(async () => {
    if (!incoming) return;
    const stream = await getMedia(incoming.callType);
    const pc = createPC(incoming.fromUserId);
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));
    await pc.setRemoteDescription(new RTCSessionDescription(incoming.offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    send({ type: "call-answer", targetUserId: incoming.fromUserId, answer });
    setActive({ userId: incoming.fromUserId, userName: incoming.fromUserName, callType: incoming.callType });
  }, [incoming, getMedia, createPC, send, setActive]);

  const rejectCall = useCallback(() => {
    if (!incoming) return;
    send({ type: "call-reject", targetUserId: incoming.fromUserId });
    clear();
  }, [incoming, send, clear]);

  const endCall = useCallback(() => {
    if (active) send({ type: "call-end", targetUserId: active.userId });
    closePC();
    clear();
  }, [active, send, closePC, clear]);

  // Apply mute/camera changes to tracks
  useEffect(() => {
    if (!pcRef.current) return;
    pcRef.current.getSenders().forEach((sender) => {
      if (!sender.track) return;
      if (sender.track.kind === "audio") sender.track.enabled = !muted;
      if (sender.track.kind === "video") sender.track.enabled = !cameraOff;
    });
  }, [muted, cameraOff]);

  // Handle incoming answer
  useEffect(() => {
    if (!pendingAnswer || !pcRef.current) return;
    pcRef.current
      .setRemoteDescription(new RTCSessionDescription(pendingAnswer))
      .then(clearPendingAnswer)
      .catch(console.error);
  }, [pendingAnswer]);

  // Handle pending ICE candidates
  useEffect(() => {
    if (!pendingCandidates.length || !pcRef.current) return;
    const pc = pcRef.current;
    Promise.all(
      pendingCandidates.map((c) => pc.addIceCandidate(new RTCIceCandidate(c)).catch(console.error))
    ).then(clearPendingCandidates);
  }, [pendingCandidates.length]);

  useEffect(() => () => closePC(), []);

  return { localVideoRef, remoteVideoRef, startCall, acceptCall, rejectCall, endCall };
}
