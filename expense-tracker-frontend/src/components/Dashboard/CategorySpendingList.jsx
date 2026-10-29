import React from "react";
import { motion } from "framer-motion";
import CategoryIcon from "../Common/CategoryIcon";

const CategorySpendingList = ({ categories = [], totalExpense = 0, currency = "$" }) => {
  return (
    <div className="flex flex-col gap-2.5">
      {categories.map((cat, index) => {
        const percentage = totalExpense > 0 ? Math.min(100, (cat.total / totalExpense) * 100) : 0;
        const barColor = cat.color || "var(--accent)";

        return (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, type: "spring", stiffness: 380, damping: 28 }}
            whileHover={{ y: -2, scale: 1.01, transition: { duration: 0.2 } }}
            key={cat.id || index}
            className="p-3.5 rounded-[14px] transition-all cursor-default"
            style={{
              background: "var(--card-2)",
              boxShadow: "inset 0 0 0 1px var(--line)",
            }}
          >
            <div className="flex items-center justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-7 h-7 rounded-[9px] flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: `${barColor}22`,
                    color: barColor,
                  }}
                >
                  <CategoryIcon
                    iconKey={cat.emoji}
                    categoryName={cat.name}
                    size={15}
                  />
                </span>
                <span className="text-[13.5px] font-semibold truncate" style={{ color: "var(--ink)" }}>
                  {cat.name}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[11.5px] font-semibold" style={{ color: "var(--muted)" }}>
                  {percentage.toFixed(0)}%
                </span>
                <span className="text-[13.5px] font-bold font-mono" style={{ color: "var(--ink)" }}>
                  {currency}{Number(cat.total || 0).toFixed(2)}
                </span>
              </div>
            </div>

            <div
              className="h-2 w-full rounded-full overflow-hidden relative"
              style={{ background: "var(--card-3)" }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.9, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full relative overflow-hidden"
                style={{ backgroundColor: barColor }}
              >
                <div
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  style={{
                    background: "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)",
                    animation: "shimmerWave 2.4s infinite ease-in-out",
                  }}
                />
              </motion.div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default CategorySpendingList;
