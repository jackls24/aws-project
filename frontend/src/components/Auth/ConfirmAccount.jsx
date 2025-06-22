import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";

const ConfirmAccount = () => {
  const [username, setUsername] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Prende l'username dalla sessione (se disponibile)
    const pendingUsername = authService.getPendingConfirmation();
    if (pendingUsername) {
      setUsername(pendingUsername);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await authService.confirmAccount(
        username,
        confirmationCode
      );
      setSuccess(
        "Account confermato con successo! Sarai reindirizzato alla pagina di login."
      );

      // Redirect alla pagina di login dopo 2 secondi
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(
        err.detail ||
          "Errore durante la conferma. Il codice potrebbe essere errato o scaduto."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!username.trim()) {
      setError("Inserisci il tuo username per richiedere un nuovo codice");
      return;
    }

    setResendLoading(true);
    setError("");
    setSuccess("");

    try {
      await authService.resendConfirmationCode(username);
      setSuccess("Un nuovo codice di conferma è stato inviato alla tua email");
    } catch (err) {
      setError(err.detail || "Errore durante l'invio del nuovo codice");
    } finally {
      setResendLoading(false);
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
      <h2 style={{ textAlign: "center", marginBottom: "24px" }}>
        Conferma Account
      </h2>

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

      {success && (
        <div
          style={{
            backgroundColor: "#d4edda",
            color: "#155724",
            padding: "10px",
            borderRadius: "4px",
            marginBottom: "16px",
          }}
        >
          {success}
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
            Codice di Conferma
          </label>
          <input
            type="text"
            value={confirmationCode}
            onChange={(e) => setConfirmationCode(e.target.value)}
            required
            placeholder="Inserisci il codice ricevuto via email"
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
          {loading ? "Conferma in corso..." : "Conferma Account"}
        </button>
      </form>

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <button
          onClick={handleResendCode}
          disabled={resendLoading}
          style={{
            background: "none",
            border: "none",
            color: "#007bff",
            cursor: resendLoading ? "not-allowed" : "pointer",
            textDecoration: "underline",
          }}
        >
          {resendLoading
            ? "Invio in corso..."
            : "Non hai ricevuto il codice? Richiedilo di nuovo"}
        </button>
      </div>
    </div>
  );
};

export default ConfirmAccount;
