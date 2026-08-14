(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=`wss://chat.812669.xyz/ws/room/demo`;function t(r){let i=new WebSocket(e);return i.onopen=()=>{console.log(`✅ WebSocket connected`),n(i,{type:`system`,user:`System`,text:`connected!`,time:Date.now()})},i.onmessage=e=>{try{r(JSON.parse(e.data))}catch{r({type:`chat`,user:`Anonymous`,text:e.data,time:Date.now()})}},i.onclose=()=>{console.log(`❌ WebSocket closed, reconnecting in 2s...`),setTimeout(()=>t(r),2e3)},i.onerror=e=>console.error(`WS error:`,e),i}function n(e,t){e.readyState===WebSocket.OPEN&&e.send(JSON.stringify(t))}var r=document.querySelector(`#app`);r.innerHTML=`
  <div class="chat-container">
    <h2>💬 Online Chat</h2>
    <div class="messages" id="messages"></div>
    <form id="form">
      <input id="name" placeholder="Your name" value="Guest" maxlength="20" />
      <input id="input" placeholder="Type a message..." autocomplete="off" required />
      <button type="submit">Send</button>
    </form>
  </div>
`;var i=document.getElementById(`messages`),a=document.getElementById(`form`),o=document.getElementById(`name`),s=document.getElementById(`input`);function c(e){let t=document.createElement(`div`);t.className=`msg ${e.type}`;let n=new Date(e.time).toLocaleTimeString();t.innerHTML=`
    <span class="user">${l(e.user)}</span>
    <span class="time">${n}</span>
    <div class="text">${l(e.text)}</div>
  `,i.appendChild(t),i.scrollTop=i.scrollHeight}function l(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}var u=t(e=>{c(e)});a.addEventListener(`submit`,e=>{e.preventDefault();let t=s.value.trim();t&&(n(u,{type:`chat`,user:o.value.trim()||`Anonymous`,text:t,time:Date.now()}),s.value=``)});