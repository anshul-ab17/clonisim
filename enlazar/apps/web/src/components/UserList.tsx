import React from "react";
import { useStore } from "../store";

interface Props {
  chatId: string;
}

export default function UserList({ chatId }: Props) {
  const users = useStore((s) => s.onlineUsers[chatId] ?? []);
  const currentUser = useStore((s) => s.currentUser);

  return (
    <aside style={styles.sidebar}>
      <p style={styles.header}>Online — {users.length}</p>
      <ul style={styles.list}>
        {users.map((u) => {
          const isYou = u.userId === currentUser?.id;
          return (
            <li key={u.userId} style={styles.user}>
              <div
                style={{
                  ...styles.avatar,
                  background: isYou ? "#800020" : "#3a3a5c",
                }}
              >
                {u.name[0]?.toUpperCase()}
              </div>
              <span style={{ ...styles.name, color: isYou ? "#c0003a" : "#e0e0e0" }}>
                {u.name}
                {isYou && <span style={styles.you}> (you)</span>}
              </span>
              <span style={styles.dot} />
            </li>
          );
        })}
        {users.length === 0 && (
          <li style={styles.empty}>Nobody else is here yet</li>
        )}
      </ul>
    </aside>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: 220,
    minWidth: 220,
    background: "#202020",
    borderLeft: "1px solid #2a2a2a",
    padding: "16px 0",
    overflowY: "auto",
  },
  header: {
    fontSize: 11,
    fontWeight: 700,
    color: "#a0a0a0",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    padding: "0 16px 8px",
    userSelect: "none",
  },
  list: {
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    padding: "0 8px",
  },
  user: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "5px 8px",
    borderRadius: 6,
    cursor: "default",
  },
  avatar: {
    width: 28,
    height: 28,
    minWidth: 28,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 700,
    fontSize: 12,
  },
  name: {
    fontSize: 13,
    fontWeight: 500,
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  you: {
    fontWeight: 400,
    color: "#6b6b6b",
    fontSize: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#3ba55c",
    flexShrink: 0,
  },
  empty: {
    padding: "8px 8px",
    fontSize: 12,
    color: "#6b6b6b",
    fontStyle: "italic",
  },
};
