import { connectChat, send } from "./chat";
import type { ChatMessage } from "./chat";
import { generateUsername } from "./username";
import "./style.css";

// ---------- DOM ----------
const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `
  <div class="chat-container">
    <div class="header">
      <h2>💬 Online Chat</h2>
      <span class="online-badge" id="online-count">
        <span class="dot"></span><span id="online-num">-</span> online
      </span>
    </div>
    <div class="messages" id="messages"></div>
    <form id="form">
      <div class="input-row">
        <input id="name" placeholder="Your name" maxlength="20" />
        <button type="button" id="reroll" title="Reroll username">🎲</button>
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

// ---------- 用户名 ----------
nameEl.value = generateUsername();

rerollBtn.addEventListener("click", () => {
  nameEl.value = generateUsername();
});

// ---------- API 基础地址 ----------
const API_BASE = "https://api.chat.812669.xyz";

// ---------- 渲染消息 ----------
function appendMessage(msg: ChatMessage, skipScroll = false) {
  const div = document.createElement("div");
  div.className = `msg ${msg.type}`;

  const time = new Date(msg.time).toLocaleTimeString();
  div.innerHTML = `
    <span class="user">${escapeHtml(msg.user)}</span>
    <span class="time">${time}</span>
    <div class="text">${escapeHtml(msg.text)}</div>
  `;
  messagesEl.appendChild(div);
  if (!skipScroll) {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ---------- 连接 ----------
const ws = connectChat((msg) => {
  appendMessage(msg);
});

// ---------- 在线人数轮询 ----------
async function fetchOnlineCount() {
  try {
    const res = await fetch(`${API_BASE}/online/demo`);
    const data = await res.json();
    onlineNumEl.textContent = String(data.online ?? "-");
  } catch {
    onlineNumEl.textContent = "?";
  }
}
fetchOnlineCount();
setInterval(fetchOnlineCount, 5000);

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

// ---------- 发送 ----------
formEl.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = inputEl.value.trim();
  if (!text) return;

  send(ws, {
    type: "chat",
    user: nameEl.value.trim() || generateUsername(),
    text,
    time: Date.now(),
  });
  inputEl.value = "";
});