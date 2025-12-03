import React from "react";
import { Edit2, Trash2 } from "lucide-react";
import "./Categories.css";

const CategoryItem = ({ category, onEdit, onDelete }) => {
  return (
    <div className="category-item">
      <div className="category-item-content">
        <div
          className="category-item-icon"
          style={{ background: `${category.color}33` }}
        >
          {category.emoji || "📊"}
        </div>
        <div className="category-item-info">
          <span className="category-item-name">{category.name}</span>
          {category.is_system && (
            <span className="category-item-system-badge">🔒 System</span>
          )}
        </div>
      </div>
      <div className="category-item-actions">
        {!category.is_system && (
          <>
            <button
              onClick={() => onEdit(category)}
              className="category-item-edit-button"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => onDelete(category.id)}
              className="category-item-delete-button"
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
