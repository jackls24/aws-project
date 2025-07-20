"use client";

import React, { useState, useRef } from "react";
import apiService from "../../services/apiService";

export function UploadButton({ onUploadComplete, initialFile, onClose }) {
  const [isOpen, setIsOpen] = useState(initialFile ? true : false);
  const [isUploading, setIsUploading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(initialFile || null);
  const [preview, setPreview] = useState(null);
  const [imageName, setImageName] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  // Carica anteprima se arriva un file iniziale
  React.useEffect(() => {
    if (initialFile) {
      setIsImageLoading(true);
      setSelectedFile(initialFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setIsImageLoading(false);
        setImageName(initialFile.name.split(".")[0]);
      };
      reader.readAsDataURL(initialFile);
    }
  }, [initialFile]);

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

      // Ottieni l'ID token Cognito dal localStorage/sessionStorage
      const idToken = localStorage.getItem("idToken"); // Assicurati che sia l'ID token Cognito

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
      console.log("Inizio upload del file, idToken:", idToken);
      const result = await apiService.uploadImage(formData, idToken);

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
        className="flex items-center gap-2 px-4 py-2 border border-white rounded-full text-emerald-700 font-semibold hover:bg-emerald-50 transition shadow"
        type="button"
        title="Carica"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="inline-block"
        >
          <circle
            cx="10"
            cy="10"
            r="9"
            stroke="#059669"
            strokeWidth="2"
            fill="white"
          />
          <path
            d="M10 6v8M6 10h8"
            stroke="#059669"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <span>Carica</span>
      </button>



      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 min-h-screen flex items-center justify-center p-4"
          style={{ minHeight: "100vh" }}
          onClick={() => {
            if (!isUploading) {
              setIsOpen(false);
              resetForm();
            }
          }}
        >
          <div
            className="bg-white rounded-xl max-w-md w-full p-6 shadow-lg relative animate-fade-in flex flex-col overflow-y-auto"
            style={{ maxHeight: "90vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-2">
              Carica una nuova immagine
            </h3>
            <p className="text-slate-500 text-sm mb-4">
              Seleziona un'immagine dal tuo dispositivo
            </p>

            {/* Mostra errori */}
            {uploadError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4 text-sm">
                <strong>Errore:</strong> {uploadError}
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div className="flex flex-col items-center gap-4">
                {isImageLoading ? (
                  <div className="w-full max-w-xs h-40 flex items-center justify-center bg-slate-100 rounded-lg border border-slate-200">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-2" />
                    <span className="text-slate-500 text-sm">
                      Caricamento anteprima...
                    </span>
                  </div>
                ) : preview ? (
                  <div className="w-full max-w-xs h-40 overflow-hidden rounded-lg border border-slate-200">
                    <img
                      src={preview}
                      alt="Anteprima"
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : null}

                <div className="w-full">
                  <label className="block text-sm font-medium mb-1">
                    Immagine (max 10MB)
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    className="block w-full text-sm border border-slate-300 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                </div>

                {selectedFile && !isImageLoading && (
                  <>
                    <div className="w-full">
                      <label className="block text-sm font-medium mb-1">
                        Nome visualizzato
                      </label>
                      <input
                        type="text"
                        value={imageName}
                        onChange={(e) => setImageName(e.target.value)}
                        placeholder="Nome dell'immagine"
                        disabled={isUploading}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                      />
                    </div>

                    <div className="w-full">
                      <label className="block text-sm font-medium mb-1">
                        Tag
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Aggiungi tag e premi Enter"
                          disabled={isUploading}
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm"
                        />
                        <button
                          type="button"
                          onClick={addTag}
                          disabled={isUploading}
                          className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm transition"
                        >
                          ➕
                        </button>
                      </div>
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {tags.map((tag) => (
                            <span
                              key={tag}
                              className="bg-slate-200 text-slate-700 px-2 py-1 rounded-full text-xs flex items-center gap-1"
                            >
                              {tag}
                              <button
                                onClick={() => removeTag(tag)}
                                disabled={isUploading}
                                className="ml-1 text-slate-500 hover:text-red-500 transition"
                                title="Rimuovi tag"
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
                <div className="w-full">
                  <div className="flex justify-between mb-1 text-xs text-slate-500">
                    <span>
                      {uploadProgress < 100
                        ? "Upload in corso..."
                        : "Upload completato!"}
                    </span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded">
                    <div
                      className={`h-2 rounded transition-all duration-300 ${
                        uploadProgress === 100
                          ? "bg-emerald-500"
                          : "bg-blue-500"
                      }`}
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  {uploadProgress === 100 && (
                    <p className="text-xs text-emerald-600 mt-1">
                      ✅ File caricato con successo!
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-200">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isUploading}
                className="px-4 py-2 border border-slate-300 rounded-md bg-white hover:bg-slate-50 text-slate-700 text-sm transition"
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
                className={`px-4 py-2 rounded-md text-white text-sm font-medium flex items-center gap-2 transition
                  ${
                    !selectedFile ||
                    isImageLoading ||
                    !imageName.trim() ||
                    isUploading
                      ? "bg-slate-400 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
                  }`}
              >
                {isUploading ? (
                  <>
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
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

      {/* Animazione spin per loader */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95);}
          to { opacity: 1; transform: scale(1);}
        }

        
      `}</style>
    </>
  );
}

