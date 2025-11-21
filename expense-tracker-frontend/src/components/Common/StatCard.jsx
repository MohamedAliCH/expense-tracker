import React from "react";

const StatCard = ({ title, amount, icon: Icon, color, count }) => {
  const colorClasses = {
    green: {
      bg: "from-green-500/20 to-green-600/20",
      border: "border-green-500/30",
      text: "text-green-400",
      icon: "text-green-400",
    },
    red: {
      bg: "from-red-500/20 to-red-600/20",
      border: "border-red-500/30",
      text: "text-red-400",
      icon: "text-red-400",
    },
    blue: {
      bg: "from-blue-500/20 to-blue-600/20",
      border: "border-blue-500/30",
      text: "text-blue-400",
      icon: "text-blue-400",
    },
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div
      className={`bg-gradient-to-br ${colors.bg} backdrop-blur-lg rounded-2xl p-6 border ${colors.border}`}
    >
      <div className="flex items-center gap-3 mb-2">
        <Icon className={`w-6 h-6 ${colors.icon}`} />
        <span className="text-gray-300 font-medium">{title}</span>
      </div>
      <p className={`text-3xl font-bold ${colors.text}`}>
        ${amount?.toFixed(2) || "0.00"}
      </p>
      <p className="text-sm text-gray-400 mt-1">{count}</p>
    </div>
  );
};

export default StatCard;
