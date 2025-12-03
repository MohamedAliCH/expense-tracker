import React, { useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";
import "./Common/Common.css";

const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle size={20} />,
    error: <XCircle size={20} />,
    warning: <AlertCircle size={20} />,
  };

  const colors = {
    success: "#10b981",
    error: "#ef4444",
    warning: "#f59e0b",
  };

  return (
    <div
      className="toast-notification"
      style={{ border: `2px solid ${colors[type]}` }}
    >
      <div style={{ color: colors[type] }}>{icons[type]}</div>
      <div className="toast-message">{message}</div>
      <button onClick={onClose} className="toast-close">
        <X size={18} />
      </button>
    </div>
  );
};

export default Toast;
