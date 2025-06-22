import React from "react";

export const Label = ({ children, className = "", ...props }) => {
  return (
    <label
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
      style={{
        fontSize: "14px",
        fontWeight: "500",
        marginBottom: "4px",
        display: "block",
      }}
      {...props}
    >
      {children}
    </label>
  );
};
