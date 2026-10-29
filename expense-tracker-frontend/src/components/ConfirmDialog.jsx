import React, { useEffect } from "react";
import { Warning } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";

const ConfirmDialog = ({ show, title, message, onConfirm, onCancel }) => {
  useEffect(() => {
    if (!show) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [show, onCancel]);

  return (
    <AnimatePresence>
      {show && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/35 backdrop-blur-[4px]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            className="moorly-modal relative z-10 w-full max-w-[420px] p-6 flex flex-col gap-4"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
          >
            <div className="flex items-start gap-3.5">
              <div
                className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--bad-soft)", color: "var(--bad)" }}
              >
                <Warning size={22} weight="duotone" />
              </div>
              <div>
                <h2
                  id="confirm-title"
                  className="text-[18px] font-bold tracking-tight"
                  style={{ color: "var(--ink)" }}
                >
                  {title}
                </h2>
                <p className="text-[13.5px] mt-1 leading-relaxed" style={{ color: "var(--ink-2)" }}>
                  {message}
                </p>
              </div>
            </div>

            <div
              className="flex items-center justify-end gap-2.5 pt-3 mt-1"
              style={{ borderTop: "1px solid var(--line)" }}
            >
              <button
                type="button"
                onClick={onCancel}
                className="moorly-btn moorly-btn--ghost"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="moorly-btn moorly-btn--danger"
              >
                Confirm removal
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
