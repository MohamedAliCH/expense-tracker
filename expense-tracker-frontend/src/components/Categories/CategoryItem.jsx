import React from "react";
import { Edit2, Trash2 } from "lucide-react";

const CategoryItem = ({ category, onEdit, onDelete }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px",
        background: "rgba(255,255,255,0.05)",
        borderRadius: "8px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "8px",
            background: `${category.color}33`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
          }}
        >
          {category.emoji || "📊"}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <span style={{ color: "white", fontWeight: "500" }}>
            {category.name}
          </span>
          {category.is_system && (
            <span
              style={{
                fontSize: "11px",
                color: "#fbbf24",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              🔒 System
            </span>
          )}
        </div>
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        {!category.is_system && (
          <>
            <button
              onClick={() => onEdit(category)}
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
              onClick={() => onDelete(category.id)}
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
          </>
        )}
      </div>
    </div>
  );
};

export default CategoryItem;
