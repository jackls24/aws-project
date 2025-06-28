import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import axios from "axios";
import Dashboard from "./components/Dashboard/Dashboard";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import ConfirmAccount from "./components/Auth/ConfirmAccount";
import ProtectedRoute from "./components/ProtectedRoute";

import "./App.css";

const API_BASE_URL = "ecs-alb-backend-797512759.us-east-1.elb.amazonaws.com";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage("Seleziona un file prima di caricare");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage("Immagine caricata con successo!");
      setUploadedImages((prev) => [...prev, response.data]);
      setSelectedFile(null);

      // Reset file input
      document.getElementById("fileInput").value = "";
    } catch (error) {
      console.error("Errore upload:", error);
      setMessage("Errore durante il caricamento");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (filename) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/delete/${filename}`);
      setUploadedImages((prev) =>
        prev.filter((img) => img.filename !== filename)
      );
      setMessage("Immagine eliminata con successo");
    } catch (error) {
      console.error("Errore eliminazione:", error);
      setMessage("Erroree durante l'eliminazione");
    }
  };

  const checkApiHealth = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`);
      setMessage(`API Status. : ${response.data.status}`);
    } catch (error) {
      setMessage("API non raggiungibile ");
    }
  };

  useEffect(() => {
    checkApiHealth();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/confirm" element={<ConfirmAccount />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
