import { connectChat, send } from "./chat";
import type { ChatMessage } from "./chat";
import { generateUsername } from "./username";
import "./style.css";

const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `
  <div class="chat-container">
    <div class="header">
      <h2>SECURE_CHAT // ROOT</h2>
      <div class="header-right">
        <span class="online-badge"><span class="dot"></span><span id="online-num">-</span> ONLINE</span>
        <a href="https://page.roooooyan.work" target="_blank" rel="noopener noreferrer" class="home-btn" title="返回主页">⌂ HOME</a>
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

nameEl.value = generateUsername();
rerollBtn.addEventListener("click", () => { nameEl.value = generateUsername(); });

const API_BASE = "https://api.chat.812669.xyz";

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

const ws = connectChat(appendMessage, () => {
  send(ws, { type: "system", user: nameEl.value.trim() || generateUsername(), text: `${nameEl.value.trim() || generateUsername()} joined`, time: Date.now() });
});

window.addEventListener("beforeunload", () => {
  send(ws, { type: "system", user: nameEl.value.trim() || generateUsername(), text: `${nameEl.value.trim() || generateUsername()} left`, time: Date.now() });
});

async function fetchOnline() {
  try {
    const r = await fetch(`${API_BASE}/online/demo`);
    const d = await r.json();
    onlineNumEl.textContent = String(d.online ?? "?");
  } catch { onlineNumEl.textContent = "?"; }
}
fetchOnline();
setInterval(fetchOnline, 5000);

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

formEl.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = inputEl.value.trim();
  if (!text) return;
  const msg: ChatMessage = { type: "chat", user: nameEl.value.trim() || generateUsername(), text, time: Date.now() };
  send(ws, msg);
  appendMessage(msg);
  inputEl.value = "";
});