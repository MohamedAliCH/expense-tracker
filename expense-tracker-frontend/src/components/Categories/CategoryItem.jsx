import React from "react";
import { PencilSimple, Trash, LockKey } from "@phosphor-icons/react";
import CategoryIcon from "../Common/CategoryIcon";

const CategoryItem = ({ category, onEdit, onDelete }) => {
  const color = category.color || "#2a9d8f";

  return (
    <div
      className="flex items-center justify-between p-3.5 rounded-[14px] transition-colors group"
      style={{
        background: "var(--card-2)",
        boxShadow: "inset 0 0 0 1px var(--line)",
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0"
          style={{
            backgroundColor: `${color}22`,
            color: color,
            boxShadow: "inset 0 0 0 1px var(--line)",
          }}
        >
          <CategoryIcon
            iconKey={category.emoji}
            categoryName={category.name}
            size={18}
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-bold truncate" style={{ color: "var(--ink)" }}>
              {category.name}
            </span>
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: color }}
            />
          </div>
          {Boolean(category.is_system) && (
            <span className="text-[11px] font-medium flex items-center gap-1 mt-0.5" style={{ color: "var(--muted)" }}>
              <LockKey size={11} weight="bold" /> Core program tag
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-75 group-hover:opacity-100 transition-opacity">
        {!category.is_system && (
          <>
            <button
              type="button"
              onClick={() => onEdit(category)}
              className="w-7 h-7 rounded-[8px] flex items-center justify-center hover:bg-[var(--card-3)] transition-colors"
              style={{ color: "var(--ink-2)" }}
              aria-label="Edit tag"
            >
              <PencilSimple size={15} weight="duotone" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(category.id)}
              className="w-7 h-7 rounded-[8px] flex items-center justify-center hover:bg-[var(--bad-soft)] transition-colors"
              style={{ color: "var(--bad)" }}
              aria-label="Delete tag"
            >
              <Trash size={15} weight="duotone" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CategoryItem;
