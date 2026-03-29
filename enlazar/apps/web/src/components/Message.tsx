import React from "react";
import { Message as MsgType } from "@enlazar/shared";
import { useStore } from "../store";

interface Props {
  message: MsgType;
  prevAuthorId?: string;
}

export default function Message({ message, prevAuthorId }: Props) {
  const currentUser = useStore((s) => s.currentUser);
  const isOwn = message.authorId === currentUser?.id;
  const isContinued = prevAuthorId === message.authorId;

  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const initial = message.authorName[0]?.toUpperCase() ?? "?";

  return (
    <div
      style={{
        ...styles.container,
        marginTop: isContinued ? 2 : 16,
      }}
    >
      {!isContinued ? (
        <div
          style={{
            ...styles.avatar,
            background: isOwn ? "#800020" : "#3a3a5c",
          }}
        >
          {initial}
        </div>
      ) : (
        <div style={styles.avatarPlaceholder} />
      )}

      <div style={styles.body}>
        {!isContinued && (
          <div style={styles.meta}>
            <span
              style={{
                ...styles.authorName,
                color: isOwn ? "#c0003a" : "#e8e8e8",
              }}
            >
              {message.authorName}
            </span>
            <span style={styles.time}>{time}</span>
          </div>
        )}
        <p style={styles.content}>{message.content}</p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    gap: 12,
    padding: "0 16px",
  },
  avatar: {
    width: 36,
    height: 36,
    minWidth: 36,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 700,
    fontSize: 14,
    marginTop: 2,
  },
  avatarPlaceholder: {
    width: 36,
    minWidth: 36,
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  meta: {
    display: "flex",
    alignItems: "baseline",
    gap: 8,
    marginBottom: 2,
  },
  authorName: {
    fontWeight: 600,
    fontSize: 14,
  },
  time: {
    fontSize: 11,
    color: "#6b6b6b",
  },
  content: {
    color: "#e0e0e0",
    fontSize: 14,
    lineHeight: 1.5,
    wordBreak: "break-word",
  },
};
