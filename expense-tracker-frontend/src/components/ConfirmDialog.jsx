import React from "react";
import { AlertTriangle } from "lucide-react";
import "./Common/Common.css";

const ConfirmDialog = ({ show, title, message, onConfirm, onCancel }) => {
  if (!show) return null;

  return (
    <div className="confirm-dialog-overlay" onClick={onCancel}>
      <div
        className="confirm-dialog-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirm-dialog-header">
          <div className="confirm-dialog-icon">
            <AlertTriangle size={24} color="#ef4444" />
          </div>
          <h2 className="confirm-dialog-title">{title}</h2>
        </div>

        <p className="confirm-dialog-message">{message}</p>

        <div className="confirm-dialog-actions">
          <button onClick={onCancel} className="confirm-btn cancel">
            Cancel
          </button>
          <button onClick={onConfirm} className="confirm-btn delete">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
