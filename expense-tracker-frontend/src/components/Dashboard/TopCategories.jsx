import React from "react";
import CategorySpendingList from "./CategorySpendingList";

const TopCategories = ({ categories, totalExpense }) => {
  // Get only top 5 categories
  const topCategories = categories.slice(0, 5);

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.1)",
        backdropFilter: "blur(10px)",
        borderRadius: "16px",
        padding: "24px",
        border: "1px solid rgba(255,255,255,0.2)",
      }}
    >
      <h3
        style={{
          fontSize: "20px",
          fontWeight: "bold",
          color: "white",
          marginBottom: "16px",
        }}
      >
        Top Spending Categories
      </h3>

      <CategorySpendingList
        categories={topCategories}
        totalExpense={totalExpense}
      />
    </div>
  );
};

export default TopCategories;