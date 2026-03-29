import React, { useState, useRef } from "react";

interface Props {
  channelName: string;
  onSend: (content: string) => void;
}

export default function MessageInput({ channelName, onSend }: Props) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
    textareaRef.current?.focus();
  };

  return (
    <div style={styles.container}>
      <div style={styles.inputWrapper}>
        <textarea
          ref={textareaRef}
          style={styles.textarea}
          placeholder={`Message #${channelName}`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          maxLength={2000}
        />
        <button
          style={{
            ...styles.sendBtn,
            opacity: value.trim() ? 1 : 0.4,
            cursor: value.trim() ? "pointer" : "default",
          }}
          onClick={submit}
          disabled={!value.trim()}
          title="Send message (Enter)"
        >
          <SendIcon />
        </button>
      </div>
      <p style={styles.hint}>
        <kbd style={styles.kbd}>Enter</kbd> to send · <kbd style={styles.kbd}>Shift+Enter</kbd> for new line
      </p>
    </div>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={18} height={18}>
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: "0 16px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  inputWrapper: {
    display: "flex",
    alignItems: "flex-end",
    gap: 8,
    background: "#2a2a2a",
    borderRadius: 10,
    padding: "10px 14px",
    border: "1px solid #383838",
  },
  textarea: {
    flex: 1,
    background: "none",
    color: "#e8e8e8",
    fontSize: 14,
    lineHeight: 1.5,
    resize: "none",
    maxHeight: 160,
    overflowY: "auto",
  },
  sendBtn: {
    background: "#800020",
    color: "#fff",
    width: 32,
    height: 32,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.15s",
    flexShrink: 0,
  },
  hint: {
    fontSize: 11,
    color: "#555",
    paddingLeft: 4,
  },
  kbd: {
    background: "#333",
    padding: "1px 5px",
    borderRadius: 4,
    fontSize: 11,
  },
};
