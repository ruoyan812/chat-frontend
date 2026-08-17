import { connectChat, send } from "./chat";
import type { ChatMessage } from "./chat";
import { generateUsername } from "./username";
import "./style.css";

// ---------- DOM ----------
const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `
  <div class="chat-container">
    <div class="header">
      <h2>SECURE_CHAT // ROOT</h2>
      <link rel="icon" href="https://chat.812669.xyz/favicon.svg">
      <div class="header-right">
        <span class="online-badge"><span class="dot"></span><span id="online-num">-</span> ONLINE</span>
        <a href="https://api.chat.812669.xyz/admin" rel="noopener noreferrer" class="home-btn" title="管理后台">⚙️ ADMIN</a>
        <a href="https://page.roooooyan.work" rel="noopener noreferrer" class="home-btn" title="返回主页">🏠 HOME</a>
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

// ---------- 矩阵雨背景 ----------
const canvas = document.createElement("canvas");
canvas.id = "matrix";
document.body.prepend(canvas);
const ctx = canvas.getContext("2d")!;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const chars = "01アイウエオカキクケコサシスセソタチツテト0123456789ABCDEF";
const fontSize = 14;
const cols = Math.floor(canvas.width / fontSize);
const drops: number[] = Array(cols).fill(1);
function draw() {
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
}
setInterval(draw, 50);
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// ---------- 扫描线 + 暗角 ----------
const scanline = document.createElement("div");
scanline.className = "scanline";
document.body.appendChild(scanline);
const vignette = document.createElement("div");
vignette.className = "vignette";
document.body.appendChild(vignette);

// ---------- 用户名（localStorage 持久化） ----------
const STORAGE_KEY = "chat_username";
const saved = localStorage.getItem(STORAGE_KEY);
if (saved) {
  nameEl.value = saved;
} else {
  const newName = generateUsername();
  localStorage.setItem(STORAGE_KEY, newName);
  nameEl.value = newName;
}

rerollBtn.addEventListener("click", () => {
  const newName = generateUsername();
  localStorage.setItem(STORAGE_KEY, newName);
  nameEl.value = newName;
});

// ---------- API 基础地址 ----------
const API_BASE = "https://api.chat.roooooyan.work";

// ---------- 渲染消息 ----------
function appendMessage(msg: ChatMessage, skipScroll = false) {
  const div = document.createElement("div");
  div.className = `msg ${msg.type}`;
  const time = new Date(msg.time).toLocaleTimeString();
  div.innerHTML = `<span class="user"></span><span class="time">${time}</span><div class="text"></div>`;
  div.querySelector(".user")!.textContent = msg.user;
  div.querySelector(".text")!.textContent = msg.text;
  messagesEl.appendChild(div);
  if (!skipScroll) messagesEl.scrollTop = messagesEl.scrollHeight;
}

// ---------- 连接 + 加入/离开（刷新不发通知） ----------
const navEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
const isRefresh = navEntry?.type === "reload";

const ws = connectChat(appendMessage, () => {
  if (!isRefresh) {
    send(ws, {
      type: "system",
      user: "System",
      text: `${nameEl.value.trim() || generateUsername()} joined`,
      time: Date.now(),
    });
  }
});

window.addEventListener("beforeunload", () => {
  if (!isRefresh) {
    send(ws, {
      type: "system",
      user: "System",
      text: `${nameEl.value.trim() || generateUsername()} left`,
      time: Date.now(),
    });
  }
});

// ---------- 在线人数轮询 ----------
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

// ---------- 加载历史消息 ----------
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

// ---------- 发送消息 ----------
formEl.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = inputEl.value.trim();
  if (!text) return;
  const msg: ChatMessage = {
    type: "chat",
    user: nameEl.value.trim() || generateUsername(),
    text,
    time: Date.now(),
  };
  send(ws, msg);
  appendMessage(msg);
  inputEl.value = "";
});