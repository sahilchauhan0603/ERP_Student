import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaPaperPlane, FaRobot, FaTimes, FaUser } from "react-icons/fa";

const INITIAL_MESSAGE = {
  role: "assistant",
  content: "Hi! I'm your AI assistant. Ask me anything about registration, login, or using the ERP portal.",
};

export default function AIChat({ onClose }) {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef(null);
  const abortRef = useRef(null);
  const stoppedRef = useRef(false);
  const [hasReceivedChunk, setHasReceivedChunk] = useState(false);
  const [dots, setDots] = useState(0);

  const apiBase = useMemo(() => {
    // Prefer env override if provided (e.g., http://localhost:5000)
    const envBase = typeof import.meta !== "undefined" && import.meta?.env?.VITE_API_URL;
    if (envBase) return envBase;
    // Default to dev port 5000 when running locally
    if (typeof window !== "undefined" && window.location.hostname === "localhost") {
      return "http://localhost:5000";
    }
    // Same-origin in production
    return "";
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [messages]);

  // Animate dynamic thinking dots before first chunk arrives
  useEffect(() => {
    if (isLoading && !hasReceivedChunk) {
      const id = setInterval(() => setDots((d) => (d + 1) % 4), 400);
      return () => clearInterval(id);
    }
  }, [isLoading, hasReceivedChunk]);

  // Reflect dots into the last assistant bubble while waiting
  useEffect(() => {
    if (isLoading && !hasReceivedChunk) {
      setMessages((prev) => {
        if (!prev.length) return prev;
        const copy = [...prev];
        const last = copy[copy.length - 1];
        if (last?.role === "assistant") {
          copy[copy.length - 1] = { ...last, content: `Thinking${".".repeat(dots)}` };
        }
        return copy;
      });
    }
  }, [dots, isLoading, hasReceivedChunk]);

  function renderMarkdown(md) {
    // Very lightweight markdown rendering: bold, italics, code, bullets, numbers, line breaks
    let html = md
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    // Bold **text**
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    // Italic *text*
    html = html.replace(/(?<!\*)\*(?!\*)(.*?)\*(?<!\*)/g, "<em>$1</em>");
    // Inline code `code`
    html = html.replace(/`([^`]+)`/g, "<code class=\"px-1 py-0.5 rounded bg-gray-100 text-gray-900\">$1</code>");
    // Line breaks
    html = html.replace(/\n\n+/g, "</p><p>").replace(/\n/g, "<br/>");
    // Wrap in paragraph
    return `<p>${html}</p>`;
  }

  async function sendMessage(e) {
    e?.preventDefault?.();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    const newMessages = [...messages, { role: "user", content: trimmed }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setHasReceivedChunk(false);
    setDots(0);
    stoppedRef.current = false;
    try {
      // Prefer streaming endpoint
      const controller = new AbortController();
      const res = await fetch(`${apiBase}/api/ai/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ messages: newMessages.map(({ role, content }) => ({ role, content })) }),
        signal: controller.signal,
      });
      abortRef.current = controller;
      if (!res.ok) throw new Error("Failed to reach AI service");

      // Prepare a single placeholder for the assistant message
      let assistantText = "Thinking";
      let receivedFirstChunk = false;
      setMessages((prev) => [...prev, { role: "assistant", content: assistantText }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";
        for (const part of parts) {
          if (part.startsWith(":")) continue; // comment/keep-alive
          const lines = part.split("\n");
          for (const line of lines) {
            if (!line.startsWith("data:")) continue;
            try {
              const payload = JSON.parse(line.replace(/^data:\s*/, ""));
              if (payload?.text) {
                if (!receivedFirstChunk) {
                  assistantText = payload.text;
                  receivedFirstChunk = true;
                  setHasReceivedChunk(true);
                } else {
                  assistantText += payload.text;
                }
                setMessages((prev) => {
                  const copy = [...prev];
                  // update last assistant message
                  copy[copy.length - 1] = { role: "assistant", content: assistantText };
                  return copy;
                });
              }
            } catch (e) {
              // ignore malformed chunks
            }
          }
        }
      }

    } catch (err) {
      // If user intentionally stopped, do not show error message
      if (err?.name === 'AbortError') {
        // Silent stop
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "There was an error contacting the AI service." },
        ]);
      }
    } finally {
      setIsLoading(false);
      abortRef.current = null;
      if (stoppedRef.current) {
        // Show a small system note indicating the stop
        setHasReceivedChunk(true);
        setMessages((prev) => {
          if (!prev.length) return prev;
          const copy = [...prev];
          const last = copy[copy.length - 1];
          if (last?.role === "assistant") {
            copy[copy.length - 1] = { ...last, content: "Response stopped generating." };
          }
          return copy;
        });
      }
    }
  }

  return (
    <div
      className="fixed bottom-24 right-6 z-50 w-[24rem] max-w-[90vw] bg-white border border-blue-300 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      style={{ boxShadow: "0 8px 32px 0 rgba(0,0,0,0.18)" }}
    >
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-red-500 text-white">
        <div className="flex items-center gap-2">
          <FaRobot />
          <span className="font-semibold">AI Assistant</span>
        </div>
        <button onClick={onClose} className="opacity-90 hover:opacity-100 transition-opacity">
          <FaTimes />
        </button>
      </div>

      <div
        ref={containerRef}
        className="px-4 py-3 h-96 overflow-y-auto bg-gradient-to-b from-gray-50 to-white scroll-smooth"
      >
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`mb-3 flex ${m.role === "user" ? "justify-end" : "justify-start"} items-start gap-2`}
          >
            {m.role === "assistant" && (
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-red-500 flex items-center justify-center mt-2 ">
                <FaRobot className="text-white text-xs" />
              </div>
            )}

            <div
              className={`${m.role === "user"
                ? "bg-blue-600 text-white rounded-l-2xl rounded-tr-2xl"
                : "bg-white text-gray-900 rounded-r-2xl rounded-tl-2xl"
                } max-w-[80%] px-4 py-3 shadow border ${m.role === "user" ? "border-blue-600" : "border-gray-200"}`}
            >
              {m.role === "assistant" ? (
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content) }} />
              ) : (
                <span>{m.content}</span>
              )}
            </div>

            {m.role === "user" && (
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-red-500 flex items-center justify-center mt-2">
                <FaUser className="text-white text-xs" />
              </div>
            )}
          </div>
        ))}

        {/* loading bubble removed to prevent duplicate assistant boxes */}
      </div>

      <form onSubmit={(e) => { if (!isLoading) { sendMessage(e); } else { e.preventDefault(); } }} className="p-3 bg-white border-t border-gray-200 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message…"
          className="flex-1 border border-gray-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200"
          maxLength={1000}
        />
        <button
          type={isLoading ? "button" : "submit"}
          onClick={isLoading ? (() => { try { stoppedRef.current = true; abortRef.current?.abort(); } catch (e) { } }) : undefined}
          disabled={!isLoading && input.trim().length === 0}
          className={
            `bg-gradient-to-r from-blue-600 to-red-500 ` +
            `hover:from-blue-700 hover:to-red-600 ` +
            `disabled:bg-gray-300 disabled:text-black disabled:cursor-not-allowed ` +
            `text-white rounded-xl px-3 py-2 flex items-center gap-2 transition-all duration-200`
          }
        >
          {isLoading ? (
            <span>Stop</span>
          ) : (
            <>
              <FaPaperPlane />
              <span className="hidden sm:inline">Send</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}