"use client";

import React, { useEffect, useRef, useState } from "react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import RightDrawer from "./Modals/RightDrawer";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

interface Message {
  id: number;
  sender: "user" | "bot";
  text: string;
  isError?: boolean;
}

const GREETING: Message = {
  id: 0,
  sender: "bot",
  text: "Hello! Ask me anything.",
};

const SUGGESTIONS = [
  "What can you help me with?",
  "Explain React hooks briefly",
  "Write a JS debounce function",
];

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const nextId = useRef(1);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Keep the newest message (or the typing indicator) in view
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  const addMessage = (message: Omit<Message, "id">) =>
    setMessages((prev) => [...prev, { ...message, id: nextId.current++ }]);

  const handleSend = async (text: string = input) => {
    const prompt = text.trim();
    if (!prompt || loading) return;

    addMessage({ sender: "user", text: prompt });
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error(`Chat request failed: ${res.status}`);
      const { text: replyText } = await res.json();

      addMessage({ sender: "bot", text: replyText || "Something went wrong." });
    } catch (error) {
      console.error("Error:", error);
      addMessage({
        sender: "bot",
        text: "Failed to fetch response. Please try again.",
        isError: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  const showSuggestions = messages.length === 1 && !loading;

  return (
    <RightDrawer
      openText="ChatBot"
      title="Chat with AI"
      description="Your personal AI support, just a message away."
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <div
          className="flex-1 overflow-y-auto px-2 py-2"
          aria-live="polite"
        >
          <div className="flex flex-col space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`mydiv max-w-[85%] break-words rounded-2xl px-4 py-2 text-sm shadow-sm ${
                  msg.sender === "user"
                    ? "ml-auto rounded-br-sm bg-blue-600 text-white dark:bg-blue-500"
                    : msg.isError
                      ? "mr-auto rounded-bl-sm bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
                      : "mr-auto rounded-bl-sm bg-gray-100 text-black dark:bg-gray-800 dark:text-white"
                }`}
              >
                {msg.sender === "user" ? (
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                ) : (
                  <div className="space-y-2 [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div
                className="mr-auto flex items-center gap-1 rounded-2xl rounded-bl-sm bg-gray-100 px-4 py-3 dark:bg-gray-800"
                aria-label="Assistant is typing"
              >
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            )}

            {showSuggestions && (
              <div className="flex flex-wrap gap-2 pt-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSend(suggestion)}
                    className="rounded-full border border-gray-300 px-3 py-1 text-xs text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-4 flex w-full items-center gap-2 border-t border-gray-200 px-2 pt-4 dark:border-gray-800"
        >
          <Input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            aria-label="Message"
          />
          <Button type="submit" disabled={loading || !input.trim()}>
            {loading ? "..." : "Send"}
          </Button>
        </form>
      </div>
    </RightDrawer>
  );
}
