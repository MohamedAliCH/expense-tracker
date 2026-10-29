import React, { useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion, useReducedMotion } from "framer-motion";
import AnimatedNumber from "../Common/AnimatedNumber";
import { Waves, ChartBar, ChartPieSlice } from "@phosphor-icons/react";
import { useApp } from "../../contexts/AppContext";

const MOORLY_PALETTE = [
  "#1f7a8c",
  "#2a9d8f",
  "#d97724",
  "#c85a32",
  "#4a6fa5",
  "#bc4749",
  "#52796f",
  "#3d5a80",
];

const GlowingDot = (props) => {
  const { cx, cy, stroke } = props;
  if (!cx || !cy) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={10} fill={stroke} fillOpacity={0.25} />
      <circle cx={cx} cy={cy} r={5.5} fill={stroke} />
      <circle cx={cx} cy={cy} r={3} fill="#ffffff" stroke={stroke} strokeWidth={1.5} />
    </g>
  );
};

const CustomChartTooltip = ({ active, payload, currency = "$" }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const income = Number(data.income || 0);
    const expense = Number(data.expense || 0);
    const net = income - expense;
    const isSurplus = net >= 0;

    return (
      <div
        className="p-3.5 rounded-[14px] flex flex-col gap-2 min-w-[180px] shadow-2xl"
        style={{
          background: "var(--glass-strong)",
          backdropFilter: "blur(20px)",
          border: "1px solid var(--line-2)",
          boxShadow: "0 16px 36px -10px rgba(0, 0, 0, 0.35), inset 0 1px 0 var(--glass-hi)",
        }}
      >
        <div className="flex items-center justify-between pb-1.5" style={{ borderBottom: "1px solid var(--line)" }}>
          <span className="text-[12px] font-bold tracking-tight" style={{ color: "var(--ink)" }}>
            {data.month} Summary
          </span>
          <span className={`moorly-pill !py-0 !px-1.5 !text-[10px] ${isSurplus ? "moorly-pill--good" : "moorly-pill--bad"}`}>
            {isSurplus ? "Surplus" : "Deficit"}
          </span>
        </div>

        <div className="flex flex-col gap-1 text-[12px]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5" style={{ color: "var(--muted)" }}>
              <span className="w-2 h-2 rounded-full" style={{ background: "var(--good)" }} />
              Inflow:
            </span>
            <strong className="font-mono" style={{ color: "var(--good)" }}>
              +{currency}{income.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </strong>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5" style={{ color: "var(--muted)" }}>
              <span className="w-2 h-2 rounded-full" style={{ background: "var(--bad)" }} />
              Outflow:
            </span>
            <strong className="font-mono" style={{ color: "var(--bad)" }}>
              -{currency}{expense.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </strong>
          </div>

          <div className="flex items-center justify-between pt-1 mt-0.5" style={{ borderTop: "1px dashed var(--line)" }}>
            <span style={{ color: "var(--ink-2)", fontWeight: 600 }}>Net Position:</span>
            <strong className="font-mono text-[12.5px]" style={{ color: isSurplus ? "var(--good)" : "var(--bad)" }}>
              {isSurplus ? "" : "-"}{currency}{Math.abs(net).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </strong>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({ active, payload, currency = "$" }) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div
        className="p-3 rounded-[12px] shadow-xl flex items-center gap-2.5"
        style={{
          background: "var(--glass-strong)",
          backdropFilter: "blur(18px)",
          border: "1px solid var(--line-2)",
          boxShadow: "0 12px 30px -8px rgba(0, 0, 0, 0.3)",
        }}
      >
        <span
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ background: item.payload.fill || item.color }}
        />
        <div className="flex flex-col leading-tight">
          <span className="text-[12px] font-semibold" style={{ color: "var(--ink)" }}>
            {item.name}
          </span>
          <span className="text-[13px] font-bold font-mono" style={{ color: "var(--ink-2)" }}>
            {currency}{Number(item.value || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const ChartSection = ({
  title,
  subtitle,
  type = "bar",
  data = [],
  colors = [],
}) => {
  const { currency = "$" } = useApp() || {};
  const prefersReducedMotion = useReducedMotion();
  const activeColors = colors.length > 0 ? colors : MOORLY_PALETTE;
  const [chartView, setChartView] = useState("spline");
  const [activeMetric, setActiveMetric] = useState("net");
  const [activeSliceIndex, setActiveSliceIndex] = useState(null);

  const enrichedData = data.map((d) => ({
    ...d,
    net: Number(d.income || 0) - Number(d.expense || 0),
  }));

  const totalNet = enrichedData.reduce((acc, d) => acc + (d.net || 0), 0);
  const totalInflow = enrichedData.reduce((acc, d) => acc + Number(d.income || 0), 0);
  const totalOutflow = enrichedData.reduce((acc, d) => acc + Number(d.expense || 0), 0);
  const totalPieValue = data.reduce((acc, d) => acc + Number(d.value || 0), 0);

  const hasChartData =
    type === "bar"
      ? enrichedData.length > 0 && (totalInflow > 0 || totalOutflow > 0)
      : data.length > 0 && totalPieValue > 0;

  const heroAmount =
    activeMetric === "net"
      ? totalNet
      : activeMetric === "income"
      ? totalInflow
      : activeMetric === "expense"
      ? totalOutflow
      : totalNet;

  const heroLabel =
    activeMetric === "net"
      ? "Net Cashflow"
      : activeMetric === "income"
      ? "Total Inflow"
      : activeMetric === "expense"
      ? "Total Outflow"
      : "Net Position";

  const activeSlice =
    activeSliceIndex !== null && data[activeSliceIndex] ? data[activeSliceIndex] : null;

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header with Title and Mode Switchers */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 mb-3.5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[17px] font-bold tracking-tight" style={{ color: "var(--ink)" }}>
              {title}
            </h3>
            {type === "bar" && (
              <span className="moorly-pill moorly-pill--accent !text-[11px] !py-0.5">
                Wave Trend
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-[12.5px] font-medium mt-0.5" style={{ color: "var(--muted)" }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Controls for Monthly Trend Chart */}
        {type === "bar" && (
          <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap max-w-full">
            <div className="moorly-seg !p-0.5">
              <button
                type="button"
                onClick={() => setChartView("spline")}
                className={`moorly-seg__btn !py-1 !px-2 !text-[11.5px] ${
                  chartView === "spline" ? "is-active" : ""
                }`}
                title="Undulating Spline Wave Chart"
              >
                {chartView === "spline" && (
                  <motion.span
                    layoutId="chartViewPill"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    className="absolute inset-0 rounded-[7px]"
                    style={{
                      background: "var(--card)",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.12), inset 0 0 0 1px var(--line)",
                    }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1 font-semibold">
                  <Waves size={13} weight="bold" />
                  <span>Wave</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => setChartView("bar")}
                className={`moorly-seg__btn !py-1 !px-2 !text-[11.5px] ${
                  chartView === "bar" ? "is-active" : ""
                }`}
                title="Segmented Bar Chart"
              >
                {chartView === "bar" && (
                  <motion.span
                    layoutId="chartViewPill"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    className="absolute inset-0 rounded-[7px]"
                    style={{
                      background: "var(--card)",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.12), inset 0 0 0 1px var(--line)",
                    }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1 font-semibold">
                  <ChartBar size={13} weight="bold" />
                  <span>Bars</span>
                </span>
              </button>
            </div>

            <div className="moorly-seg !p-0.5 overflow-x-auto hide-scrollbar">
              {[
                { id: "net", label: "Net" },
                { id: "income", label: "Inflow" },
                { id: "expense", label: "Outflow" },
                { id: "both", label: "Both" },
              ].map((m) => {
                const active = activeMetric === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setActiveMetric(m.id)}
                    className={`moorly-seg__btn !py-1 !px-2 !text-[11px] ${active ? "is-active" : ""}`}
                  >
                    {active && (
                      <motion.span
                        layoutId="chartMetricPill"
                        transition={{ type: "spring", stiffness: 420, damping: 32 }}
                        className="absolute inset-0 rounded-[7px]"
                        style={{
                          background: "var(--card)",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.12), inset 0 0 0 1px var(--line)",
                        }}
                      />
                    )}
                    <span className="relative z-10 font-semibold">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Hero Metric Banner */}
      {type === "bar" && (
        <div className="flex items-baseline justify-between mb-3 px-1 flex-wrap gap-2">
          <div className="flex items-baseline gap-2.5">
            <span
              className="text-[26px] sm:text-[32px] font-bold font-mono tracking-tight leading-none"
              style={{
                color:
                  activeMetric === "expense"
                    ? "var(--bad)"
                    : activeMetric === "income"
                    ? "var(--good)"
                    : heroAmount >= 0
                    ? "var(--ink)"
                    : "var(--bad)",
              }}
            >
              <AnimatedNumber value={heroAmount} decimals={2} />
            </span>
            <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted)" }}>
              {heroLabel} across cycle
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-[11.5px] font-semibold">
            {(activeMetric === "income" || activeMetric === "both") && (
              <span className="flex items-center gap-1.5" style={{ color: "var(--good)" }}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--good)" }} />
                Inflows
              </span>
            )}
            {(activeMetric === "expense" || activeMetric === "both") && (
              <span className="flex items-center gap-1.5" style={{ color: "var(--bad)" }}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--bad)" }} />
                Outflows
              </span>
            )}
            {activeMetric === "net" && (
              <span className="flex items-center gap-1.5" style={{ color: "var(--accent)" }}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--accent)" }} />
                Net Cashflow
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main Chart Canvas */}
      {!hasChartData ? (
        <div
          className="flex-1 w-full min-h-[240px] flex flex-col items-center justify-center text-center p-6 rounded-[14px]"
          style={{ background: "var(--card-2)", border: "1px dashed var(--line-2)" }}
        >
          <div
            className="w-10 h-10 rounded-[12px] flex items-center justify-center mb-2.5"
            style={{ background: "var(--accent-soft)", color: "var(--accent-text)" }}
          >
            {type === "bar" ? <Waves size={20} weight="duotone" /> : <ChartPieSlice size={20} weight="duotone" />}
          </div>
          <p className="text-[14px] font-bold" style={{ color: "var(--ink)" }}>
            No chart activity yet
          </p>
          <p className="text-[12px] mt-0.5 max-w-[240px]" style={{ color: "var(--muted)" }}>
            Record income or expense transactions to visualize your financial trends.
          </p>
        </div>
      ) : type === "bar" ? (
        <div className="flex-1 w-full min-h-[260px] h-[270px]">
          <ResponsiveContainer width="100%" height="100%">
            {chartView === "spline" ? (
              <AreaChart
                data={enrichedData}
                margin={{ top: 12, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="oceanWaveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.38} />
                    <stop offset="60%" stopColor="var(--accent)" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.0} />
                  </linearGradient>

                  <linearGradient id="goodWaveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--good)" stopOpacity={0.35} />
                    <stop offset="70%" stopColor="var(--good)" stopOpacity={0.06} />
                    <stop offset="100%" stopColor="var(--good)" stopOpacity={0.0} />
                  </linearGradient>

                  <linearGradient id="badWaveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--bad)" stopOpacity={0.35} />
                    <stop offset="70%" stopColor="var(--bad)" stopOpacity={0.06} />
                    <stop offset="100%" stopColor="var(--bad)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--line-2)"
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  stroke="var(--muted)"
                  tick={{ fill: "var(--muted)", fontSize: 12, fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                  dy={8}
                />

                <YAxis
                  stroke="var(--muted)"
                  tick={{ fill: "var(--muted)", fontSize: 12, fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${currency}${val}`}
                />

                <Tooltip
                  content={<CustomChartTooltip currency={currency} />}
                  cursor={{ stroke: "var(--line)", strokeWidth: 1.5, strokeDasharray: "4 4" }}
                />

                {activeMetric === "net" && (
                  <Area
                    type="monotone"
                    dataKey="net"
                    name="Net Cashflow"
                    stroke="var(--accent)"
                    strokeWidth={3}
                    fill="url(#oceanWaveGrad)"
                    isAnimationActive={!prefersReducedMotion}
                    animationDuration={1300}
                    animationEasing="ease-out"
                    activeDot={<GlowingDot stroke="var(--accent)" />}
                  />
                )}

                {(activeMetric === "income" || activeMetric === "both") && (
                  <Area
                    type="monotone"
                    dataKey="income"
                    name="Inflow"
                    stroke="var(--good)"
                    strokeWidth={2.5}
                    fill="url(#goodWaveGrad)"
                    isAnimationActive={!prefersReducedMotion}
                    animationDuration={1300}
                    animationEasing="ease-out"
                    activeDot={<GlowingDot stroke="var(--good)" />}
                  />
                )}

                {(activeMetric === "expense" || activeMetric === "both") && (
                  <Area
                    type="monotone"
                    dataKey="expense"
                    name="Outflow"
                    stroke="var(--bad)"
                    strokeWidth={2.5}
                    fill="url(#badWaveGrad)"
                    isAnimationActive={!prefersReducedMotion}
                    animationDuration={1300}
                    animationEasing="ease-out"
                    activeDot={<GlowingDot stroke="var(--bad)" />}
                  />
                )}
              </AreaChart>
            ) : (
              <BarChart data={enrichedData} margin={{ top: 12, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--line-2)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  stroke="var(--muted)"
                  tick={{ fill: "var(--muted)", fontSize: 12, fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                  dy={8}
                />
                <YAxis
                  stroke="var(--muted)"
                  tick={{ fill: "var(--muted)", fontSize: 12, fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${currency}${value}`}
                />
                <Tooltip content={<CustomChartTooltip currency={currency} />} cursor={{ fill: "var(--card-2)" }} />

                {(activeMetric === "income" || activeMetric === "both") && (
                  <Bar
                    dataKey="income"
                    fill="var(--good)"
                    radius={[6, 6, 0, 0]}
                    barSize={20}
                    isAnimationActive={!prefersReducedMotion}
                    animationDuration={1000}
                  />
                )}
                {(activeMetric === "expense" || activeMetric === "both") && (
                  <Bar
                    dataKey="expense"
                    fill="var(--bad)"
                    radius={[6, 6, 0, 0]}
                    barSize={20}
                    isAnimationActive={!prefersReducedMotion}
                    animationDuration={1000}
                  />
                )}
                {activeMetric === "net" && (
                  <Bar
                    dataKey="net"
                    fill="var(--accent)"
                    radius={[6, 6, 0, 0]}
                    barSize={24}
                    isAnimationActive={!prefersReducedMotion}
                    animationDuration={1000}
                  />
                )}
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      ) : (
        /* Category Distribution Donut with Center Total & Interactive Legend */
        <div className="flex flex-col flex-1 justify-between gap-2">
          <div className="relative w-full h-[215px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={56}
                  outerRadius={88}
                  paddingAngle={3}
                  stroke="none"
                  isAnimationActive={!prefersReducedMotion}
                  animationDuration={1100}
                  animationEasing="ease-out"
                  onMouseEnter={(_, idx) => setActiveSliceIndex(idx)}
                  onMouseLeave={() => setActiveSliceIndex(null)}
                >
                  {data.map((entry, index) => {
                    const isDimmed =
                      activeSliceIndex !== null && activeSliceIndex !== index;
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color || activeColors[index % activeColors.length]}
                        style={{
                          opacity: isDimmed ? 0.35 : 1,
                          transition: "opacity 0.2s ease",
                          outline: "none",
                        }}
                      />
                    );
                  })}
                </Pie>
                <Tooltip content={<CustomPieTooltip currency={currency} />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Donut Metric Overlay */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center px-4">
              <span
                className="text-[10.5px] font-semibold uppercase tracking-wider truncate max-w-[100px]"
                style={{ color: "var(--muted)" }}
              >
                {activeSlice ? activeSlice.name : "Total Spent"}
              </span>
              <span
                className="text-[16px] font-bold font-mono tracking-tight mt-0.5"
                style={{ color: "var(--ink)" }}
              >
                {currency}
                {Number(activeSlice ? activeSlice.value : totalPieValue).toLocaleString(
                  "en-US",
                  { minimumFractionDigits: 0, maximumFractionDigits: 0 }
                )}
              </span>
            </div>
          </div>

          {/* Interactive Compact Category Legend */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
            {data.slice(0, 6).map((entry, idx) => {
              const color = entry.color || activeColors[idx % activeColors.length];
              const isSelected = activeSliceIndex === idx;
              const pct =
                totalPieValue > 0
                  ? Math.round((Number(entry.value || 0) / totalPieValue) * 100)
                  : 0;
              return (
                <button
                  key={entry.id || entry.name || idx}
                  type="button"
                  onMouseEnter={() => setActiveSliceIndex(idx)}
                  onMouseLeave={() => setActiveSliceIndex(null)}
                  onClick={() =>
                    setActiveSliceIndex((prev) => (prev === idx ? null : idx))
                  }
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-[8px] text-[11px] font-semibold transition-all"
                  style={{
                    background: isSelected ? "var(--card-3)" : "var(--card-2)",
                    color: "var(--ink-2)",
                    boxShadow: isSelected
                      ? `inset 0 0 0 1px ${color}`
                      : "inset 0 0 0 1px var(--line)",
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: color }}
                  />
                  <span className="truncate max-w-[90px]">{entry.name}</span>
                  <span className="font-mono text-[10.5px]" style={{ color: "var(--muted)" }}>
                    {pct}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartSection;
