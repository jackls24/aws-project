import React from "react";
import { Navigate } from "react-router-dom";
import authService from "../services/authService";

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = authService.isLoggedIn();

  if (!isLoggedIn) {
    // Reindirizza al login se l'utente non è autenticato
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
