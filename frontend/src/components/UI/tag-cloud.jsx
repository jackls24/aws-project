"use client";

import React, { useState, useEffect } from "react";
import apiService from "../../services/apiService";

export function TagCloud({ userId, onTagClick, maxTags = 20 }) {
  const [popularTags, setPopularTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPopularTags();
  }, [userId]);

  const loadPopularTags = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await apiService.getPopularTags(userId, maxTags);
      setPopularTags(response.tags || []);
    } catch (error) {
      console.error("Errore durante il caricamento dei tag:", error);
      setError("Impossibile caricare i tag dal backend");
    } finally {
      setIsLoading(false);
    }
  };

  const getTagSize = (count, maxCount) => {
    const minSize = 12;
    const maxSize = 24;
    const ratio = count / maxCount;
    return minSize + (maxSize - minSize) * ratio;
  };

  const getTagColor = (count, maxCount) => {
    const ratio = count / maxCount;
    if (ratio > 0.7) return "#1f2937";
    if (ratio > 0.4) return "#4b5563";
    return "#9ca3af";
  };

  if (isLoading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <div
          style={{
            width: "24px",
            height: "24px",
            border: "2px solid #e5e7eb",
            borderTop: "2px solid #3b82f6",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto",
          }}
        />
        <p style={{ marginTop: "8px", color: "#6b7280" }}>Caricamento tag...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p style={{ color: "#ef4444", fontSize: "14px" }}>{error}</p>
      </div>
    );
  }

  if (popularTags.length === 0) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p style={{ color: "#6b7280" }}>
          Nessun tag trovato. Carica delle immagini per vedere i tag generati
          automaticamente!
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
      }}
    >
      <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "600" }}>
        Tag più Popolari
      </h3>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          alignItems: "center",
        }}
      >
        {popularTags.map((item) => (
          <button
            key={item.tag}
            onClick={() => onTagClick?.(item.tag)}
            style={{
              background: "none",
              border: "1px solid #9ca3af",
              color: "#9ca3af",
              fontSize: "14px",
              fontWeight: "400",
              padding: "4px 12px",
              borderRadius: "20px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {item.tag} ({item.count})
          </button>
        ))}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
