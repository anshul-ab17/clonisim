import React from "react";
import ServerSidebar from "../components/ServerSidebar";
import ChannelSidebar from "../components/ChannelSidebar";
import ChatArea from "../components/ChatArea";
import { useWebSocket } from "../hooks/useWebSocket";

export default function Chat() {
  const { joinRoom, sendMessage } = useWebSocket();

  return (
    <div style={styles.layout}>
      <ServerSidebar />
      <ChannelSidebar
        onJoinRoom={joinRoom}
        onCreateRoom={joinRoom}
      />
      <ChatArea sendMessage={sendMessage} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  layout: {
    height: "100%",
    display: "flex",
    flexDirection: "row",
    overflow: "hidden",
  },
};
