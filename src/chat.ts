const WORKER_HOST = "https://api.chat.812669.xyz";
import { WS_URL } from "./config";

export function connectChat(
  onMessage: (msg: ChatMessage) => void
): WebSocket {
  const ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    console.log("✅ WebSocket connected");
    // 连上后发一条加入通知
    send(ws, {
      type: "system",
      user: "System",
      text: "connected!",
      time: Date.now(),
    });
  };

  ws.onmessage = (e) => {
    try {
      const msg: ChatMessage = JSON.parse(e.data);
      onMessage(msg);
    } catch {
      // 如果不是 JSON（比如你后端现在直接 send(text)），包一层
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