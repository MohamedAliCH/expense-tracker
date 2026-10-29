import React, { useEffect } from "react";
import { CheckCircle, XCircle, WarningCircle, X } from "@phosphor-icons/react";
import { motion } from "framer-motion";

const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3200);
    return () => clearTimeout(timer);
  }, [onClose]);

  const toneMap = {
    success: {
      icon: CheckCircle,
      color: "var(--good)",
      bg: "var(--good-soft)",
    },
    error: {
      icon: XCircle,
      color: "var(--bad)",
      bg: "var(--bad-soft)",
    },
    warning: {
      icon: WarningCircle,
      color: "var(--warn)",
      bg: "var(--warn-soft)",
    },
  };

  const config = toneMap[type] || toneMap.success;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 420, damping: 30 }}
      className="moorly-modal flex items-center gap-3 px-4 py-3 !rounded-[14px]"
    >
      <span
        className="w-7 h-7 rounded-[9px] flex items-center justify-center flex-shrink-0"
        style={{ background: config.bg, color: config.color }}
      >
        <Icon size={17} weight="fill" />
      </span>
      <span className="text-[13.5px] font-semibold" style={{ color: "var(--ink)" }}>
        {message}
      </span>
      <button
        type="button"
        onClick={onClose}
        className="ml-2 p-1 rounded-[7px] hover:bg-[var(--card-3)] transition-colors"
        style={{ color: "var(--muted)" }}
      >
        <X size={14} weight="bold" />
      </button>
    </motion.div>
  );
};

export default Toast;
