import React from "react";

const CategorySpendingList = ({ categories, totalExpense }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {categories.map((cat) => {
        const percentage = (cat.total / totalExpense) * 100;

        return (
          <div
            key={cat.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* Left side: Color dot and name */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flex: 1,
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: cat.color,
                }}
              />
              <span style={{ color: "white", fontWeight: "500" }}>
                {cat.name}
              </span>
            </div>

            {/* Right side: Progress bar and amount */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                flex: 1,
              }}
            >
              <div
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "9999px",
                  height: "8px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "8px",
                    borderRadius: "9999px",
                    width: `${percentage}%`,
                    backgroundColor: cat.color,
                    transition: "width 0.3s ease",
                  }}
                />
              </div>

              <span
                style={{
                  color: "#f87171",
                  fontWeight: "bold",
                  minWidth: "96px",
                  textAlign: "right",
                }}
              >
                ${cat.total.toFixed(2)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CategorySpendingList;