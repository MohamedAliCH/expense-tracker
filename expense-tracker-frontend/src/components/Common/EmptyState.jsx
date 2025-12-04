import React from "react";
import "./EmptyState.css";

const EmptyState = ({ icon, title, message, actionLabel, onAction }) => {
  return (
    <div className="empty-state-card">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-message">{message}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="empty-state-action-btn">
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
