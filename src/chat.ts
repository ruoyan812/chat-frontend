// src/chat.ts
const WS_URL = "wss://api.chat.812669.xyz/ws/room/demo";

export function connectChat(
  onMessage: (msg: ChatMessage) => void
): WebSocket {
  const ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    console.log("✅ WebSocket connected");
  };

  ws.onmessage = (e) => {
    try {
      const msg: ChatMessage = JSON.parse(e.data);
      onMessage(msg);
    } catch {
      onMessage({
        type: "chat",
        user: "Anonymous",
        text: e.data,
        time: Date.now(),
      });
    }
  };

  ws.onclose = () => {
    console.log("❌ WebSocket closed, reconnecting in 2s...");
    setTimeout(() => connectChat(onMessage), 2000);
  };

  ws.onerror = (e) => console.error("WS error:", e);

  return ws;
}

export function send(ws: WebSocket, msg: ChatMessage) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg));
  }
}

export interface ChatMessage {
  type: "chat" | "system";
  user: string;
  text: string;
  time: number;
}