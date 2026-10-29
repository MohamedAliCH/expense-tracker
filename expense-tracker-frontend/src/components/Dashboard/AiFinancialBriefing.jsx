import React, { useState, useEffect } from "react";
import {
  Sparkle,
  ArrowsClockwise,
  ShieldCheck,
  TrendUp,
  WarningCircle,
  Plus,
  ArrowRight,
  ChatCircleDots,
} from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { getAiAnalysis } from "../../utils/api";
import { useNavigate } from "react-router-dom";

const AiFinancialBriefing = ({ currency = "$", onOpenAdvisor, onOpenBudgetModal }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchAnalysis = async (forceRefresh = false) => {
    if (forceRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await getAiAnalysis(forceRefresh);
      if (res?.data) {
        setData(res.data);
      }
    } catch (err) {
      setError(err?.userMessage || "Unable to generate AI financial analysis.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalysis(false);
  }, []);

  const handleActionClick = (rec) => {
    if (rec.action_type === "create_budget") {
      if (onOpenBudgetModal) {
        onOpenBudgetModal({
          category_id: rec.category_id,
          suggested_amount: rec.suggested_amount,
        });
      } else {
        navigate("/budgets");
      }
    } else if (rec.action_type === "view_ledger") {
      navigate(`/transactions${rec.category_id ? `?category=${rec.category_id}` : ""}`);
    } else if (rec.action_type === "view_accounts") {
      navigate("/accounts");
    }
  };

  if (loading) {
    return (
      <div className="moorly-card flex items-center justify-between p-5 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-[var(--card-2)]" />
          <div className="space-y-2">
            <div className="w-48 h-4 rounded bg-[var(--card-2)]" />
            <div className="w-72 h-3 rounded bg-[var(--card-2)]" />
          </div>
        </div>
        <div className="w-24 h-8 rounded-[10px] bg-[var(--card-2)]" />
      </div>
    );
  }

  if (error || !data) {
    return null; // Graceful degrade if server offline
  }

  const providerLabel = {
    gemini: "Gemini 2.5 Flash",
    openai: "GPT-4o Mini",
    groq: "Groq Llama-3.3",
    heuristic: "Oceanic Engine",
  }[data.provider_used] || "Oceanic AI";

  return (
    <div
      className="moorly-card relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, var(--card), var(--card-2))",
        borderColor: "var(--border-strong)",
      }}
    >
      {/* Subtle glowing ambient gradient */}
      <div
        className="absolute -top-24 -right-24 w-64 h-64 rounded-full pointer-events-none opacity-20 blur-3xl"
        style={{ background: "var(--accent)" }}
      />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <span
            className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
            style={{
              background: "linear-gradient(180deg, var(--accent-hi), var(--accent))",
              color: "var(--accent-ink)",
              boxShadow: "0 6px 16px -4px var(--accent)",
            }}
          >
            <Sparkle size={20} weight="duotone" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[16px] font-bold tracking-tight" style={{ color: "var(--ink)" }}>
                Oceanic Intelligence Briefing
              </h2>
              <span
                className="text-[10.5px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider"
                style={{
                  background: "var(--card-2)",
                  color: "var(--muted)",
                  border: "1px solid var(--border)",
                }}
              >
                {providerLabel}
              </span>
            </div>
            <p className="text-[12.5px] font-medium" style={{ color: "var(--muted)" }}>
              {data.headline}
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onOpenAdvisor && (
            <button
              type="button"
              onClick={onOpenAdvisor}
              className="moorly-btn moorly-btn--sm moorly-btn--ghost"
              style={{ height: "34px", padding: "0 12px" }}
            >
              <ChatCircleDots size={16} weight="duotone" />
              <span>Ask Advisor</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => fetchAnalysis(true)}
            disabled={refreshing}
            className="moorly-ibtn"
            title="Refresh AI Analysis"
            style={{ width: "34px", height: "34px" }}
          >
            <motion.span
              animate={{ rotate: refreshing ? 360 : 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="flex items-center justify-center"
            >
              <ArrowsClockwise size={16} weight="bold" />
            </motion.span>
          </button>
        </div>
      </div>

      {/* Main content grid: Diagnosis & Health Score */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-4">
        {/* Left: Health Score & Executive Diagnosis */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} weight="duotone" style={{ color: "var(--good)" }} />
              <span className="text-[12px] font-semibold tracking-wide uppercase" style={{ color: "var(--muted)" }}>
                Capital Efficiency Score
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-mono text-[36px] font-extrabold tracking-tight" style={{ color: "var(--ink)" }}>
                {data.score}
              </span>
              <span className="text-[14px] font-mono" style={{ color: "var(--muted)" }}>
                / 100
              </span>
            </div>

            <p className="text-[13px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
              {data.diagnosis}
            </p>
          </div>

          {/* Anomaly highlights */}
          {Array.isArray(data.anomalies) && data.anomalies.length > 0 && (
            <div className="pt-2 border-t border-[var(--border)] space-y-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted)]">
                Radar Watchlist
              </span>
              <ul className="space-y-1">
                {data.anomalies.map((anom, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-[12px]" style={{ color: "var(--ink-2)" }}>
                    <WarningCircle
                      size={14}
                      weight="duotone"
                      className="flex-shrink-0 mt-0.5"
                      style={{ color: "var(--warm)" }}
                    />
                    <span>{anom}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right: High-Agency Actionable Recommendations */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold tracking-wide uppercase" style={{ color: "var(--muted)" }}>
              Actionable Capital Optimizations
            </span>
            <span className="text-[11px] font-mono text-[var(--accent)] flex items-center gap-1">
              <TrendUp size={13} weight="bold" />
              1-Click Execution
            </span>
          </div>

          <div className="space-y-2.5">
            {Array.isArray(data.recommendations) &&
              data.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="p-3 rounded-[12px] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 border"
                  style={{
                    background: "var(--card-2)",
                    borderColor: "var(--border)",
                  }}
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13.5px] font-bold" style={{ color: "var(--ink)" }}>
                        {rec.title}
                      </span>
                      {rec.impact && (
                        <span
                          className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                          style={{
                            background: "var(--good-soft)",
                            color: "var(--good)",
                          }}
                        >
                          {rec.impact}
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] leading-relaxed" style={{ color: "var(--muted)" }}>
                      {rec.description}
                    </p>
                  </div>

                  {rec.action_type && rec.action_type !== "none" && (
                    <button
                      type="button"
                      onClick={() => handleActionClick(rec)}
                      className="moorly-btn moorly-btn--sm moorly-btn--ghost self-start sm:self-auto flex-shrink-0"
                      style={{ height: "32px", padding: "0 10px", fontSize: "12px" }}
                    >
                      {rec.action_type === "create_budget" ? (
                        <>
                          <Plus size={13} weight="bold" />
                          <span>Set Cap</span>
                        </>
                      ) : (
                        <>
                          <span>Inspect</span>
                          <ArrowRight size={13} weight="bold" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              ))}
          </div>

          {/* Projected trajectory footer */}
          {data.forecast && (
            <div
              className="text-[11.5px] font-mono px-3 py-1.5 rounded-[8px] flex items-center justify-between"
              style={{ background: "var(--card-2)", color: "var(--muted)" }}
            >
              <span>{data.forecast}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiFinancialBriefing;
