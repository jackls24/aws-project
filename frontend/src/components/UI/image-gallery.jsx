"use client";

import React, { useState } from "react";
import apiService from "../../services/apiService";

export function ImageGallery({ images }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(null);

  const handleDelete = async (id) => {
    setIsActionLoading(id);

    try {
      // Trova l'immagine da eliminare
      const imageToDelete = images.find((img) => img.id === id);
      if (!imageToDelete || !imageToDelete.key) {
        throw new Error("Immagine non trovata o chiave mancante");
      }

      console.log("Eliminazione immagine:", imageToDelete.key);

      // Elimina tramite API
      await apiService.deleteImage(imageToDelete.key);

      console.log("Immagine eliminata con successo");

      // Chiudi il modal se l'immagine eliminata era quella selezionata
      if (selectedImage?.id === id) {
        setSelectedImage(null);
      }

      // Notifica il componente padre per ricaricare le immagini
      window.location.reload(); // Soluzione semplice per ora
    } catch (error) {
      console.error("Errore durante l'eliminazione:", error);
      alert(`Errore durante l'eliminazione: ${error.message}`);
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleDownload = async (url, name, id) => {
    setIsActionLoading(id);

    try {
      // Trova l'immagine da scaricare
      const imageToDownload = images.find((img) => img.id === id);
      if (!imageToDownload || !imageToDownload.key) {
        throw new Error("Immagine non trovata o chiave S3 mancante");
      }

      console.log("Download immagine S3:", imageToDownload.key);

      // Scarica da S3
      const s3Service = (await import("../../services/s3Service")).default;
      await s3Service.downloadFile(imageToDownload.key, name);
    } catch (error) {
      console.error("Errore durante il download:", error);
      alert(`Errore durante il download: ${error.message}`);
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleImageClick = (image) => {
    setIsImageLoading(true);
    setSelectedImage(image);
    setTimeout(() => setIsImageLoading(false), 500);
  };

  if (images.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "48px 0" }}>
        <p style={{ color: "#6b7280" }}>
          Nessuna immagine caricata. Carica la tua prima immagine!
        </p>
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "24px",
        }}
      >
        {images.map((image) => (
          <div
            key={image.id}
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
              cursor: "pointer",
              transition: "all 0.3s ease",
              border: "1px solid #e5e7eb",
            }}
            onClick={() => handleImageClick(image)}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow =
                "0 10px 25px -3px rgb(0 0 0 / 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 1px 3px 0 rgb(0 0 0 / 0.1)";
            }}
          >
            <div
              style={{
                position: "relative",
                aspectRatio: "16/9",
                overflow: "hidden",
              }}
            >
              <img
                src={image.url}
                alt={image.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "transform 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundColor: "rgba(0, 0, 0, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0,
                  transition: "opacity 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "0";
                }}
              >
                <span style={{ color: "white", fontSize: "24px" }}>🔍</span>
              </div>
            </div>
            <div style={{ padding: "16px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <p
                  style={{
                    fontWeight: "500",
                    margin: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {image.name}
                </p>
                <div style={{ display: "flex", gap: "8px" }}>
                  {isActionLoading === image.id ? (
                    <div
                      style={{
                        width: "16px",
                        height: "16px",
                        border: "2px solid #e5e7eb",
                        borderTop: "2px solid #3b82f6",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                      }}
                    />
                  ) : (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(image.url, image.name, image.id);
                        }}
                        style={{
                          padding: "4px",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          backgroundColor: "white",
                          cursor: "pointer",
                        }}
                        title="Scarica"
                      >
                        📥
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(image.id);
                        }}
                        style={{
                          padding: "4px",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          backgroundColor: "white",
                          cursor: "pointer",
                        }}
                        title="Elimina"
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </div>
              </div>
              {image.tags && image.tags.length > 0 && (
                <div
                  style={{
                    marginTop: "8px",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "4px",
                  }}
                >
                  {image.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        backgroundColor: "#e5e7eb",
                        color: "#374151",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedImage && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: "20px",
          }}
          onClick={() => setSelectedImage(null)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              maxWidth: "90vw",
              maxHeight: "90vh",
              overflow: "auto",
              padding: "20px",
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
                {selectedImage.name}
              </h3>
              <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>
                Visualizzazione immagine a schermo intero
              </p>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <div
                style={{
                  position: "relative",
                  aspectRatio: "16/9",
                  width: "100%",
                  maxWidth: "800px",
                  overflow: "hidden",
                  borderRadius: "8px",
                }}
              >
                {isImageLoading ? (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#f3f4f6",
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
                      <p>Caricamento immagine...</p>
                    </div>
                  </div>
                ) : (
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                )}
              </div>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span>🏷️</span>
                {selectedImage.tags?.length ? (
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}
                  >
                    {selectedImage.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          backgroundColor: "#e5e7eb",
                          color: "#374151",
                          padding: "4px 8px",
                          borderRadius: "12px",
                          fontSize: "12px",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span style={{ color: "#6b7280", fontSize: "14px" }}>
                    Nessun tag
                  </span>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "8px",
                }}
              >
                {isActionLoading === selectedImage.id ? (
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      border: "2px solid #e5e7eb",
                      borderTop: "2px solid #3b82f6",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                ) : (
                  <>
                    <button
                      onClick={() =>
                        handleDownload(
                          selectedImage.url,
                          selectedImage.name,
                          selectedImage.id
                        )
                      }
                      style={{
                        padding: "8px 16px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        backgroundColor: "white",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      📥 Scarica
                    </button>
                    <button
                      onClick={() => handleDelete(selectedImage.id)}
                      style={{
                        padding: "8px 16px",
                        border: "none",
                        borderRadius: "6px",
                        backgroundColor: "#ef4444",
                        color: "white",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      🗑️ Elimina
                    </button>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedImage(null)}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                padding: "8px",
                border: "none",
                borderRadius: "4px",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                color: "white",
                cursor: "pointer",
                fontSize: "18px",
              }}
            >
              ✕
            </button>
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
