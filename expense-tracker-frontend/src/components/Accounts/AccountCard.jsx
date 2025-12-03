import React from "react";
import { Edit2, Trash2 } from "lucide-react";
import "./Accounts.css";

const AccountCard = ({ account, onEdit, onDelete }) => {
  const balance = parseFloat(account.balance);
  const isPositive = balance >= 0;

  return (
    <div className="account-card">
      <div className="account-card-header">
        <span className="account-type-badge">
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
