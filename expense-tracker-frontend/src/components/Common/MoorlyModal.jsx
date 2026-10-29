import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "@phosphor-icons/react";

const MoorlyModal = ({
  show,
  onClose,
  title,
  subtitle,
  maxWidth = "max-w-[460px]",
  shake = false,
  disabled = false,
  children,
}) => {
  useEffect(() => {
    if (!show) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !disabled) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [show, onClose, disabled]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !disabled && onClose()}
            className="fixed inset-0 bg-black/35 backdrop-blur-[4px]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              x: shake ? [0, -8, 7, -5, 3, 0] : 0,
            }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className={`moorly-modal relative z-10 w-full ${maxWidth} overflow-hidden`}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: "1px solid var(--line)" }}
            >
              <div>
                <h2
                  className="text-[19px] font-bold tracking-tight"
                  style={{ color: "var(--ink)" }}
                >
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-[12px]" style={{ color: "var(--muted)" }}>
                    {subtitle}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={disabled}
                aria-label="Close dialog"
                className="moorly-ibtn !w-8 !h-8"
              >
                <X size={16} weight="bold" />
              </button>
            </div>

            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MoorlyModal;

