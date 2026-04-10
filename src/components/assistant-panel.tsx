"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import styles from "./assistant-panel.module.css";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

const storageKey = "domestiq-ai-chat";

const starterMessages: ChatMessage[] = [
  {
    id: "assistant-1",
    role: "assistant",
    content: "Tell me what you need cleaned and when. I can turn it into a simple action plan for today.",
  },
];

const quickPrompts = [
  "Plan a 20 minute evening reset",
  "What should I clean before guests arrive?",
  "Split bathroom and kitchen tasks for today",
  "Create a quick Saturday cleaning order",
];

function readMessages(): ChatMessage[] {
  if (typeof window === "undefined") {
    return starterMessages;
  }

  try {
    const saved = window.localStorage.getItem(storageKey);
    return saved ? (JSON.parse(saved) as ChatMessage[]) : starterMessages;
  } catch {
    return starterMessages;
  }
}

function buildAssistantReply(input: string): string {
  const normalized = input.toLowerCase();

  if (normalized.includes("guest")) {
    return "Start with the entry, living room, and bathroom. Clear visible clutter first, wipe high-touch surfaces, then do one quick vacuum pass before guests arrive.";
  }

  if (normalized.includes("20 minute") || normalized.includes("20-minute")) {
    return "Use a 20 minute reset: 5 minutes collecting clutter, 7 minutes on kitchen surfaces, 5 minutes on floors, and 3 minutes to reset the bathroom sink and mirror.";
  }

  if (normalized.includes("bathroom") && normalized.includes("kitchen")) {
    return "Start with the kitchen: counters, sink, and trash. Then do the bathroom mirror, sink, and toilet. Finish with a fast floor sweep in both rooms.";
  }

  if (normalized.includes("saturday") || normalized.includes("weekend")) {
    return "Suggested order: laundry first, then bedrooms, kitchen, bathroom, and finally floors. That keeps machine time running while you clear the main rooms.";
  }

  return "I can help turn that into a simple cleaning sequence. Tell me the rooms involved, how much time you have, and whether this is a quick reset or a deeper clean.";
}

export function AssistantPanel() {
  const isHydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const [messages, setMessages] = useState<ChatMessage[]>(readMessages);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages]);

  function sendMessage(content: string) {
    const trimmed = content.trim();
    if (!trimmed) {
      return;
    }

    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: "user", content: trimmed },
      { id: crypto.randomUUID(), role: "assistant", content: buildAssistantReply(trimmed) },
    ]);
    setDraft("");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage(draft);
  }

  function clearChat() {
    setMessages(starterMessages);
  }

  if (!isHydrated) {
    return (
      <section className={styles.shell}>
        <header className={styles.header}>
          <span className={styles.eyebrow}>AI assistant</span>
          <h1>Loading chat</h1>
          <p>Your saved conversation is being restored inside the PWA.</p>
        </header>
      </section>
    );
  }

  return (
    <section className={styles.shell}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>AI assistant</span>
          <h1>Ask for a cleaning plan</h1>
          <p>Use short requests to get a practical cleaning order for your current situation.</p>
        </div>
        <button className={styles.ghostButton} type="button" onClick={clearChat}>
          Clear
        </button>
      </header>

      <section className={styles.quickPanel}>
        <span className={styles.panelLabel}>Quick prompts</span>
        <div className={styles.promptList}>
          {quickPrompts.map((prompt) => (
            <button key={prompt} className={styles.promptChip} type="button" onClick={() => sendMessage(prompt)}>
              {prompt}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.messagesPanel}>
        {messages.map((message) => (
          <article
            key={message.id}
            className={`${styles.message} ${message.role === "user" ? styles.user : styles.assistant}`}
          >
            <span className={styles.messageRole}>{message.role === "user" ? "You" : "DomestiQ AI"}</span>
            <p>{message.content}</p>
          </article>
        ))}
      </section>

      <form className={styles.composer} onSubmit={handleSubmit}>
        <textarea
          className={styles.input}
          placeholder="Example: I have 15 minutes and the kitchen is messy"
          rows={3}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <button className={styles.sendButton} type="submit">
          Send
        </button>
      </form>
    </section>
  );
}
