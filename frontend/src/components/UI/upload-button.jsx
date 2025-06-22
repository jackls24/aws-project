"use client";

import React, { useState, useRef } from "react";
import apiService from "../../services/apiService";

export function UploadButton({ onUploadComplete }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [imageName, setImageName] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setUploadError("");

    if (file) {
      // Verifica tipo file
      if (!file.type.startsWith("image/")) {
        setUploadError("Solo i file immagine sono supportati");
        return;
      }

      // Verifica dimensione (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError("Il file è troppo grande. Massimo 10MB consentiti.");
        return;
      }

      setIsImageLoading(true);
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setIsImageLoading(false);
      };
      reader.readAsDataURL(file);
      setImageName(file.name.split(".")[0]);
    } else {
      setPreview(null);
      setImageName("");
      setIsImageLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError("");

    try {
      // Preparazione del FormData
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("name", imageName);
      formData.append("tags", tags.join(","));

      // Ottieni l'ID utente dal localStorage
      const userId = localStorage.getItem("username") || "anonymous";
      formData.append("userId", userId);

      // Simula progress per UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 80) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 20;
        });
      }, 300);

      // Upload del file tramite API backend
      console.log("Inizio upload del file...");
      const result = await apiService.uploadImage(formData);
      clearInterval(progressInterval);

      if (result && result.url) {
        setUploadProgress(100);
        console.log("✅ Upload completato con successo:", result);

        // Crea oggetto immagine per la galleria
        const uploadedImage = {
          id: result.filename || result.key || Date.now(),
          url: result.url,
          name: imageName,
          tags: tags,
          key: result.filename,
          uploadedAt: new Date().toISOString(),
        };

        // Notifica il componente padre
        if (onUploadComplete) {
          onUploadComplete([uploadedImage]);
        }

        // Chiudi il modal e resetta dopo un breve delay
        setTimeout(() => {
          setIsOpen(false);
          resetForm();
        }, 1500);
      } else {
        setUploadProgress(0);
        const errorMsg = result?.error || "Errore sconosciuto durante l'upload";
        console.error("❌ Errore upload:", errorMsg);
        setUploadError(errorMsg);
      }
    } catch (error) {
      console.error("❌ Errore durante il caricamento:", error);
      setUploadProgress(0);

      let errorMsg = "Errore durante il caricamento del file";
      if (error.message) {
        errorMsg += `: ${error.message}`;
      }

      setUploadError(errorMsg);
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreview(null);
    setImageName("");
    setTags([]);
    setTagInput("");
    setUploadProgress(0);
    setUploadError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          padding: "8px 16px",
          backgroundColor: "#10b981",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "14px",
          fontWeight: "500",
        }}
      >
        📤 Carica Immagine
      </button>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: "20px",
          }}
          onClick={() => {
            if (!isUploading) {
              setIsOpen(false);
              resetForm();
            }
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              maxWidth: "500px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
              padding: "24px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ marginBottom: "16px" }}>
              <h3
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "18px",
                  fontWeight: "600",
                }}
              >
                Carica una nuova immagine
              </h3>
              <p
                style={{
                  margin: 0,
                  color: "#6b7280",
                  fontSize: "14px",
                }}
              >
                Seleziona un'immagine dal tuo dispositivo
              </p>
            </div>

            {/* Mostra errori */}
            {uploadError && (
              <div
                style={{
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#991b1b",
                  padding: "12px",
                  borderRadius: "6px",
                  marginBottom: "16px",
                  fontSize: "14px",
                  whiteSpace: "pre-line",
                  maxHeight: "150px",
                  overflow: "auto",
                }}
              >
                <strong>Errore:</strong>
                <br />
                {uploadError}
              </div>
            )}

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                {isImageLoading ? (
                  <div
                    style={{
                      width: "100%",
                      maxWidth: "400px",
                      height: "200px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#f3f4f6",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          border: "3px solid #e5e7eb",
                          borderTop: "3px solid #3b82f6",
                          borderRadius: "50%",
                          animation: "spin 1s linear infinite",
                          margin: "0 auto 8px",
                        }}
                      />
                      <p>Caricamento anteprima...</p>
                    </div>
                  </div>
                ) : preview ? (
                  <div
                    style={{
                      width: "100%",
                      maxWidth: "400px",
                      height: "200px",
                      overflow: "hidden",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <img
                      src={preview}
                      alt="Anteprima"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                ) : null}

                <div style={{ width: "100%" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      marginBottom: "4px",
                    }}
                  >
                    Immagine (max 10MB)
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  />
                </div>

                {selectedFile && !isImageLoading && (
                  <>
                    <div style={{ width: "100%" }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: "14px",
                          fontWeight: "500",
                          marginBottom: "4px",
                        }}
                      >
                        Nome visualizzato
                      </label>
                      <input
                        type="text"
                        value={imageName}
                        onChange={(e) => setImageName(e.target.value)}
                        placeholder="Nome dell'immagine"
                        disabled={isUploading}
                        style={{
                          width: "100%",
                          padding: "8px",
                          border: "1px solid #d1d5db",
                          borderRadius: "6px",
                          fontSize: "14px",
                        }}
                      />
                    </div>

                    <div style={{ width: "100%" }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: "14px",
                          fontWeight: "500",
                          marginBottom: "4px",
                        }}
                      >
                        Tag
                      </label>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Aggiungi tag e premi Enter"
                          disabled={isUploading}
                          style={{
                            flex: 1,
                            padding: "8px",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            fontSize: "14px",
                          }}
                        />
                        <button
                          type="button"
                          onClick={addTag}
                          disabled={isUploading}
                          style={{
                            padding: "8px",
                            backgroundColor: "#3b82f6",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                          }}
                        >
                          ➕
                        </button>
                      </div>

                      {tags.length > 0 && (
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "8px",
                            marginTop: "8px",
                          }}
                        >
                          {tags.map((tag) => (
                            <span
                              key={tag}
                              style={{
                                backgroundColor: "#e5e7eb",
                                color: "#374151",
                                padding: "4px 8px",
                                borderRadius: "12px",
                                fontSize: "12px",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              {tag}
                              <button
                                onClick={() => removeTag(tag)}
                                disabled={isUploading}
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  color: "#6b7280",
                                  padding: "0",
                                  borderRadius: "50%",
                                  width: "16px",
                                  height: "16px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Progress bar */}
              {isUploading && (
                <div style={{ width: "100%" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "4px",
                    }}
                  >
                    <span style={{ fontSize: "14px", color: "#6b7280" }}>
                      {uploadProgress < 100
                        ? "Upload in corso..."
                        : "Upload completato!"}
                    </span>
                    <span style={{ fontSize: "14px", color: "#6b7280" }}>
                      {uploadProgress}%
                    </span>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "8px",
                      backgroundColor: "#e5e7eb",
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${uploadProgress}%`,
                        height: "100%",
                        backgroundColor:
                          uploadProgress === 100 ? "#10b981" : "#3b82f6",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                  {uploadProgress === 100 && (
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#10b981",
                        margin: "4px 0 0 0",
                      }}
                    >
                      ✅ File caricato con successo!
                    </p>
                  )}
                </div>
              )}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "8px",
                marginTop: "24px",
                paddingTop: "16px",
                borderTop: "1px solid #e5e7eb",
              }}
            >
              <button
                onClick={() => setIsOpen(false)}
                disabled={isUploading}
                style={{
                  padding: "8px 16px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  backgroundColor: "white",
                  cursor: isUploading ? "not-allowed" : "pointer",
                  fontSize: "14px",
                }}
              >
                Annulla
              </button>

              <button
                onClick={handleUpload}
                disabled={
                  !selectedFile ||
                  isImageLoading ||
                  !imageName.trim() ||
                  isUploading
                }
                style={{
                  padding: "8px 16px",
                  backgroundColor:
                    !selectedFile ||
                    isImageLoading ||
                    !imageName.trim() ||
                    isUploading
                      ? "#9ca3af"
                      : "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor:
                    !selectedFile ||
                    isImageLoading ||
                    !imageName.trim() ||
                    isUploading
                      ? "not-allowed"
                      : "pointer",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {isUploading ? (
                  <>
                    <div
                      style={{
                        width: "16px",
                        height: "16px",
                        border: "2px solid #ffffff",
                        borderTop: "2px solid transparent",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                      }}
                    />
                    Caricamento...
                  </>
                ) : (
                  "Carica Immagine"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
