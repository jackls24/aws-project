import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromLogout = urlParams.get("logout");

    if (fromLogout) {
      authService.logoutLocal();
      window.history.replaceState({}, document.title, "/login");
    } else {
      // Login automatico appena si apre la pagina
      authService.redirectToLogin();
    }
  }, [navigate]);

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
      <div style={{ marginBottom: "30px", textAlign: "center" }}>
        <h2 style={{ marginBottom: "20px", color: "#333" }}>
          Galleria Immagini AWS
        </h2>
        <p style={{ color: "#666", marginBottom: "30px" }}>
          Accedi con AWS Cognito per gestire le tue immagini
        </p>
      </div>

      <div style={{ margin: "30px 0", textAlign: "center" }}>
        <span style={{ color: "#007bff", fontWeight: "bold" }}>Accesso automatico in corso...</span>
      </div>

      <div
        style={{
          marginTop: "20px",
          fontSize: "14px",
          color: "#666",
          textAlign: "center",
        }}
      >
        Sarai reindirizzato alla pagina di autenticazione sicura di AWS
      </div>
    </div>
  );
};

export default Login;
