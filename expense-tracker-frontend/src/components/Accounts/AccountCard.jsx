import React from "react";
import { Edit2, Trash2 } from "lucide-react";

const AccountCard = ({ account, onEdit, onDelete }) => {
  const balance = parseFloat(account.balance);
  const isPositive = balance >= 0;

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.1)",
        backdropFilter: "blur(10px)",
        borderRadius: "16px",
        padding: "24px",
        border: "1px solid rgba(255,255,255,0.2)",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <span
          style={{
            color: "#d1d5db",
            fontSize: "14px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {account.type.replace("_", " ")}
        </span>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => onEdit(account)}
            style={{
              background: "rgba(168,85,247,0.2)",
              border: "none",
              borderRadius: "6px",
              padding: "6px",
              cursor: "pointer",
              color: "#a855f7",
            }}
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(account.id)}
            style={{
              background: "rgba(239,68,68,0.2)",
              border: "none",
              borderRadius: "6px",
              padding: "6px",
              cursor: "pointer",
              color: "#ef4444",
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <h3
        style={{
          fontSize: "20px",
          fontWeight: "bold",
          color: "white",
          marginBottom: "8px",
        }}
      >
        {account.name}
      </h3>

      <p
        style={{
          fontSize: "30px",
          fontWeight: "bold",
          color: isPositive ? "#4ade80" : "#f87171",
        }}
      >
        ${Math.abs(balance).toFixed(2)}
      </p>

      <p
        style={{
          color: "#9ca3af",
          fontSize: "14px",
          marginTop: "8px",
        }}
      >
        {isPositive ? "Available" : "Owed"}
      </p>
    </div>
  );
};

export default AccountCard;