import React from "react";
import { motion } from "framer-motion";
import AnimatedNumber from "./AnimatedNumber";

const TONE_MAP = {
  balance: {
    tileClass: "moorly-kpi--sea",
    pillTone: "moorly-pill--accent",
  },
  income: {
    tileClass: "moorly-kpi--sky",
    pillTone: "moorly-pill--good",
  },
  expense: {
    tileClass: "moorly-kpi--coral",
    pillTone: "moorly-pill--bad",
  },
  rate: {
    tileClass: "moorly-kpi--sand",
    pillTone: "moorly-pill--warn",
  },
};

const StatCard = ({
  icon: Icon,
  label,
  amount,
  formattedValue,
  subtitle,
  badgeText,
  type = "balance",
  index = 0,
}) => {
  const config = TONE_MAP[type] || TONE_MAP.balance;

  const isRate = type === "rate" || formattedValue?.includes("%");
  const numericRate = isRate ? parseFloat(formattedValue || amount || 0) : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.06,
        type: "spring",
        stiffness: 380,
        damping: 30,
      }}
      whileHover={{ y: -4, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } }}
      className={`moorly-kpi ${config.tileClass}`}
    >
      <div className="moorly-kpi__label">
        <span>{label}</span>
        {Icon && (
          <span
            className="w-7 h-7 rounded-[9px] flex items-center justify-center transition-transform group-hover:scale-105"
            style={{
              background: "rgba(255, 255, 255, 0.35)",
              color: "var(--tile-ink)",
            }}
          >
            <Icon size={16} weight="duotone" />
          </span>
        )}
      </div>

      <div className="moorly-kpi__val my-2 font-mono">
        {isRate && numericRate !== null ? (
          <AnimatedNumber value={numericRate} prefix="" suffix="%" decimals={1} />
        ) : (
          <AnimatedNumber value={amount || 0} decimals={2} />
        )}
      </div>

      <div className="moorly-kpi__foot">
        <span className="truncate">{subtitle}</span>
        {badgeText && (
          <span className={`moorly-pill ${config.pillTone}`}>
            {badgeText}
          </span>
        )}
      </div>
    </motion.article>
  );
};

export default StatCard;
