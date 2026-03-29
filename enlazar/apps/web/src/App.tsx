import React from "react";
import { useStore } from "./store";
import Login from "./pages/Login";
import Chat from "./pages/Chat";

export default function App() {
  const token = useStore((s) => s.token);
  const currentUser = useStore((s) => s.currentUser);

  if (!token || !currentUser) {
    return <Login />;
  }

  return <Chat />;
}
