// src/chat.ts
export interface ChatMessage {
  type: "chat" | "system";
  user: string;
  text: string;
  time: number;
}

function getWsUrl(): string {
  const proto = location.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${location.host}/ws/demo`;
}

export function connectChat(
  onMessage: (msg: ChatMessage) => void,
  onOpen?: () => void
): WebSocket {
  const ws = new WebSocket(getWsUrl());

  ws.addEventListener("open", () => {
    console.log("WS connected");
    onOpen?.();
  });

  ws.addEventListener("message", (ev) => {
    try {
      const data = JSON.parse(ev.data) as ChatMessage;
      onMessage(data);
    } catch {
      console.warn("bad message", ev.data);
    }
  });

  ws.addEventListener("close", () => {
    console.log("WS closed, reconnecting in 2s...");
    setTimeout(() => {
      const nws = connectChat(onMessage, onOpen);
      // 替换旧 ws 引用
      Object.assign(ws, nws);
    }, 2000);
  });

  ws.addEventListener("error", (e) => {
    console.error("WS error", e);
  });

  return ws;
}

export function send(ws: WebSocket, msg: ChatMessage) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg));
  } else {
    console.warn("WS not open, queuing message");
    ws.addEventListener("open", () => {
      ws.send(JSON.stringify(msg));
    }, { once: true });
  }
}
