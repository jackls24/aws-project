import React from "react";

export const Card = ({ children, className = "", style }) => {
  return (
    <div
      className={`rounded-lg border bg-white shadow-sm ${className}`}
      style={{
        borderRadius: "8px",
        border: "1px solid #e5e7eb",
        backgroundColor: "white",
        boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = "", style }) => {
  return (
    <div
      className={`flex flex-col space-y-1.5 p-6 ${className}`}
      style={{ padding: "24px", ...style }}
    >
      {children}
    </div>
  );
};

export const CardContent = ({ children, className = "", style }) => {
  return (
    <div
      className={`p-6 pt-0 ${className}`}
      style={{ padding: "0 24px 24px 24px", ...style }}
    >
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className = "", style }) => {
  return (
    <div
      className={`flex items-center p-6 pt-0 ${className}`}
      style={{
        padding: "0 24px 24px 24px",
        display: "flex",
        alignItems: "center",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className = "", style }) => {
  return (
    <h3
      className={`text-lg font-semibold leading-none tracking-tight ${className}`}
      style={{
        fontSize: "18px",
        fontWeight: "600",
        margin: "0 0 8px 0",
        ...style,
      }}
    >
      {children}
    </h3>
  );
};

export const CardDescription = ({ children, className = "", style }) => {
  return (
    <p
      className={`text-sm text-gray-500 ${className}`}
      style={{ fontSize: "14px", color: "#6b7280", margin: 0, ...style }}
    >
      {children}
    </p>
  );
};
