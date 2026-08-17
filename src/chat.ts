const WS_URL = "wss://api.chat.812669.xyz/ws/room/demo";

export function connectChat(
  onMessage: (msg: ChatMessage) => void,
  onOpen?: () => void
): WebSocket {
  const ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    console.log("✅ WS connected");
    onOpen?.(); // 调用可选的加入通知回调
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
    console.log("❌ WS closed, reconnecting in 2s...");
    setTimeout(() => connectChat(onMessage, onOpen), 2000);
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