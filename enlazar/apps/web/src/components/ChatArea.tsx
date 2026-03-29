import React from "react";
import { useStore } from "../store";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import UserList from "./UserList";

interface Props {
  sendMessage: (chatId: string, content: string) => void;
}

export default function ChatArea({ sendMessage }: Props) {
  const activeRoom = useStore((s) => s.activeRoom);

  if (!activeRoom) {
    return (
      <div style={styles.empty}>
        <p style={styles.emptyIcon}>🔗</p>
        <p style={styles.emptyTitle}>Welcome to Enlazar</p>
        <p style={styles.emptyHint}>Select a channel to start connecting</p>
      </div>
    );
  }

  const handleSend = (content: string) => {
    sendMessage(activeRoom.id, content);
  };

  return (
    <div style={styles.wrapper}>
      {/* Chat column */}
      <div style={styles.chat}>
        {/* Channel header */}
        <header style={styles.header}>
          <span style={styles.hash}>#</span>
          <span style={styles.channelName}>{activeRoom.name}</span>
        </header>

        <MessageList chatId={activeRoom.id} />
        <MessageInput channelName={activeRoom.name} onSend={handleSend} />
      </div>

      {/* Online users panel */}
      <UserList chatId={activeRoom.id} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    flex: 1,
    display: "flex",
    overflow: "hidden",
  },
  chat: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    background: "#1c1c1c",
  },
  header: {
    padding: "14px 20px",
    borderBottom: "1px solid #2a2a2a",
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "#1e1e1e",
    flexShrink: 0,
  },
  hash: {
    color: "#6b6b6b",
    fontSize: 20,
    fontWeight: 700,
    lineHeight: 1,
  },
  channelName: {
    fontWeight: 700,
    fontSize: 16,
    color: "#e8e8e8",
  },
  empty: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    background: "#1c1c1c",
    color: "#6b6b6b",
  },
  emptyIcon: { fontSize: 52 },
  emptyTitle: { fontSize: 20, fontWeight: 700, color: "#a0a0a0" },
  emptyHint: { fontSize: 14 },
};
