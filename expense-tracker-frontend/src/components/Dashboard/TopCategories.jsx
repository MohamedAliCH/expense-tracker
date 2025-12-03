import React from "react";
import CategorySpendingList from "./CategorySpendingList";
import "./Dashboard.css";

const TopCategories = ({ categories, totalExpense }) => {
  // Get only top 5 categories
  const topCategories = categories.slice(0, 5);

  return (
    <div className="top-categories-card">
      <h3 className="top-categories-title">Top Spending Categories</h3>

      <CategorySpendingList
        categories={topCategories}
        totalExpense={totalExpense}
      />
    </div>
  );
};

export default TopCategories;
