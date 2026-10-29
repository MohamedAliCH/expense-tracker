import React, { useState } from "react";
import {
  Sparkle,
  PaperPlaneRight,
  X,
  ArrowsClockwise,
} from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { queryAiAdvisor } from "../../utils/api";

const SAMPLE_QUESTIONS = [
  "What is my net savings rate and trajectory this month?",
  "How much did I spend on food and dining so far?",
  "Can I afford a $400 purchase without breaking my savings buffer?",
  "Which category has the highest spending acceleration?",
];

const AiAdvisorModal = ({ show, onClose, currency = "$" }) => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hello! I am your Oceanic AI Financial Co-Pilot. I have direct access to your real ledger balances, budget limits, and monthly cashflow deltas. How can I assist your capital planning today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  const handleSend = async (questionText) => {
    const text = questionText || input.trim();
    if (!text || loading) return;

    const userMessage = {
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!questionText) setInput("");
    setLoading(true);

    try {
      const res = await queryAiAdvisor(text);
      const answer = res?.data?.answer || "No response generated from financial model.";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: answer,
          provider: res?.data?.provider_used,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${err?.userMessage || "Failed to reach AI advisor service."}`,
          isError: true,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "rgba(11, 22, 34, 0.7)",
        backdropFilter: "blur(8px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="w-full max-w-[640px] h-[640px] max-h-[90vh] rounded-[22px] flex flex-col overflow-hidden border shadow-2xl"
        style={{
          background: "var(--card)",
          borderColor: "var(--border-strong)",
          color: "var(--ink)",
        }}
      >
        {/* Top Header */}
        <div
          className="px-5 py-4 border-b flex items-center justify-between"
          style={{ borderColor: "var(--border)", background: "var(--card-2)" }}
        >
          <div className="flex items-center gap-3">
            <span
              className="w-9 h-9 rounded-[11px] flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(180deg, var(--accent-hi), var(--accent))",
                color: "var(--accent-ink)",
              }}
            >
              <Sparkle size={18} weight="duotone" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-bold tracking-tight">Oceanic AI Advisor</h3>
                <span
                  className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                  style={{ background: "var(--good-soft)", color: "var(--good)" }}
                >
                  Ledger Grounded
                </span>
              </div>
              <p className="text-[11.5px]" style={{ color: "var(--muted)" }}>
                Deterministic arithmetic with multi-provider intelligence
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="moorly-ibtn"
            style={{ width: "32px", height: "32px" }}
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((m, idx) => {
            const isUser = m.role === "user";
            return (
              <div
                key={idx}
                className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
              >
                <div
                  className="max-w-[85%] rounded-[16px] px-4 py-3 text-[13px] leading-relaxed"
                  style={{
                    background: isUser ? "var(--accent)" : "var(--card-2)",
                    color: isUser ? "var(--accent-ink)" : "var(--ink)",
                    border: isUser ? "none" : "1px solid var(--border)",
                    borderBottomRightRadius: isUser ? "4px" : "16px",
                    borderBottomLeftRadius: !isUser ? "4px" : "16px",
                  }}
                >
                  {m.content}
                </div>
                <div className="flex items-center gap-1.5 mt-1 px-1 text-[10.5px] font-mono text-[var(--muted)]">
                  <span>{m.timestamp}</span>
                  {m.provider && <span>• {m.provider}</span>}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2 text-[12px] font-mono text-[var(--muted)] p-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              >
                <ArrowsClockwise size={14} weight="bold" />
              </motion.span>
              <span>Oceanic AI is analyzing your ledger...</span>
            </div>
          )}
        </div>

        {/* Suggested Quick Prompts */}
        <div
          className="px-4 py-2 border-t flex items-center gap-2 overflow-x-auto no-scrollbar"
          style={{ borderColor: "var(--border)", background: "var(--card-2)" }}
        >
          <span className="text-[11px] font-mono uppercase text-[var(--muted)] flex-shrink-0">
            Suggested:
          </span>
          {SAMPLE_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              type="button"
              disabled={loading}
              onClick={() => handleSend(q)}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full border transition-colors flex-shrink-0"
              style={{
                borderColor: "var(--border)",
                background: "var(--card)",
                color: "var(--ink-2)",
              }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div
          className="p-3 border-t flex items-center gap-2"
          style={{ borderColor: "var(--border)", background: "var(--card)" }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            placeholder="Ask a financial question or run a what-if scenario..."
            disabled={loading}
            className="moorly-input flex-1 h-[42px] text-[13px]"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="moorly-btn moorly-btn--primary h-[42px] px-4"
          >
            <PaperPlaneRight size={16} weight="bold" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AiAdvisorModal;
