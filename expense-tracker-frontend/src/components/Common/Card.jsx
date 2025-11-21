import React from "react";

const Card = ({ children, className = "", style = {} }) => {
  return (
    <div className={`glass-panel p-6 ${className}`} style={style}>
      {children}
    </div>
  );
};

export default Card;
