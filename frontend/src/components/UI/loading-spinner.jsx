import React from "react";

export function LoadingSpinner({ size = "md", className = "" }) {
  const sizes = {
    sm: "16px",
    md: "24px",
    lg: "32px",
  };

  return (
    <div
      className={className}
      style={{
        width: sizes[size],
        height: sizes[size],
        border: "2px solid #e5e7eb",
        borderTop: "2px solid #3b82f6",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        display: "inline-block",
      }}
    />
  );
}

// Aggiungi gli stili CSS per l'animazione
const style = document.createElement("style");
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);
