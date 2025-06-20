"use client";

import React, { useState } from "react";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import RightDrawer from "./Modals/RightDrawer";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

const POLLINATIONS_API_URL = "https://text.pollinations.ai";

export default function ChatBot() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! Ask me anything." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const prompt = encodeURIComponent(input);
      const res = await fetch(`${POLLINATIONS_API_URL}/${prompt}`);
      const replyText = await res.text();

      const botMessage = {
        sender: "bot",
        text: replyText || "Something went wrong.",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Failed to fetch response." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      <RightDrawer
        openText="ChatBot"
        title="Chat with AI"
        description="Your personal AI support, just a message away."
      >
        <div className="py-4 space-y-6 flex flex-col h-full">
          <ScrollArea className="flex-1 overflow-y-auto px-2">
            <div className="flex flex-col space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mydiv text-sm py-2 px-4 rounded-lg max-w-[80%] whitespace-pre-wrap ${
                    msg.sender === "user"
                      ? "ml-auto bg-blue-600 text-white dark:bg-blue-500"
                      : "mr-auto bg-gray-200 text-black dark:bg-gray-700 dark:text-white"
                  }`}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="flex gap-2 items-center w-full mt-4 px-2">
            <Input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={loading}
            />
            <Button onClick={handleSend} disabled={loading || !input.trim()}>
              {loading ? "..." : "Send"}
            </Button>
          </div>
        </div>
      </RightDrawer>
    </div>
  );
}
