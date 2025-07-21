import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import authService from "../../services/authService";

const Callback = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const hasProcessed = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      if (hasProcessed.current) {
        return;
      }

      try {
        const urlParams = new URLSearchParams(location.search);
        const code = urlParams.get("code");
        const error = urlParams.get("error");
        const errorDescription = urlParams.get("error_description");

        if (error) {
          throw new Error(
            `${error}: ${errorDescription || "Errore di autenticazione"}`
          );
        }

        if (!code) {
          throw new Error("Nessun codice di autorizzazione ricevuto");
        }

        hasProcessed.current = true;

        const tokens = await authService.exchangeCodeForTokens(code);

        localStorage.setItem("token", tokens.access_token);
        localStorage.setItem("idToken", tokens.id_token);
        localStorage.setItem("refreshToken", tokens.refresh_token);

        const userInfo = authService.parseIdToken(tokens.id_token);
        localStorage.setItem("username", userInfo.email || userInfo.username);

        window.history.replaceState({}, document.title, "/callback");

        setTimeout(() => {
          navigate("/dashboard");
        }, 500);
      } catch (err) {
        setError(err.message || err.detail || "Errore sconosciuto");

        localStorage.removeItem("token");
        localStorage.removeItem("idToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("username");

        //setTimeout(() => navigate("/login"), 3000);
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [location.search, navigate]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
        }}
      >
        <div style={{ marginBottom: "20px" }}>Autenticazione in corso...</div>
        <div style={{ fontSize: "14px", color: "#666" }}>
          Scambio del codice di autorizzazione con i token
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
        }}
      >
        <div
          style={{ color: "red", marginBottom: "20px", textAlign: "center" }}
        >
          <h3>Errore di autenticazione</h3>
          <p>{error}</p>
        </div>
        <div>Reindirizzamento al login in 3 secondi...</div>
        <button
          onClick={() => navigate("/login")}
          style={{
            marginTop: "10px",
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Torna al Login
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <div>Reindirizzamento alla dashboard...</div>
    </div>
  );
};

export default Callback;
