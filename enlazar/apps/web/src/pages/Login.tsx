import React, { useState } from "react";
import { api } from "../api/client";
import { useStore } from "../store";

export default function Login() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const setAuth = useStore((s) => s.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    try {
      const { token, user } = await api.login(name.trim());
      setAuth(token, user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <span style={styles.logoText}>Enlazar</span>
          <span style={styles.logoSub}>Connect. Converse. Belong.</span>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label} htmlFor="name">
            Display Name
          </label>
          <input
            id="name"
            style={styles.input}
            type="text"
            placeholder="Enter your name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={32}
            autoFocus
          />

          {error && <p style={styles.error}>{error}</p>}

          <button
            type="submit"
            style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
            disabled={loading || !name.trim()}
          >
            {loading ? "Signing in..." : "Enter Enlazar"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#1c1c1c",
  },
  card: {
    width: 400,
    background: "#242424",
    borderRadius: 14,
    padding: "48px 40px",
    border: "1px solid #333",
    display: "flex",
    flexDirection: "column",
    gap: 32,
  },
  logo: {
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 800,
    color: "#800020",
    letterSpacing: "-1px",
  },
  logoSub: {
    fontSize: 13,
    color: "#a0a0a0",
    letterSpacing: "0.5px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: "#a0a0a0",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
  },
  input: {
    background: "#1c1c1c",
    border: "1px solid #444",
    borderRadius: 8,
    padding: "12px 14px",
    color: "#e8e8e8",
    fontSize: 15,
    transition: "border-color 0.15s",
  },
  error: {
    color: "#ff5555",
    fontSize: 13,
  },
  button: {
    marginTop: 8,
    background: "#800020",
    color: "#fff",
    padding: "13px 0",
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 15,
    transition: "background 0.15s, opacity 0.15s",
    cursor: "pointer",
  },
};
