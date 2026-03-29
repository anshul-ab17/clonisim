import React, { useEffect, useRef } from "react";
import { useStore } from "../store";
import MessageItem from "./Message";

interface Props {
  chatId: string;
}

export default function MessageList({ chatId }: Props) {
  const messages = useStore((s) => s.messages[chatId] ?? []);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div style={styles.empty}>
        <p style={styles.emptyIcon}>💬</p>
        <p style={styles.emptyText}>No messages yet. Say hello!</p>
      </div>
    );
  }

  return (
    <div style={styles.list}>
      {messages.map((msg, i) => (
        <MessageItem
          key={msg.id}
          message={msg}
          prevAuthorId={i > 0 ? messages[i - 1]?.authorId : undefined}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  list: {
    flex: 1,
    overflowY: "auto",
    padding: "16px 0 8px",
    display: "flex",
    flexDirection: "column",
  },
  empty: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    color: "#6b6b6b",
  },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 15 },
};
