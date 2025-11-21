import React from "react";
import { AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "danger",
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="glass-panel w-full max-w-md p-6 relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          <div className="flex flex-col items-center text-center">
            <div
              className={`p-3 rounded-full bg-${
                type === "danger" ? "red" : "yellow"
              }-500/20 mb-4 text-${type === "danger" ? "red" : "yellow"}-500`}
            >
              <AlertTriangle size={32} />
            </div>

            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-gray-400 mb-6">{message}</p>

            <div className="flex gap-3 w-full">
              <button
                onClick={onClose}
                className="glass-button secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className={`glass-button ${
                  type === "danger" ? "danger" : ""
                } flex-1`}
              >
                {type === "danger" ? "Delete" : "Confirm"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmationModal;
