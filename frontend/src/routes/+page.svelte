<script>
  import { onMount, tick } from "svelte";

  let messages = [];
  let input = "";
  let loading = false;
  let sessionId = null;
  let chatBox;
  let error = null;

  const BASE_URL = "https://spur-ai-chat-nfsx.onrender.com";

  onMount(async () => {
    sessionId = localStorage.getItem("sessionId");
    if (sessionId) {
      await loadHistory();
    }
    scrollToBottom();
  });

  async function loadHistory() {
    try {
      const res = await fetch(`${BASE_URL}/chat/history/${sessionId}`);
      if (res.ok) {
        const history = await res.json();
        messages = history.map((h) => ({
          sender: h.sender,
          text: h.text,
          timestamp: new Date(h.timestamp),
        }));
      }
    } catch (err) {
      console.error("Failed to load history", err);
    }
  }

  async function send() {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    loading = true;
    error = null;

    messages = [
      ...messages,
      { sender: "user", text: userMsg, timestamp: new Date() },
    ];

    input = "";
    await scrollToBottom();

    try {
      const res = await fetch(`${BASE_URL}/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, sessionId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      if (data.sessionId) {
        sessionId = data.sessionId;
        localStorage.setItem("sessionId", sessionId);
      }

      messages = [
        ...messages,
        { sender: "ai", text: data.reply, timestamp: new Date() },
      ];
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
      await scrollToBottom();
    }
  }

  async function scrollToBottom() {
    await tick();
    if (chatBox) {
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  }

  function formatTime(date) {
    if (!date) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
</script>

<div class="container">
  <div class="chat-card">
    <div class="header">
      <div class="avatar">S</div>
      <div class="header-info">
        <h3>Spur AI Assistant</h3>
        <p>Online</p>
      </div>
    </div>

    {#if error}
      <div class="error-banner">{error}</div>
    {/if}

    <div class="messages-area" id="box" bind:this={chatBox}>
      {#if messages.length === 0}
        <div class="empty-state">
          <p>👋 Hi! How can I help you regarding Spur Mart?</p>
        </div>
      {/if}

      {#each messages as m}
        <div class="message {m.sender === 'user' ? 'user' : 'ai'}">
          {m.text}
          <span class="message-time">{formatTime(m.timestamp)}</span>
        </div>
      {/each}

      {#if loading}
        <div class="typing-indicator">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
      {/if}
    </div>

    <div class="input-area">
      <input
        bind:value={input}
        on:keydown={(e) => e.key === "Enter" && send()}
        placeholder="Type your message..."
        disabled={loading}
      />
      <button on:click={send} disabled={loading || !input.trim()}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      </button>
    </div>
  </div>
</div>

<style>
  /* your styles untouched */
  :global(body) {
    margin: 0;
    font-family:
      "Inter",
      system-ui,
      -apple-system,
      sans-serif;
    background: #f0f2f5;
  }

  .container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 20px;
  }

  .chat-card {
    width: 100%;
    max-width: 480px;
    height: 80vh;
    background: #ffffff;
    border-radius: 20px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .header {
    padding: 20px;
    background: #ffffff;
    border-bottom: 1px solid #eee;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .avatar {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #0060df, #0093ff);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
  }

  .header-info h3 {
    margin: 0;
    font-size: 16px;
    color: #333;
  }

  .header-info p {
    margin: 2px 0 0;
    font-size: 12px;
    color: #00cc66;
  }

  .messages-area {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    background: #f8f9fa;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .message {
    max-width: 80%;
    padding: 12px 16px;
    border-radius: 16px;
    font-size: 14px;
    line-height: 1.5;
    position: relative;
    animation: fadeIn 0.2s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .message.user {
    align-self: flex-end;
    background: #0060df;
    color: white;
    border-bottom-right-radius: 4px;
  }

  .message.ai {
    align-self: flex-start;
    background: #ffffff;
    color: #333;
    border-bottom-left-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .message-time {
    font-size: 10px;
    opacity: 0.7;
    margin-top: 4px;
    text-align: right;
    display: block;
  }

  .typing-indicator {
    align-self: flex-start;
    background: white;
    padding: 12px 16px;
    border-radius: 16px;
    border-bottom-left-radius: 4px;
    display: flex;
    gap: 5px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .dot {
    width: 6px;
    height: 6px;
    background: #ccc;
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out both;
  }

  .dot:nth-child(1) {
    animation-delay: -0.32s;
  }
  .dot:nth-child(2) {
    animation-delay: -0.16s;
  }

  @keyframes bounce {
    0%,
    80%,
    100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }

  .error-banner {
    background: #ffebe5;
    color: #d03030;
    padding: 10px;
    text-align: center;
    font-size: 12px;
    margin: 10px 20px 0;
    border-radius: 8px;
  }

  .input-area {
    padding: 20px;
    background: #ffffff;
    border-top: 1px solid #eee;
    display: flex;
    gap: 10px;
  }

  input {
    flex: 1;
    padding: 12px 16px;
    border: 1px solid #e1e4e8;
    border-radius: 24px;
    outline: none;
    font-size: 14px;
    transition: border-color 0.2s;
  }

  input:focus {
    border-color: #0060df;
  }

  button {
    background: #0060df;
    color: white;
    border: none;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
  }

  button:hover:not(:disabled) {
    background: #0050c0;
  }

  button:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  .empty-state {
    text-align: center;
    color: #888;
    margin-top: 50px;
  }
</style>
