"use client";

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Chiudi il menu quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Errore durante il logout:", error);
    }
  };

  const getUserInitial = () => {
    if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return "U";
  };

  const getUserDisplayName = () => {
    return user?.username || "Utente";
  };

  return (
    <div style={{ position: "relative" }} ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          backgroundColor: "white",
          borderRadius: "8px",
          border: "1px solid #d1d5db",
          padding: "8px 12px",
          fontSize: "14px",
          fontWeight: "500",
          color: "#374151",
          boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            height: "32px",
            width: "32px",
            borderRadius: "50%",
            backgroundColor: "#4f46e5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "500",
          }}
        >
          {getUserInitial()}
        </div>
        <span style={{ display: window.innerWidth > 768 ? "block" : "none" }}>
          {getUserDisplayName()}
        </span>
        <svg
          style={{
            height: "16px",
            width: "16px",
            color: "#9ca3af",
            transition: "transform 200ms",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            right: 0,
            marginTop: "8px",
            width: "224px",
            borderRadius: "6px",
            backgroundColor: "white",
            boxShadow:
              "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)",
            border: "1px solid #e5e7eb",
            zIndex: 50,
          }}
        >
          <div style={{ padding: "4px 0" }}>
            <div
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid #f3f4f6",
              }}
            >
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#111827",
                  margin: 0,
                }}
              >
                {getUserDisplayName()}
              </p>
            </div>
            <button
              onClick={handleLogout}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "8px 16px",
                fontSize: "14px",
                color: "#374151",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f9fafb";
                e.currentTarget.style.color = "#111827";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#374151";
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <svg
                  style={{
                    marginRight: "12px",
                    height: "16px",
                    width: "16px",
                    color: "#9ca3af",
                  }}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
