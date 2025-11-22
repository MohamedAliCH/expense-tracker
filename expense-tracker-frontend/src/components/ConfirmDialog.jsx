import React from "react";
import { AlertTriangle } from "lucide-react";

const ConfirmDialog = ({ show, title, message, onConfirm, onCancel }) => {
  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        zIndex: 100,
      }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#1e293b",
          borderRadius: "16px",
          padding: "32px",
          maxWidth: "400px",
          width: "100%",
          border: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "rgba(239, 68, 68, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AlertTriangle size={24} color="#ef4444" />
          </div>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "white",
              margin: 0,
            }}
          >
            {title}
          </h2>
        </div>

        <p
          style={{
            color: "#d1d5db",
            fontSize: "14px",
            marginBottom: "24px",
            lineHeight: "1.5",
          }}
        >
          {message}
        </p>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.1)",
              color: "white",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.2)",
              cursor: "pointer",
              fontWeight: "500",
              transition: "all 0.2s",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              background: "#ef4444",
              color: "white",
              padding: "12px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontWeight: "500",
              transition: "all 0.2s",
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
