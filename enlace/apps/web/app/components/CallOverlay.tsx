"use client";

import { useEffect, useRef } from "react";
import { Phone, PhoneOff, Video, Mic, MicOff, Camera, CameraOff, PhoneCall } from "lucide-react";
import { useCallStore } from "../store/useCallStore";
import { Avatar } from "./ui/avatar";
import { Button } from "./ui/button";
import { Tooltip } from "./ui/tooltip";

interface CallOverlayProps {
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
  onAccept: () => void;
  onReject: () => void;
  onEnd: () => void;
}

export function CallOverlay({ localVideoRef, remoteVideoRef, onAccept, onReject, onEnd }: CallOverlayProps) {
  const { incoming, active, muted, cameraOff, setMuted, setCameraOff } = useCallStore();

  if (!incoming && !active) return null;

  // Incoming call UI
  if (incoming && !active) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center">
        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-8 flex flex-col items-center gap-6 w-80 shadow-2xl">
          <Avatar name={incoming.fromUserName} size="lg" />
          <div className="text-center">
            <p className="text-white font-semibold text-lg">{incoming.fromUserName}</p>
            <p className="text-gray-400 text-sm mt-1">
              Incoming {incoming.callType === "video" ? "video" : "voice"} call...
            </p>
          </div>
          <div className="flex gap-3">
            <Tooltip label="Reject">
              <Button variant="danger" size="icon" className="w-12 h-12 rounded-full" onClick={onReject}>
                <PhoneOff size={20} />
              </Button>
            </Tooltip>
            {incoming.callType === "video" && (
              <Tooltip label="Accept Video">
                <Button variant="success" size="icon" className="w-12 h-12 rounded-full" onClick={onAccept}>
                  <Video size={20} />
                </Button>
              </Tooltip>
            )}
            <Tooltip label={incoming.callType === "audio" ? "Accept" : "Accept Audio"}>
              <Button variant="success" size="icon" className="w-12 h-12 rounded-full" onClick={onAccept}>
                <Phone size={20} />
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>
    );
  }

  // Active call UI
  return (
    <div className="fixed inset-0 z-50 bg-bg-server flex flex-col">
      {/* Remote video / audio placeholder */}
      <div className="flex-1 relative flex items-center justify-center bg-bg-base">
        {active?.callType === "video" ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-4">
            <Avatar name={active?.userName ?? ""} size="lg" />
            <p className="text-white font-semibold">{active?.userName}</p>
            <p className="text-gray-400 text-sm animate-pulse">Connected</p>
          </div>
        )}

        {/* Call duration label */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/40 px-3 py-1.5 rounded-full flex items-center gap-2">
          <PhoneCall size={13} className="text-green-400" />
          <span className="text-white text-xs font-medium">{active?.userName}</span>
        </div>

        {/* Local video (picture-in-picture) */}
        {active?.callType === "video" && (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="absolute bottom-4 right-4 w-36 h-24 object-cover rounded-xl border-2 border-border-subtle shadow-lg"
          />
        )}
      </div>

      {/* Controls */}
      <div className="h-24 flex items-center justify-center gap-4 border-t border-border-subtle bg-bg-surface">
        <Tooltip label={muted ? "Unmute" : "Mute"}>
          <Button
            variant={muted ? "danger" : "secondary"}
            size="icon"
            className="w-12 h-12 rounded-full"
            onClick={() => setMuted(!muted)}
          >
            {muted ? <MicOff size={20} /> : <Mic size={20} />}
          </Button>
        </Tooltip>

        {active?.callType === "video" && (
          <Tooltip label={cameraOff ? "Turn Camera On" : "Turn Camera Off"}>
            <Button
              variant={cameraOff ? "danger" : "secondary"}
              size="icon"
              className="w-12 h-12 rounded-full"
              onClick={() => setCameraOff(!cameraOff)}
            >
              {cameraOff ? <CameraOff size={20} /> : <Camera size={20} />}
            </Button>
          </Tooltip>
        )}

        <Tooltip label="End Call">
          <Button variant="danger" size="icon" className="w-14 h-14 rounded-full" onClick={onEnd}>
            <PhoneOff size={22} />
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}
