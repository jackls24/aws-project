import React from "react";

export function ImageSkeleton({ count = 6 }) {
  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "24px",
        }}
      >
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                width: "100%",
                aspectRatio: "16/9",
                backgroundColor: "#f3f4f6",
                animation: "pulse 2s infinite",
              }}
            />
            <div style={{ padding: "16px" }}>
              <div
                style={{
                  height: "20px",
                  backgroundColor: "#f3f4f6",
                  marginBottom: "8px",
                  borderRadius: "4px",
                  animation: "pulse 2s infinite",
                }}
              />
              <div
                style={{
                  height: "16px",
                  width: "60%",
                  backgroundColor: "#f3f4f6",
                  borderRadius: "4px",
                  animation: "pulse 2s infinite",
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </>
  );
}
