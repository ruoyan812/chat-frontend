import { connectChat, send } from "./chat";
import type { ChatMessage } from "./chat";
import { generateUsername } from "./username";
import "./style.css";

// ========== 矩阵雨背景 ==========
const canvas = document.createElement("canvas");
canvas.id = "matrix-canvas";
document.body.prepend(canvas);

const ctx = canvas.getContext("2d")!;
function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
resize();
window.addEventListener("resize", resize);

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?/~`アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
const FONT_SIZE = 14;
let columns = Math.floor(canvas.width / FONT_SIZE);
let drops: number[] = Array(columns).fill(1);

window.addEventListener("resize", () => {
  columns = Math.floor(canvas.width / FONT_SIZE);
  drops = Array(columns).fill(1);
});

function drawMatrix() {
  ctx.fillStyle = "rgba(10, 10, 10, 0.08)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = FONT_SIZE + "px monospace";

  for (let i = 0; i < drops.length; i++) {
    const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
    const x = i * FONT_SIZE;
    const y = drops[i] * FONT_SIZE;
    const alpha = Math.random() > 0.95 ? 1 : 0.7;
    ctx.fillStyle = `rgba(0, 255, 65, ${alpha})`;
    ctx.fillText(ch, x, y);
    if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
    drops[i]++;
  }
}
setInterval(drawMatrix, 50);

// ========== 扫描线 + 暗角覆盖层 ==========
const scanlines = document.createElement("div");
scanlines.className = "scanlines";
document.body.appendChild(scanlines);

const vignette = document.createElement("div");
vignette.className = "vignette";
document.body.appendChild(vignette);

// ========== DOM ==========
const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `
  <div class="chat-container">
    <div class="header">
      <h2>SECURE_CHAT // ROOT</h2>
      <span class="online-badge"><span class="dot"></span><span id="online-num">-</span> ONLINE</span>
    </div>
    <div class="messages" id="messages"></div>
    <form id="form">
      <div class="input-row">
        <input id="name" maxlength="20" />
        <button type="button" id="reroll" title="Reroll identity">[REROLL]</button>
      </div>
      <div class="input-row">
        <input id="input" placeholder="Enter message..." autocomplete="off" required />
        <button type="submit">[SEND]</button>
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

// ========== 用户名 ==========
nameEl.value = generateUsername();
rerollBtn.addEventListener("click", () => { nameEl.value = generateUsername(); });

// ========== 渲染消息 ==========
function appendMessage(msg: ChatMessage) {
  const div = document.createElement("div");
  div.className = `msg ${msg.type}`;
  const time = new Date(msg.time).toLocaleTimeString();
  div.innerHTML = `<span class="user"></span><span class="time">${time}</span><div class="text"></div>`;
  div.querySelector(".user")!.textContent = msg.user;
  div.querySelector(".text")!.textContent = msg.text;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// ========== 连接 ==========
const ws = connectChat(appendMessage, () => {
  send(ws, {
    type: "system",
    user: nameEl.value.trim() || generateUsername(),
    text: `${nameEl.value.trim() || generateUsername()} joined`,
    time: Date.now(),
  });
});

// 离开通知
window.addEventListener("beforeunload", () => {
  send(ws, {
    type: "system",
    user: nameEl.value.trim() || generateUsername(),
    text: `${nameEl.value.trim() || generateUsername()} left`,
    time: Date.now(),
  });
});

// ========== 在线人数轮询 ==========
const API_BASE = "https://api.chat.812669.xyz";
async function fetchOnline() {
  try {
    const r = await fetch(`${API_BASE}/online/demo`);
    const d = await r.json();
    onlineNumEl.textContent = String(d.online ?? "?");
  } catch { onlineNumEl.textContent = "?"; }
}
fetchOnline();
setInterval(fetchOnline, 5000);

// ========== 发送 ==========
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
