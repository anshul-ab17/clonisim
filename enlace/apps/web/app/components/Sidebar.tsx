"use client";

import { useState } from "react";
import { Globe, Hash, Users, Plus, LogOut, ChevronDown, ChevronRight, Settings } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useFriendStore } from "../store/useFriendStore";
import { useUserStore } from "../store/useUserStore";
import { Avatar } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tooltip } from "./ui/tooltip";
import { CreateChannelModal } from "./CreateChannelModal";
import { EditProfileModal } from "./EditProfileModal";
import type { Room } from "../types";

interface SidebarProps {
  onCreateChannel: (name: string) => Promise<void>;
  onOpenDM: (targetUserId: string, targetUserName?: string) => Promise<Room | null>;
}

export function Sidebar({ onCreateChannel, onOpenDM }: SidebarProps) {
  const [channelsOpen, setChannelsOpen] = useState(true);
  const [dmsOpen, setDmsOpen] = useState(true);

  const { globalRoom, channels, currentRoom, activeSection, setCurrentRoom, setActiveSection } = useChatStore();
  const { friends, pendingIn } = useFriendStore();
  const { user, clearUser } = useUserStore();

  const selectRoom = (room: Room, section: "global" | "channel" | "dm") => {
    setCurrentRoom(room);
    setActiveSection(section);
  };

  const handleFriendDM = async (friendId: string, friendName: string) => {
    const room = await onOpenDM(friendId, friendName);
    if (room) {
      setCurrentRoom(room);
      setActiveSection("dm");
    }
  };

  const activeDMParticipantId = activeSection === "dm" ? currentRoom?.participantId : undefined;

  return (
    <div className="w-60 bg-bg-sidebar flex flex-col shrink-0 border-r border-border-subtle">
      {/* Header */}
      <div className="h-12 flex items-center px-4 border-b border-border-subtle">
        <span className="font-bold text-white text-sm tracking-tight">Meet</span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-0.5">
        {/* Global */}
        {globalRoom && (
          <button
            onClick={() => selectRoom(globalRoom, "global")}
            className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
              activeSection === "global"
                ? "bg-bg-input text-white"
                : "text-gray-400 hover:bg-bg-input hover:text-gray-200"
            }`}
          >
            <Globe size={15} className="shrink-0 text-gray-400" />
            <span className="truncate">global</span>
          </button>
        )}

        {/* Channels */}
        <div className="mt-3">
          <div className="flex items-center justify-between px-2 mb-1 group">
            <button
              onClick={() => setChannelsOpen((v) => !v)}
              className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-300 transition-colors"
            >
              {channelsOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
              Channels
            </button>
            <CreateChannelModal onCreate={onCreateChannel}>
              <button
                title="Create Channel"
                className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-200 transition-colors rounded"
              >
                <Plus size={13} />
              </button>
            </CreateChannelModal>
          </div>

          {channelsOpen && channels.length === 0 && (
            <p className="px-3 py-1 text-xs text-gray-600 italic">No channels yet</p>
          )}

          {channelsOpen &&
            channels.map((room) => {
              const isActive = currentRoom?.chatId === room.chatId && activeSection === "channel";
              return (
                <button
                  key={room.chatId}
                  onClick={() => selectRoom(room, "channel")}
                  className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
                    isActive
                      ? "bg-bg-input text-white"
                      : "text-gray-400 hover:bg-bg-input hover:text-gray-200"
                  }`}
                >
                  <Hash size={14} className={`shrink-0 ${isActive ? "text-gray-300" : "text-gray-500"}`} />
                  <span className="truncate">{room.name}</span>
                </button>
              );
            })}
        </div>

        {/* Direct Messages — driven by friends list */}
        <div className="mt-3">
          <div className="flex items-center justify-between px-2 mb-1">
            <button
              onClick={() => setDmsOpen((v) => !v)}
              className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-300 transition-colors"
            >
              {dmsOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
              Direct Messages
            </button>
          </div>

          {dmsOpen && friends.length === 0 && (
            <p className="px-3 py-1 text-xs text-gray-600 italic">Add friends to message them</p>
          )}

          {dmsOpen &&
            friends.map((friend) => {
              const isActive = activeDMParticipantId === friend.id;
              return (
                <button
                  key={friend.id}
                  onClick={() => handleFriendDM(friend.id, friend.name)}
                  className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
                    isActive
                      ? "bg-bg-input text-white"
                      : "text-gray-400 hover:bg-bg-input hover:text-gray-200"
                  }`}
                >
                  <div className="relative shrink-0">
                    <Avatar name={friend.name} size="sm" />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-bg-sidebar" />
                  </div>
                  <span className={`truncate ${isActive ? "text-white font-medium" : ""}`}>
                    {friend.name}
                  </span>
                </button>
              );
            })}
        </div>

        {/* Friends */}
        <button
          onClick={() => setActiveSection("friends")}
          className={`mt-3 w-full text-left flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
            activeSection === "friends"
              ? "bg-bg-input text-white"
              : "text-gray-400 hover:bg-bg-input hover:text-gray-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <Users size={15} className="shrink-0" />
            <span>Friends</span>
          </div>
          <Badge count={pendingIn.length} />
        </button>
      </div>

      {/* User section */}
      <div className="h-14 px-3 flex items-center justify-between border-t border-border-subtle bg-bg-server">
        {user && (
          <>
            <div className="flex items-center gap-2 min-w-0">
              <div className="relative shrink-0">
                <Avatar name={user.name} size="sm" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-bg-server" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-white text-xs font-semibold truncate leading-tight">{user.name}</span>
                <span className="text-green-400 text-[10px] leading-tight">Online</span>
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              <EditProfileModal>
                <Tooltip label="Edit Profile">
                  <Button variant="ghost" size="icon">
                    <Settings size={15} />
                  </Button>
                </Tooltip>
              </EditProfileModal>
              <Tooltip label="Sign Out">
                <Button variant="ghost" size="icon" onClick={clearUser}>
                  <LogOut size={15} />
                </Button>
              </Tooltip>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
