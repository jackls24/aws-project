import React from "react";

export const Alert = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-blue-50 border-blue-200 text-blue-800",
    destructive: "bg-red-50 border-red-200 text-red-800",
  };

  return (
    <div
      className={`relative w-full rounded-lg border p-4 ${variants[variant]} ${className}`}
      style={{
        backgroundColor: variant === "destructive" ? "#fef2f2" : "#eff6ff",
        border: `1px solid ${
          variant === "destructive" ? "#fecaca" : "#bfdbfe"
        }`,
        color: variant === "destructive" ? "#991b1b" : "#1e40af",
        padding: "16px",
        borderRadius: "8px",
        marginBottom: "16px",
      }}
    >
      {children}
    </div>
  );
};

export const AlertDescription = ({ children }) => {
  return (
    <div className="text-sm" style={{ fontSize: "14px" }}>
      {children}
    </div>
  );
};
