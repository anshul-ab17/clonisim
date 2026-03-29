import React from "react";
import { useStore } from "../store";

export default function ServerSidebar() {
  const { logout, currentUser } = useStore();

  const initial = currentUser?.name?.[0]?.toUpperCase() ?? "?";

  return (
    <aside style={styles.sidebar}>
      {/* Brand icon */}
      <div style={styles.brand} title="Enlazar">
        <span style={styles.brandLetter}>E</span>
      </div>

      <div style={styles.divider} />

      {/* Server icons — V1 has one "server" */}
      <div style={styles.serverIcon} title="Enlazar Server">
        <span>💬</span>
      </div>

      <div style={{ flex: 1 }} />

      {/* User avatar / logout */}
      <button
        style={styles.avatar}
        title={`Logged in as ${currentUser?.name ?? ""} — click to logout`}
        onClick={logout}
      >
        {initial}
      </button>
    </aside>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: 72,
    minWidth: 72,
    background: "#161616",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "12px 0",
    gap: 8,
    borderRight: "1px solid #2a2a2a",
  },
  brand: {
    width: 48,
    height: 48,
    background: "#800020",
    borderRadius: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "border-radius 0.2s",
    marginBottom: 4,
  },
  brandLetter: {
    color: "#fff",
    fontWeight: 900,
    fontSize: 22,
  },
  divider: {
    width: 32,
    height: 2,
    background: "#2a2a2a",
    borderRadius: 1,
    margin: "4px 0",
  },
  serverIcon: {
    width: 48,
    height: 48,
    background: "#242424",
    borderRadius: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    cursor: "pointer",
    transition: "border-radius 0.2s, background 0.2s",
  },
  avatar: {
    width: 40,
    height: 40,
    background: "#800020",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 700,
    fontSize: 16,
    cursor: "pointer",
    border: "none",
    marginTop: 4,
  },
};
