import React from "react";
import { Edit2, Trash2, Wallet, Landmark, CreditCard } from "lucide-react";
import "./Accounts.css";

const AccountCard = ({ account, onEdit, onDelete }) => {
  const balance = parseFloat(account.balance);
  const isPositive = balance >= 0;

  const getIcon = (type) => {
    switch (type) {
      case "bank":
        return <Landmark size={14} color="#4ade80" />;
      case "credit_card":
        return <CreditCard size={14} color="#f87171" />;
      case "wallet":
      default:
        return <Wallet size={14} color="#a855f7" />;
    }
  };

  return (
    <div className="account-card">
      <div className="account-card-header">
        <span className="account-type-badge">
          {getIcon(account.type)}
          {account.type.replace("_", " ")}
        </span>

        <div className="account-actions">
          <button onClick={() => onEdit(account)} className="action-btn edit">
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(account.id)}
            className="action-btn delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <h3 className="account-name">{account.name}</h3>

      <p className={`account-balance ${isPositive ? "positive" : "negative"}`}>
        ${Math.abs(balance).toFixed(2)}
      </p>

      <p className="account-status">{isPositive ? "Available" : "Owed"}</p>
    </div>
  );
};

export default AccountCard;
