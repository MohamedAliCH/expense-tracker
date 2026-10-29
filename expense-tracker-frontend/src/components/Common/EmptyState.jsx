import React from "react";
import { motion } from "framer-motion";
import MagneticButton from "./MagneticButton";

const EmptyState = ({ icon: Icon, title, message, actionLabel, onAction }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="moorly-card flex flex-col items-center justify-center py-14 px-6 text-center w-full min-h-[260px]"
    >
      {Icon && (
        <div
          className="w-14 h-14 rounded-[16px] flex items-center justify-center mb-4"
          style={{
            background: "var(--accent-soft)",
            color: "var(--accent-text)",
            boxShadow: "inset 0 0 0 1px var(--line)",
          }}
        >
          <Icon size={28} weight="duotone" />
        </div>
      )}

      <h3 className="text-[18px] font-bold tracking-tight mb-1.5" style={{ color: "var(--ink)" }}>
        {title}
      </h3>
      <p
        className="text-[13.5px] max-w-[44ch] leading-relaxed mb-5"
        style={{ color: "var(--muted)" }}
      >
        {message}
      </p>

      {actionLabel && onAction && (
        <MagneticButton
          onClick={onAction}
          className="moorly-btn moorly-btn--primary"
        >
          {actionLabel}
        </MagneticButton>
      )}
    </motion.div>
  );
};

export default EmptyState;
