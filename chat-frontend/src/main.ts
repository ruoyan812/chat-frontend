import { connectChat, send } from "./chat";
import type { ChatMessage } from "./chat";
import { generateUsername } from "./username";
import "./style.css";

// ========== DOM ==========
const app = document.querySelector<HTMLDivElement>("#app");
if (!app) {
  document.body.innerHTML = '<p style="color:red;font-family:monospace">Error: #app not found</p>';
  throw new Error("#app element missing in index.html");
}

app.innerHTML = `
  <div class="chat-container">
    <div class="header">
      <h2>SECURE_CHAT // ROOT</h2>
      <div class="header-right">
        <span class="online-badge"><span class="dot"></span><span id="online-num">-</span> ONLINE</span>
        <a href="https://api.chat.812669.xyz/admin" rel="noopener noreferrer" class="home-btn" title="管理后台">⚙️ADMIN</a>
        <a href="https://page.roooooyan.work" rel="noopener noreferrer" class="home-btn" title="返回主页">🏠HOME</a>
      </div>
    </div>
    <div class="messages" id="messages"></div>
    <form id="form">
      <div class="input-row">
        <input id="name" maxlength="20" />
        <button type="button" id="reroll">🎲</button>
      </div>
      <div class="input-row">
        <input id="input" placeholder="Type a message..." autocomplete="off" required />
        <button type="submit">Send</button>
      </div>
    </form>
  </div>
`;

const messagesEl = document.getElementById("messages") as HTMLDivElement;
const formEl = document.getElementById("form") as HTMLFormElement;
const nameEl = document.getElementById("name") as HTMLInputElement;
const inputEl = document.getElementById("input") as HTMLInputElement;
const rerollBtn = document.getElementById("reroll") as HTMLButtonElement;
const onlineNumEl = document.getElementById("online-num") as HTMLSpanElement;

// ========== 矩阵雨 ==========
try {
  const canvas = document.createElement("canvas");
  canvas.id = "matrix";
  document.body.prepend(canvas);
  const ctx = canvas.getContext("2d");
  if (ctx) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const chars = "01アイウエオカキクケコサシスセソタチツテト0123456789ABCDEF";
    const fontSize = 14;
    const cols = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(cols).fill(1);
    setInterval(() => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#00ff41";
      ctx.font = fontSize + "px monospace";
      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    }, 50);
    window.addEventListener("resize", () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  }
} catch (e) {
  console.error("Matrix rain error:", e);
}

// ========== 扫描线 + 暗角 ==========
try {
  const scanline = document.createElement("div");
  scanline.className = "scanline";
  document.body.appendChild(scanline);
  const vignette = document.createElement("div");
  vignette.className = "vignette";
  document.body.appendChild(vignette);
} catch (e) {
  console.error("Overlay error:", e);
}

// ========== 用户名 ==========
const STORAGE_KEY = "chat_username";
try {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    nameEl.value = saved;
  } else {
    const newName = generateUsername();
    localStorage.setItem(STORAGE_KEY, newName);
    nameEl.value = newName;
  }
} catch (e) {
  nameEl.value = generateUsername();
}

rerollBtn.addEventListener("click", () => {
  try {
    const newName = generateUsername();
    localStorage.setItem(STORAGE_KEY, newName);
    nameEl.value = newName;
  } catch {
    nameEl.value = generateUsername();
  }
});

// ========== API ==========
const API_BASE = "https://api.chat.812669.xyz";

// ========== 渲染消息 ==========
function appendMessage(msg: ChatMessage, skipScroll = false) {
  // 跳过 joined 消息（后端会自动广播，但前端不渲染 join/leave）
  if (msg.type === "system" && (msg.text.includes("joined") || msg.text.includes("left"))) {
    return;
  }

  const div = document.createElement("div");
  div.className = `msg ${msg.type}`;
  const time = new Date(msg.time).toLocaleTimeString();
  div.innerHTML = `<span class="user"></span><span class="time">${time}</span><div class="text"></div>`;
  div.querySelector(".user")!.textContent = msg.user;
  div.querySelector(".text")!.textContent = msg.text;
  messagesEl.appendChild(div);
  if (!skipScroll) messagesEl.scrollTop = messagesEl.scrollHeight;
}

// ========== WebSocket（后端管 join，前端只发聊天）==========
const ws = connectChat(appendMessage);

// ========== 在线人数 ==========
async function fetchOnline() {
  try {
    const r = await fetch(`${API_BASE}/online/demo`);
    const d = await r.json();
    onlineNumEl.textContent = String(d.online ?? "?");
  } catch {
    onlineNumEl.textContent = "?";
  }
}
fetchOnline();
setInterval(fetchOnline, 5000);

// ========== 历史消息 ==========
async function loadHistory() {
  try {
    const res = await fetch(`${API_BASE}/history/demo`);
    const data = await res.json();
    for (const msg of data.messages ?? []) {
      appendMessage(msg, true);
    }
    messagesEl.scrollTop = messagesEl.scrollHeight;
  } catch (e) {
    console.error("Failed to load history:", e);
  }
}
loadHistory();

// ========== 发送消息 ==========
formEl.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = inputEl.value.trim();
  if (!text) return;
  const msg: ChatMessage = {
    type: "chat",
    user: nameEl.value.trim() || "Anonymous",
    text,
    time: Date.now(),
  };
  send(ws, msg);
  // 不本地 append，等 WS 回传统一渲染
  inputEl.value = "";
});
