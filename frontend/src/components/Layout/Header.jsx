import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const authenticated = localStorage.getItem("token") !== null;
  const username = localStorage.getItem("username");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <header
      style={{
        backgroundColor: "#007bff",
        color: "white",
        padding: "1rem",
        borderBottom: "1px solid #0056b3",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link
          to="/"
          style={{
            color: "white",
            textDecoration: "none",
            fontSize: "1.5rem",
            fontWeight: "bold",
          }}
        >
          Galleria Immagini
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {authenticated ? (
            <>
              <span style={{ color: "#cce7ff" }}>Ciao, {username}!</span>
              <Link
                to="/dashboard"
                style={{
                  color: "white",
                  textDecoration: "none",
                  padding: "0.5rem 1rem",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  borderRadius: "4px",
                }}
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  background: "none",
                  border: "1px solid white",
                  color: "white",
                  padding: "0.5rem 1rem",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <nav>
              <ul
                style={{
                  display: "flex",
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                  gap: "1rem",
                }}
              >
                <li>
                  <Link
                    to="/"
                    style={{ color: "white", textDecoration: "none" }}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/login"
                    style={{ color: "white", textDecoration: "none" }}
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    to="/signup"
                    style={{
                      color: "white",
                      textDecoration: "none",
                      padding: "0.5rem 1rem",
                      border: "1px solid white",
                      borderRadius: "4px",
                    }}
                  >
                    Registrati
                  </Link>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
