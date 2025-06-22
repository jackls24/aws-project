"use client";

import React, { useState, useEffect } from "react";

export function SearchBar({ onSearch, className }) {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (query.trim()) {
        setIsSearching(true);
        onSearch(query);
        setTimeout(() => setIsSearching(false), 500);
      } else {
        onSearch("");
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [query, onSearch]);

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <div className={className} style={{ position: "relative" }}>
      <div style={{ position: "relative" }}>
        <span
          style={{
            position: "absolute",
            left: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#6b7280",
            fontSize: "16px",
          }}
        >
          🔍
        </span>
        <input
          type="text"
          placeholder="Cerca per nome o tag..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "8px 40px 8px 35px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            fontSize: "14px",
            outline: "none",
          }}
        />
        {query && (
          <button
            onClick={handleClear}
            disabled={isSearching}
            style={{
              position: "absolute",
              right: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: isSearching ? "not-allowed" : "pointer",
              fontSize: "16px",
              color: "#6b7280",
            }}
          >
            ✕
          </button>
        )}
      </div>
      {isSearching && (
        <div
          style={{
            position: "absolute",
            right: "35px",
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          <div
            style={{
              width: "16px",
              height: "16px",
              border: "2px solid #e5e7eb",
              borderTop: "2px solid #3b82f6",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
