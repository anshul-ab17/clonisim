"use client";

import { useChatStore } from "../store/useChatStore";

export function ChannelSidebar() {
  const rooms = useChatStore((s) => s.rooms);
  const currentRoom = useChatStore((s) => s.currentRoom);
  const setCurrentRoom = useChatStore((s) => s.setCurrentRoom);

  return (
    <div className="w-60 bg-bg-sidebar flex flex-col shrink-0">
      <div className="h-12 flex items-center px-4 border-b border-border-subtle font-semibold text-white text-sm shadow-sm">
        Enlazar
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <p className="text-xs font-semibold text-gray-500 px-2 py-2 uppercase tracking-wider">
          Channels
        </p>

        {rooms.length === 0 && (
          <p className="text-xs text-gray-600 px-2">No channels yet</p>
        )}

        {rooms.map((room) => (
          <button
            key={room.chatId}
            onClick={() => setCurrentRoom(room)}
            className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
              currentRoom?.chatId === room.chatId
                ? "bg-bg-input text-white"
                : "text-gray-400 hover:bg-bg-input hover:text-gray-200"
            }`}
          >
            <span className="text-gray-500">#</span>
            {room.name}
          </button>
        ))}
      </div>
    </div>
  );
}
