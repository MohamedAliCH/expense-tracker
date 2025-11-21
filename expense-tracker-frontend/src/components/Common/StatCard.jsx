import React from "react";

const StatCard = ({ icon: Icon, label, amount, count, type }) => {
  // Define styles based on type
  const styles = {
    income: {
      gradient: "linear-gradient(135deg, rgba(74,222,128,0.1) 0%, rgba(34,197,94,0.05) 100%)",
      border: "rgba(74,222,128,0.2)",
      iconBg: "rgba(74,222,128,0.2)",
      color: "#4ade80",
    },
    expense: {
      gradient: "linear-gradient(135deg, rgba(248,113,113,0.1) 0%, rgba(239,68,68,0.05) 100%)",
      border: "rgba(248,113,113,0.2)",
      iconBg: "rgba(248,113,113,0.2)",
      color: "#f87171",
    },
    balance: {
      gradient: "linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(236,72,153,0.05) 100%)",
      border: "rgba(168,85,247,0.2)",
      iconBg: "rgba(168,85,247,0.2)",
      color: "#a855f7",
    },
  };

  const style = styles[type] || styles.balance;
  
  // For balance, we might want dynamic text color (green if positive, red if negative)
  // But for the card theme itself, we stick to the type color
  const amountColor = type === 'balance' 
    ? (amount >= 0 ? "#4ade80" : "#f87171") 
    : style.color;

  return (
    <div
      style={{
        background: style.gradient,
        backdropFilter: "blur(10px)",
        borderRadius: "16px",
        padding: "24px",
        border: `1px solid ${style.border}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            background: style.iconBg,
            padding: "8px",
            borderRadius: "8px",
          }}
        >
          <Icon size={24} color={style.color} />
        </div>
        <span style={{ color: "#d1d5db", fontSize: "14px" }}>{label}</span>
      </div>
      <p
        style={{
          fontSize: "32px",
          fontWeight: "bold",
          color: amountColor,
          marginBottom: "8px",
        }}
      >
        ${Math.abs(amount).toFixed(2)}
      </p>
      <p style={{ color: "#9ca3af", fontSize: "14px" }}>
        {type === 'balance' 
          ? (amount >= 0 ? "Surplus" : "Deficit")
          : `${count} transactions`
        }
      </p>
    </div>
  );
};

export default StatCard;