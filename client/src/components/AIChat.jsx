import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { FaPaperPlane, FaRobot, FaTimes, FaUser, FaRegCopy, FaThumbsUp, FaThumbsDown, FaRedoAlt, FaSmile, FaCheck, FaHeart } from "react-icons/fa";

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
  const [lastUserMessage, setLastUserMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [feedbackStates, setFeedbackStates] = useState({});

  const apiBase = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!containerRef.current) return;
    if (isAtBottom) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, isAtBottom]);

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
    setLastUserMessage(trimmed);
    setInput("");
    setIsLoading(true);
    setHasReceivedChunk(false);
    setDots(0);
    stoppedRef.current = false;
    try {
      const controller = new AbortController();
      abortRef.current = controller;

      // Add a single assistant placeholder that our dots animation will update
      setMessages((prev) => [...prev, { role: "assistant", content: "Thinking" }]);

      // Non-streaming request using axios
      const { data } = await axios.post(
        `${apiBase}/ai/chat`,
        { messages: newMessages.map(({ role, content }) => ({ role, content })) },
        { signal: controller.signal, withCredentials: true, headers: { "Content-Type": "application/json" } }
      );

      const reply = data?.reply || data?.message || "Sorry, I couldn't generate a response.";
      setHasReceivedChunk(true);
      // Overwrite the placeholder bubble with the final reply
      setMessages((prev) => {
        const copy = [...prev];
        if (copy.length > 0 && copy[copy.length - 1]?.role === "assistant") {
          copy[copy.length - 1] = { role: "assistant", content: reply };
        } else {
          copy.push({ role: "assistant", content: reply });
        }
        return copy;
      });

    } catch (err) {
      // If user intentionally stopped, do not show error message
      if (err?.name === 'AbortError') {
        // Silent stop
      } else {
        const msg = err?.response?.data?.message || err?.message || "There was an error contacting the AI service.";
        setMessages((prev) => [...prev, { role: "assistant", content: msg }]);
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

  function handleCopy(text, messageIndex) {
    try { 
      navigator.clipboard.writeText(text);
      // Show feedback that copy was successful
      setFeedbackStates(prev => ({
        ...prev,
        [messageIndex]: { ...prev[messageIndex], copied: true }
      }));
      
      // Reset after 2 seconds
      setTimeout(() => {
        setFeedbackStates(prev => ({
          ...prev,
          [messageIndex]: { ...prev[messageIndex], copied: false }
        }));
      }, 2000);
    } catch {}
  }

  function handleFeedback(messageIndex, type) {
    // Update feedback state
    setFeedbackStates(prev => ({
      ...prev,
      [messageIndex]: { 
        ...prev[messageIndex], 
        feedback: type,
        // If clicking the same button again, toggle it off
        feedbackActive: prev[messageIndex]?.feedback === type ? !prev[messageIndex]?.feedbackActive : true
      }
    }));
    
    // Log the feedback (you can send this to your backend)
    console.log(`feedback:${type}`, messages[messageIndex].content);
  }

  function handleRetry() {
    if (isLoading || !lastUserMessage) return;
    setInput(lastUserMessage);
    setTimeout(() => sendMessage({ preventDefault: () => {} }), 0);
  }

  const EMOJIS = [
    "😀","😁","😂","🤣","😊","😍","😎","😇","😉","👍","🙏","🎉","🚀","✨","💡","🔥","💯","✅","❓","📌"
  ];

  return (
    <div
      className="fixed bottom-24 right-6 z-50 w-[26rem] max-w-[90vw] bg-white border border-blue-200 rounded-2xl flex flex-col overflow-hidden transition-all duration-300"
      style={{ 
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15), 0 5px 15px rgba(0, 0, 0, 0.07)",
        background: "linear-gradient(to bottom, #ffffff, #f9fafb)",
        height: "520px"
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-600 to-red-500 text-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-full">
            <FaRobot className="text-lg" />
          </div>
          <div>
            <span className="font-semibold text-lg">AI Assistant</span>
            <div className="text-xs opacity-80 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span>Online</span>
            </div>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="opacity-80 cursor-pointer hover:opacity-100 transition-all duration-200 p-1.5 hover:bg-white/10 rounded-full"
        >
          <FaTimes className="text-lg" />
        </button>
      </div>
      
      {/* Messages Container */}
      <div
        ref={containerRef}
        className="ai-scroll flex-1 px-5 py-4 h-72 overflow-y-auto bg-gradient-to-b from-gray-50 to-gray-100/30 scroll-smooth pr-2"
        onScroll={(e) => {
          const el = e.currentTarget;
          const atBottom = el.scrollTop >= el.scrollHeight - el.clientHeight - 20;
          setIsAtBottom(atBottom);
        }}
      >
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`mb-4 flex ${m.role === "user" ? "justify-end" : "justify-start"} items-start gap-3 transition-all duration-300 ${idx === messages.length - 1 ? 'animate-fade-in' : ''}`}
          >
            {m.role === "assistant" && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-red-500 flex items-center justify-center shadow-sm mt-1">
                <FaRobot className="text-white text-xs" />
              </div>
            )}

            <div
              className={`${m.role === "user"
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl rounded-tr-md"
                : "bg-white text-gray-800 rounded-2xl rounded-tl-md border border-gray-100"
                } max-w-[80%] px-4 py-3 shadow-sm transition-all duration-200 ${m.role === "user" ? "shadow-blue-200/50" : "shadow-gray-200"}`}
              style={{ boxShadow: m.role === "user" ? "0 4px 12px rgba(37, 99, 235, 0.15)" : "0 4px 12px rgba(0, 0, 0, 0.05)" }}
            >
              {m.role === "assistant" ? (
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content) }} />
              ) : (
                <span className="leading-relaxed">{m.content}</span>
              )}
              
              {m.role === "assistant" && (
                <div className="mt-3 flex items-center gap-3 text-gray-500 pt-2 border-t border-gray-100">
                  <button 
                    title={feedbackStates[idx]?.copied ? "Copied!" : "Copy response"} 
                    onClick={() => handleCopy(m.content, idx)} 
                    className={`p-1.5 rounded-full transition-all duration-300 ${feedbackStates[idx]?.copied ? 
                      "text-green-600 scale-110 bg-green-100" : 
                      "hover:bg-gray-100 hover:text-blue-600"}`}
                  >
                    {feedbackStates[idx]?.copied ? <FaCheck className="text-xs" /> : <FaRegCopy className="text-xs" />}
                  </button>
                  <button 
                    title="Helpful response" 
                    onClick={() => handleFeedback(idx, 'up')} 
                    className={`p-1.5 rounded-full transition-all duration-300 ${feedbackStates[idx]?.feedback === 'up' && feedbackStates[idx]?.feedbackActive ? 
                      "text-green-600 scale-110 bg-green-100" : 
                      "hover:bg-gray-100 hover:text-green-600"}`}
                  >
                    <FaThumbsUp className="text-xs" />
                  </button>
                  <button 
                    title="Not helpful" 
                    onClick={() => handleFeedback(idx, 'down')} 
                    className={`p-1.5 rounded-full transition-all duration-300 ${feedbackStates[idx]?.feedback === 'down' && feedbackStates[idx]?.feedbackActive ? 
                      "text-red-600 scale-110 bg-red-100" : 
                      "hover:bg-gray-100 hover:text-red-600"}`}
                  >
                    <FaThumbsDown className="text-xs" />
                  </button>
                  <button 
                    title="Love this response" 
                    onClick={() => handleFeedback(idx, 'love')} 
                    className={`p-1.5 rounded-full transition-all duration-300 ${feedbackStates[idx]?.feedback === 'love' && feedbackStates[idx]?.feedbackActive ? 
                      "text-pink-600 scale-110 bg-pink-100" : 
                      "hover:bg-gray-100 hover:text-pink-600"}`}
                  >
                    <FaHeart className="text-xs" />
                  </button>
                  <button 
                    title="Regenerate response" 
                    onClick={handleRetry} 
                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-150 hover:text-blue-600"
                  >
                    <FaRedoAlt className="text-xs" />
                  </button>
                </div>
              )}
            </div>

            {m.role === "user" && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-red-500 flex items-center justify-center shadow-sm mt-1">
                <FaUser className="text-white text-xs" />
              </div>
            )}
          </div>
        ))}

        {/* No separate loading bubble; thinking text animates inside the placeholder bubble */}
      </div>

      {/* Input Area */}
      <form 
        id="ai-chat-form" 
        onSubmit={(e) => { if (!isLoading) { sendMessage(e); } else { e.preventDefault(); } }} 
        className="p-4 bg-white border-t border-gray-200 flex items-center gap-2 relative"
      >
        <div className="flex-1 relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!isLoading && input.trim().length > 0) {
                  sendMessage(e);
                }
              }
            }}
            placeholder="Type your message..."
            className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-10 outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 resize-none leading-relaxed"
            rows={1}
            style={{ minHeight: '44px', maxHeight: '140px', overflowY: 'auto' }}
            maxLength={2000}
          />
          <button
            type="button"
            onClick={() => setShowEmoji((v) => !v)}
            className="absolute right-5 top-1/2 transform -translate-y-1/2 text-yellow-400 hover:text-yellow-600 transition-colors duration-150"
            title="Add emoji"
            style={{ fontSize: '1rem', lineHeight: 1 }}
          >
            <FaSmile style={{ fontSize: '1.5rem', lineHeight: 1 }} />
          </button>
        </div>
        
        {showEmoji && (
          <div className="absolute bottom-16 left-4 bg-white border border-gray-200 rounded-xl shadow-lg p-3 grid grid-cols-5 gap-1 z-50">
            {EMOJIS.map((e) => (
              <button 
                key={e} 
                className="hover:bg-gray-100 rounded-lg p-2 transition-colors duration-150 text-lg" 
                onClick={() => { setInput((v) => v + e); setShowEmoji(false); }}
              >
                {e}
              </button>
            ))}
          </div>
        )}
        
        <button
          type={isLoading ? "button" : "submit"}
          onClick={isLoading ? (() => { try { stoppedRef.current = true; abortRef.current?.abort(); } catch (e) { } }) : undefined}
          disabled={!isLoading && input.trim().length === 0}
          className={
            `bg-gradient-to-r from-blue-600 to-red-500 ` +
            `hover:from-blue-700 hover:to-red-600 ` +
            `disabled:from-gray-300 disabled:to-gray-400 disabled:text-gray-500 disabled:cursor-not-allowed ` +
            `text-white rounded-xl px-4 py-3 cursor-pointer flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md`
          }
        >
          {isLoading ? (
            <span>Stop</span>
          ) : (
            <>
              <FaPaperPlane className="text-sm" />
              {/* <span className="hidden sm:inline">Send</span> */}
            </>
          )}
        </button>
      </form>

      {/* Footer with Copyright */}
      <div className="py-2 px-4 bg-gray-50 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-500">© CopyRight 2025. All Rights Reserved By BPIT CampusPro</p>
      </div>

      <style>{`
        .ai-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
        }
        .ai-scroll::-webkit-scrollbar { 
          width: 6px; 
        }
        .ai-scroll::-webkit-scrollbar-track { 
          background: transparent; 
          margin: 5px;
        }
        .ai-scroll::-webkit-scrollbar-thumb { 
          background: rgba(0, 0, 0, 0.2); 
          border-radius: 10px; 
        }
        .ai-scroll::-webkit-scrollbar-thumb:hover { 
          background: rgba(0, 0, 0, 0.35); 
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}