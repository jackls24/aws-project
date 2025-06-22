import React from "react";

export const Button = ({
  variant = "default",
  size = "default",
  className = "",
  children,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    outline: "border border-gray-300 bg-transparent hover:bg-gray-100",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    ghost: "hover:bg-gray-100 hover:text-gray-900",
    link: "underline-offset-4 hover:underline text-blue-600",
  };

  const sizes = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 rounded-md",
    lg: "h-11 px-8 rounded-md",
    icon: "h-10 w-10",
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      style={{
        backgroundColor: variant === "default" ? "#2563eb" : undefined,
        color: variant === "default" ? "white" : undefined,
        padding: size === "default" ? "8px 16px" : undefined,
        borderRadius: "6px",
        border: variant === "outline" ? "1px solid #d1d5db" : "none",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "500",
      }}
      {...props}
    >
      {children}
    </button>
  );
};
