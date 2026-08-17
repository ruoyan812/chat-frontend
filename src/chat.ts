// src/chat.ts
export interface ChatMessage {
  type: "chat" | "system";
  user: string;
  text: string;
  time: number;
}

function getWsUrl(): string {
  const proto = location.protocol === "https:" ? "wss:" : "ws:";
  // 使用当前域名（chat.812669.xyz）下的 /ws/demo 路径
  return `${proto}//${location.host}/ws/demo`;
}

export function connectChat(
  onMessage: (msg: ChatMessage) => void,
  onOpen?: () => void
): WebSocket {
  let ws: WebSocket;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let manuallyClosed = false;

  function create(): WebSocket {
    const socket = new WebSocket(getWsUrl());
    console.log("WS connecting to", getWsUrl());

    socket.addEventListener("open", () => {
      console.log("WS connected");
      manuallyClosed = false;
      onOpen?.();
    });

    socket.addEventListener("message", (ev) => {
      try {
        const data = JSON.parse(ev.data) as ChatMessage;
        onMessage(data);
      } catch {
        console.warn("bad message", ev.data);
      }
    });

    socket.addEventListener("close", () => {
      console.log("WS closed");
      if (!manuallyClosed) {
        console.log("Reconnecting in 2s...");
        reconnectTimer = setTimeout(() => {
          const nws = create();
          // 替换外层 ws 引用
          Object.assign(ws, nws);
        }, 2000);
      }
    });

    socket.addEventListener("error", (e) => {
      console.error("WS error", e);
    });

    return socket;
  }

  ws = create();

  // 页面卸载时不再重连
  window.addEventListener("beforeunload", () => {
    manuallyClosed = true;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    try { ws.close(); } catch {}
  });

  return ws;
}

// 发送消息（WS 未开时排队等连接）
const pendingQueue: string[] = [];

export function send(ws: WebSocket, msg: ChatMessage) {
  const payload = JSON.stringify(msg);
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(payload);
  } else {
    console.warn("WS not open, queuing message");
    pendingQueue.push(payload);
    // 等连接成功后发送队列
    const onOpen = () => {
      while (pendingQueue.length > 0) {
        const m = pendingQueue.shift()!;
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(m);
        } else {
          pendingQueue.unshift(m);
          break;
        }
      }
      ws.removeEventListener("open", onOpen);
    };
    ws.addEventListener("open", onOpen, { once: true });
  }
}
