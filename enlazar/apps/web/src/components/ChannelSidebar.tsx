import React, { useEffect, useState } from "react";
import { useStore } from "../store";
import { api } from "../api/client";
import { ChatRoom } from "@enlazar/shared";

interface Props {
  onJoinRoom: (chatId: string) => void;
  onCreateRoom: (name: string) => void;
}

export default function ChannelSidebar({ onJoinRoom, onCreateRoom }: Props) {
  const { rooms, activeRoom, setRooms, setActiveRoom, token } = useStore();
  const [creating, setCreating] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");

  useEffect(() => {
    if (!token) return;
    api
      .graphql<{ chats: ChatRoom[] }>(
        `query { chats { id name } }`,
        {},
        token
      )
      .then(({ chats }) => setRooms(chats))
      .catch(console.error);
  }, [token, setRooms]);

  const handleSelect = (room: ChatRoom) => {
    if (activeRoom?.id === room.id) return;
    setActiveRoom(room);
    onJoinRoom(room.id);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim() || !token) return;
    try {
      const { room } = await api.createRoom(newRoomName.trim(), token);
      onCreateRoom(room.id);
      setNewRoomName("");
      setCreating(false);
    } catch (err) {
      console.error("[channel] Create room error:", err);
    }
  };

  return (
    <aside style={styles.sidebar}>
      <div style={styles.header}>
        <span style={styles.serverName}>Enlazar</span>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <span>Text Channels</span>
          <button style={styles.addBtn} onClick={() => setCreating((v) => !v)} title="Create channel">
            +
          </button>
        </div>

        {creating && (
          <form onSubmit={handleCreate} style={styles.createForm}>
            <input
              style={styles.createInput}
              placeholder="channel-name"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              autoFocus
            />
          </form>
        )}

        <ul style={styles.channelList}>
          {rooms.map((room) => (
            <li
              key={room.id}
              style={{
                ...styles.channel,
                ...(activeRoom?.id === room.id ? styles.channelActive : {}),
              }}
              onClick={() => handleSelect(room)}
            >
              <span style={styles.hashIcon}>#</span>
              <span style={styles.channelName}>{room.name}</span>
            </li>
          ))}
          {rooms.length === 0 && (
            <li style={styles.emptyHint}>No channels yet. Create one above.</li>
          )}
        </ul>
      </div>
    </aside>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: 240,
    minWidth: 240,
    background: "#202020",
    display: "flex",
    flexDirection: "column",
    borderRight: "1px solid #2a2a2a",
    overflow: "hidden",
  },
  header: {
    padding: "16px 16px",
    borderBottom: "1px solid #2a2a2a",
    fontWeight: 700,
    fontSize: 15,
    color: "#e8e8e8",
  },
  serverName: {},
  section: {
    flex: 1,
    overflowY: "auto",
    padding: "8px 0",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "6px 16px",
    fontSize: 11,
    fontWeight: 700,
    color: "#a0a0a0",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    userSelect: "none",
  },
  addBtn: {
    background: "none",
    color: "#a0a0a0",
    fontSize: 18,
    lineHeight: 1,
    padding: "0 2px",
    borderRadius: 4,
    transition: "color 0.15s",
    cursor: "pointer",
  },
  createForm: {
    padding: "4px 12px 8px",
  },
  createInput: {
    width: "100%",
    background: "#1c1c1c",
    border: "1px solid #444",
    borderRadius: 6,
    padding: "7px 10px",
    color: "#e8e8e8",
    fontSize: 14,
  },
  channelList: {
    listStyle: "none",
    padding: "0 8px",
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  channel: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 8px",
    borderRadius: 6,
    cursor: "pointer",
    color: "#a0a0a0",
    transition: "background 0.12s, color 0.12s",
  },
  channelActive: {
    background: "#800020",
    color: "#fff",
  },
  hashIcon: {
    fontSize: 16,
    opacity: 0.7,
  },
  channelName: {
    fontSize: 14,
    fontWeight: 500,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  emptyHint: {
    padding: "8px 8px",
    fontSize: 12,
    color: "#6b6b6b",
    fontStyle: "italic",
  },
};
