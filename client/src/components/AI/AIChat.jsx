import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { FaPaperPlane, FaRobot, FaTimes, FaUser, FaRegCopy, FaThumbsUp, FaThumbsDown, FaRedoAlt, FaSmile, FaCheck, FaHeart, FaQuestionCircle, FaBook, FaFileAlt, FaUserShield } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

const INITIAL_MESSAGE = {
  role: "assistant",
  content: "Hi! I'm your AI assistant for the College ERP Portal. I can help you with registration, document uploads, application status, admin features, and much more. What would you like to know?",
};

export default function AIChat({ onClose, studentData = null }) {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef(null);
  const emojiRef = useRef(null);
  const abortRef = useRef(null);
  const stoppedRef = useRef(false);
  const [hasReceivedChunk, setHasReceivedChunk] = useState(false);
  const [dots, setDots] = useState(0);
  const [lastUserMessage, setLastUserMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [feedbackStates, setFeedbackStates] = useState({});
  const [showQuickHelp, setShowQuickHelp] = useState(false);

  const { userRole, isAuthenticated } = useAuth();
  const apiBase = import.meta.env.VITE_API_URL;

  // Quick help categories based on user role
  const quickHelpCategories = userRole === 'admin' 
    ? [
        { key: 'admin', label: 'Admin Features', icon: <FaUserShield /> },
        { key: 'registration', label: 'Registration Process', icon: <FaBook /> },
        { key: 'documents', label: 'Document Management', icon: <FaFileAlt /> },
        { key: 'status', label: 'Status System', icon: <FaQuestionCircle /> }
      ]
    : [
        { key: 'registration', label: 'Registration Help', icon: <FaBook /> },
        { key: 'documents', label: 'Document Upload', icon: <FaFileAlt /> },
        { key: 'status', label: 'Application Status', icon: <FaQuestionCircle /> }
      ];

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

  // Close emoji keyboard when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showEmoji && emojiRef.current && !emojiRef.current.contains(event.target)) {
        setShowEmoji(false);
      }
    };

    if (showEmoji) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showEmoji]);

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

      // Enhanced API call with user context
      const requestData = {
        messages: newMessages.map(({ role, content }) => ({ role, content })),
        userRole: isAuthenticated ? userRole : null,
        studentData: userRole === 'student' && studentData ? {
          status: studentData.status,
          declinedFields: studentData.declinedFields || []
        } : null
      };

      const { data } = await axios.post(
        `${apiBase}/ai/chat`,
        requestData,
        { 
          signal: controller.signal, 
          withCredentials: true, 
          headers: { "Content-Type": "application/json" },
          timeout: 30000 // 30 second timeout
        }
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
        console.error('AI Chat Error:', err);
        
        let errorMessage = "There was an error contacting the AI service.";
        
        if (err?.code === 'ECONNABORTED' || err?.message?.includes('timeout')) {
          errorMessage = "Request timed out. The AI service might be busy. Please try again.";
        } else if (err?.response?.status === 429) {
          errorMessage = "Too many requests. Please wait a moment before trying again.";
        } else if (err?.response?.status === 401) {
          errorMessage = "Authentication required. Please login and try again.";
        } else if (err?.response?.status >= 500) {
          errorMessage = "AI service is temporarily unavailable. Please try again later.";
        } else if (err?.response?.data?.message) {
          errorMessage = err.response.data.message;
        }
        
        setMessages((prev) => [...prev, { 
          role: "assistant", 
          content: `❌ **Error**: ${errorMessage}\n\nYou can try:\n• Rephrasing your question\n• Asking something simpler\n• Trying again in a few moments` 
        }]);
      }
    } finally {
      setIsLoading(false);
      abortRef.current = null;
      // Hide Quick Help options when AI finishes responding
      setShowQuickHelp(false);
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

  // Quick help function
  async function getQuickHelp(category) {
    setIsLoading(true);
    try {
      const { data } = await axios.get(
        `${apiBase}/ai/help?category=${category}`,
        { withCredentials: true, timeout: 10000 }
      );

      if (data.success && data.help) {
        const helpMessage = {
          role: "assistant",
          content: `## ${data.help.title}\n\n${data.help.items.map(item => `• ${item}`).join('\n')}\n\n*Need more specific help? Just ask me a question!*`
        };
        setMessages(prev => [...prev, helpMessage]);
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.message || "Failed to get help information";
      setMessages(prev => [...prev, { role: "assistant", content: `Sorry, ${errorMsg}. Please try asking a specific question instead.` }]);
    } finally {
      setIsLoading(false);
      setShowQuickHelp(false);
    }
  }

  // Suggested questions based on user role and context
  const getSuggestedQuestions = () => {
    if (userRole === 'admin') {
      return [
        "How do I review student applications?",
        "What does the AI review feature do?",
        "How do I filter students by status?",
        "How do I approve multiple students?",
        "What are the different sections in student profiles?"
      ];
    } else if (userRole === 'student') {
      const suggestions = ["How do I complete my registration?", "What documents do I need to upload?"];
      
      if (studentData?.status === 'declined') {
        suggestions.unshift("Why is my application declined?", "How do I update my declined fields?");
      } else if (studentData?.status === 'pending') {
        suggestions.unshift("What does pending status mean?", "How long does review take?");
      }
      
      return suggestions;
    } else {
      return [
        "How do I register as a student?",
        "What is this ERP portal?",
        "How do I login?",
        "What documents are required?",
        "How does the admission process work?"
      ];
    }
  };

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
      className="ai-chat-container fixed bottom-24 right-2 sm:right-6 z-50 w-[min(26rem,calc(100vw-1rem))] sm:w-[26rem] sm:max-w-[90vw] bg-white border border-blue-200 rounded-2xl flex flex-col overflow-hidden transition-all duration-300"
      style={{ 
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15), 0 5px 15px rgba(0, 0, 0, 0.07)",
        background: "linear-gradient(to bottom, #ffffff, #f9fafb)",
        height: "640px",
        maxHeight: "calc(100vh - 110px)"
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
        className="ai-scroll flex-1 px-5 py-4 min-h-0 overflow-y-auto bg-gradient-to-b from-gray-50 to-gray-100/30 scroll-smooth pr-2"
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

      {/* Quick Help Section - Only show when toggled */}
      {showQuickHelp && !isLoading && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600">Quick Help</span>
              <button
                onClick={() => setShowQuickHelp(!showQuickHelp)}
                className="text-xs cursor-pointer text-blue-600 hover:text-blue-700 transition-colors"
              >
                Hide Options
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-3">
              {quickHelpCategories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => getQuickHelp(category.key)}
                  className="flex cursor-pointer items-center gap-2 p-2 text-xs bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                >
                  <span className="text-blue-600">{category.icon}</span>
                  <span className="text-gray-700">{category.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-medium text-gray-600 block mb-2">Suggested Questions</span>
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {getSuggestedQuestions().slice(0, 3).map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInput(question);
                    setTimeout(() => sendMessage({ preventDefault: () => {} }), 100);
                  }}
                  className="block cursor-pointer w-full text-left text-xs text-gray-600 hover:text-blue-600 p-1 hover:bg-blue-50 rounded transition-colors duration-150 truncate"
                >
                  • {question}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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
          <div ref={emojiRef}>
            <button
              type="button"
              onClick={() => setShowEmoji((v) => !v)}
              className="absolute right-5 top-1/2 transform -translate-y-1/2 text-yellow-400 hover:text-yellow-600 transition-colors duration-150"
              title="Add emoji"
              style={{ fontSize: '1rem', lineHeight: 1 }}
            >
              <FaSmile style={{ fontSize: '1.5rem', lineHeight: 1 }} />
            </button>
            
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
          </div>
        </div>
        
        {/* Quick Help Button */}
        <button
          type="button"
          onClick={() => setShowQuickHelp(!showQuickHelp)}
          className="bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-700 rounded-xl px-3 py-3 cursor-pointer flex items-center gap-1 transition-all duration-200"
          title="Quick Help"
        >
          <FaQuestionCircle className="text-sm" />
        </button>
        
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
        
        /* Ensure chat widget stays within viewport bounds */
        @media (max-width: 640px) {
          .ai-chat-container {
            left: 0.25rem !important;
            right: 0.25rem !important;
            width: calc(100vw - 0.5rem) !important;
            max-width: none !important;
          }
        }
      `}</style>
    </div>
  );
}