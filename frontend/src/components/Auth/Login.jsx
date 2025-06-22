import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../../services/authService";

const Login = () => {
  const [username, setUsername] = useState("giacomo1000@live.it");
  const [password, setPassword] = useState("Password1234!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authService.login(username, password);

      // Verifica se c'è un errore nella risposta
      if (response.error) {
        throw new Error(response.error);
      }

      console.log("Login completato:", response);

      // Salva i token
      if (response.AccessToken) {
        localStorage.setItem("token", response.AccessToken); // Per API Cognito
      }

      if (response.IdToken) {
        localStorage.setItem("idToken", response.IdToken); // Per Identity Pool
      }

      if (response.Credentials) {
        // Salva le credenziali AWS temporanee
        localStorage.setItem(
          "aws_access_key",
          response.Credentials.AccessKeyId
        );
        localStorage.setItem("aws_secret_key", response.Credentials.SecretKey);
        localStorage.setItem(
          "aws_session_token",
          response.Credentials.SessionToken
        );
        localStorage.setItem("aws_expiration", response.Credentials.Expiration);
      }

      // Salva username e altri dati
      localStorage.setItem("username", username);

      if (response.RefreshToken) {
        localStorage.setItem("refreshToken", response.RefreshToken);
      }

      navigate("/dashboard");
    } catch (err) {
      console.error("Errore login:", err);
      setError(err.message || "Errore durante il login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "100px auto",
        padding: "20px",
        backgroundColor: "#fff",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "24px" }}>Accedi</h2>

      {error && (
        <div
          style={{
            backgroundColor: "#f8d7da",
            color: "#721c24",
            padding: "10px",
            borderRadius: "4px",
            marginBottom: "16px",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "16px" }}>
          <label
            style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}
          >
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ddd",
            }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label
            style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}
          >
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ddd",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Accesso in corso..." : "Accedi"}
        </button>
      </form>

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        Non hai un account?{" "}
        <Link to="/signup" style={{ color: "#007bff" }}>
          Registrati
        </Link>
      </div>
    </div>
  );
};

export default Login;
