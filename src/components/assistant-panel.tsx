"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  buildConversationTitle,
  buildHouseholdContextSummary,
  readRemindersFromStorage,
  readTasksFromStorage,
  storageKeys,
} from "@/lib/household-data";
import { BrandLockup } from "@/components/brand-lockup";
import styles from "./assistant-panel.module.css";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

const titleFallback = "New chat";

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
    const saved = window.localStorage.getItem(storageKeys.chat);
    return saved ? (JSON.parse(saved) as ChatMessage[]) : starterMessages;
  } catch {
    return starterMessages;
  }
}

function readTitle(): string {
  if (typeof window === "undefined") {
    return titleFallback;
  }

  return window.localStorage.getItem(storageKeys.chatTitle) ?? titleFallback;
}

function formatAssistantError(message: string) {
  if (message.includes("Missing OpenAI configuration")) {
    return "AI chat is almost ready. Add a valid OPENAI_API_KEY in your Vercel project settings to enable live cleaning plans.";
  }

  if (message.includes("Missing GitHub Models configuration")) {
    return "AI chat is not connected yet. Add your GitHub Models token and model in the deployment environment settings.";
  }

  if (message.includes("Missing Azure OpenAI configuration")) {
    return "AI chat is not connected yet. Add the Azure OpenAI endpoint, deployment, and API key in the deployment environment settings.";
  }

  if (/quota|insufficient_quota/i.test(message)) {
    return "The connected AI key has no remaining quota right now. Replace or recharge the provider key to restore live responses.";
  }

  if (/rejected the API credentials|401/i.test(message)) {
    return "The connected AI credentials were rejected. Update the active provider API key or token in the deployment settings.";
  }

  if (/models:read/i.test(message)) {
    return "The GitHub Models token needs the models:read permission before AI chat can work.";
  }

  if (/model or deployment could not be found/i.test(message)) {
    return "The configured AI model or Azure deployment name is invalid. Update the deployment settings and redeploy.";
  }

  if (message.includes("Unable to reach the assistant provider")) {
    return "The AI provider is temporarily unreachable. Try again in a minute.";
  }

  return message;
}

export function AssistantPanel() {
  const isHydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const [messages, setMessages] = useState<ChatMessage[]>(readMessages);
  const [title, setTitle] = useState(readTitle);
  const [draft, setDraft] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(storageKeys.chat, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(storageKeys.chatTitle, title);
  }, [title]);

  async function sendMessage(content: string) {
    const trimmed = content.trim();
    if (!trimmed) {
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };

    const assistantMessageId = crypto.randomUUID();

    const nextMessages = [...messages, userMessage];
    const nextTitle = title === titleFallback ? buildConversationTitle(trimmed) : title;

    setMessages([
      ...nextMessages,
      { id: assistantMessageId, role: "assistant", content: "" },
    ]);
    setTitle(nextTitle);
    setDraft("");
    setError(null);
    setIsSubmitting(true);

    try {
      const householdContext = buildHouseholdContextSummary(
        readTasksFromStorage(),
        readRemindersFromStorage(),
      );

      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content: messageContent }) => ({
            role,
            content: messageContent,
          })),
          householdContext,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string; details?: string };
        throw new Error(payload.details ? `${payload.error ?? "Assistant request failed."} ${payload.details}` : (payload.error ?? "Assistant request failed."));
      }

      if (!response.body) {
        throw new Error("Assistant stream was not available.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        assistantMessage += decoder.decode(value, { stream: true });

        setMessages((current) =>
          current.map((message) =>
            message.id === assistantMessageId
              ? { ...message, content: assistantMessage }
              : message,
          ),
        );
      }

      assistantMessage += decoder.decode();

      if (!assistantMessage.trim()) {
        throw new Error("Assistant returned an empty response.");
      }

      setMessages((current) =>
        current.map((message) =>
          message.id === assistantMessageId
            ? { ...message, content: assistantMessage }
            : message,
        ),
      );
    } catch (requestError) {
      setMessages((current) => current.filter((message) => message.id !== assistantMessageId));
      setError(
        requestError instanceof Error
          ? formatAssistantError(requestError.message)
          : "Unable to get a response from the assistant.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await sendMessage(draft);
  }

  function clearChat() {
    setMessages(starterMessages);
    setTitle(titleFallback);
    setError(null);
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
        <div className={styles.headerContent}>
          <BrandLockup
            kicker="AI assistant"
            title="DomestiQ AI"
            tagline="Short cleaning plans shaped around your time, rooms, and current task load."
            compact
          />
          <h1>Ask for a cleaning plan</h1>
          <p>Use short requests to get a practical cleaning order for your current situation.</p>
          <span className={styles.chatTitle}>{title}</span>
        </div>
        <button className={styles.ghostButton} type="button" onClick={clearChat}>
          Clear
        </button>
      </header>

      <section className={styles.quickPanel}>
        <span className={styles.panelLabel}>Quick prompts</span>
        <div className={styles.promptList}>
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              className={styles.promptChip}
              type="button"
              onClick={() => void sendMessage(prompt)}
              disabled={isSubmitting}
            >
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
      {error ? <p className={styles.errorText}>{error}</p> : null}

      <form className={styles.composer} onSubmit={handleSubmit}>
        <textarea
          className={styles.input}
          placeholder="Example: I have 15 minutes and the kitchen is messy"
          rows={3}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          disabled={isSubmitting}
        />
        <button className={styles.sendButton} type="submit" disabled={isSubmitting || draft.trim().length === 0}>
          {isSubmitting ? "Sending..." : "Send"}
        </button>
      </form>
    </section>
  );
}
