import React from "react";
import "./Dashboard.css";

const CategorySpendingList = ({ categories, totalExpense }) => {
  return (
    <div className="category-list">
      {categories.map((cat) => {
        const percentage = (cat.total / totalExpense) * 100;

        return (
          <div key={cat.id} className="category-item">
            {/* Left side: Color dot and name */}
            <div className="category-left">
              <div
                className="category-dot"
                style={{ backgroundColor: cat.color }}
              />
              <span className="category-name">{cat.name}</span>
            </div>

            {/* Right side: Progress bar and amount */}
            <div className="category-right">
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: cat.color,
                  }}
                />
              </div>

              <span className="category-amount">${cat.total.toFixed(2)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CategorySpendingList;
