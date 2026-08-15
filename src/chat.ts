const WS_URL = "wss://api.chat.812669.xyz/ws/room/demo";

export function connectChat(
  onMessage: (msg: ChatMessage) => void,
  onOpen?: () => void
): WebSocket {
  const ws = new WebSocket(WS_URL);
  ws.onopen = () => {
    console.log("✅ WS connected");
    onOpen?.();  // ← 调用外部传入的回调
  };
  ws.onmessage = (e) => {
    try { onMessage(JSON.parse(e.data)); }
    catch { onMessage({ type: "chat", user: "Anonymous", text: e.data, time: Date.now() }); }
  };
  ws.onclose = () => {
    console.log("❌ WS closed, reconnecting...");
    setTimeout(() => connectChat(onMessage, onOpen), 2000);
  };
  ws.onerror = (e) => console.error(e);
  return ws;
}

export function send(ws: WebSocket, msg: ChatMessage) {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg));
}

export interface ChatMessage {
  type: "chat" | "system";
  user: string;
  text: string;
  time: number;
}