import { connectChat, send, type ChatMessage } from "./chat";
import "./style.css";

// ---------- DOM ----------
const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `
  <div class="chat-container">
    <h2>💬 Online Chat</h2>
    <div class="messages" id="messages"></div>
    <form id="form">
      <input id="name" placeholder="Your name" value="Guest" maxlength="20" />
      <input id="input" placeholder="Type a message..." autocomplete="off" required />
      <button type="submit">Send</button>
    </form>
  </div>
`;

const messagesEl = document.getElementById("messages") as HTMLDivElement;
const formEl = document.getElementById("form") as HTMLFormElement;
const nameEl = document.getElementById("name") as HTMLInputElement;
const inputEl = document.getElementById("input") as HTMLInputElement;

// ---------- 渲染消息 ----------
function appendMessage(msg: ChatMessage) {
  const div = document.createElement("div");
  div.className = `msg ${msg.type}`;

  const time = new Date(msg.time).toLocaleTimeString();
  div.innerHTML = `
    <span class="user">${escapeHtml(msg.user)}</span>
    <span class="time">${time}</span>
    <div class="text">${escapeHtml(msg.text)}</div>
  `;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

// ---------- 连接 ----------
const ws = connectChat((msg) => {
  appendMessage(msg);
});

// ---------- 发送 ----------
formEl.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = inputEl.value.trim();
  if (!text) return;

  send(ws, {
    type: "chat",
    user: nameEl.value.trim() || "Anonymous",
    text,
    time: Date.now(),
  });
  inputEl.value = "";
});