import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ImageGallery } from "../UI/image-gallery";
import { SearchBar } from "../UI/search-bar";
import { UploadButton } from "../UI/upload-button";
import { ImageSkeleton } from "../UI/image-skeleton";
import { TagCloud } from "../UI/tag-cloud";
import apiService from "../../services/apiService";

// Rimosso l'interfaccia Image e sostituita con un commento
/* 
  Struttura oggetto immagine:
  {
    id: string;
    url: string;
    name: string;
    tags: string[];
    key?: string;
    lastModified?: Date;
    size?: number;
  }
*/

const Dashboard = () => {
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const username = localStorage.getItem("username") || "anonymous";

  // Carica le immagini al mount del componente
  useEffect(() => {
    loadUserImages();
  }, []);

  const loadUserImages = async () => {
    setIsLoading(true);
    setError("");

    try {
      console.log("Caricamento immagini per utente:", username);

      const response = await apiService.getUserImages(username);

      // Converti la risposta nel formato richiesto dalla galleria
      const galleryImages = response.images || [];

      setImages(galleryImages);
      setFilteredImages(galleryImages);

      console.log(`Caricate ${galleryImages.length} immagini dal backend`);
    } catch (error) {
      console.error("Errore durante il caricamento delle immagini:", error);
      setError(
        `Errore durante il caricamento delle immagini: ${error.message}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      localStorage.removeItem("username");
      localStorage.removeItem("token");
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);

    if (!query) {
      setFilteredImages(images);
    } else {
      const lowercaseQuery = query.toLowerCase();
      const filtered = images.filter(
        (image) =>
          image.name.toLowerCase().includes(lowercaseQuery) ||
          image.tags?.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
      );
      setFilteredImages(filtered);
    }
  };

  const handleTagClick = async (tag) => {
    console.log("Filtro per tag:", tag);
    setSearchQuery(tag);

    try {
      // Cerca immagini per tag tramite API
      const response = await apiService.searchImagesByTag(username, tag);
      const filteredByTag = response.images || [];

      setFilteredImages(filteredByTag);
      console.log(
        `Trovate ${filteredByTag.length} immagini per il tag "${tag}"`
      );
    } catch (error) {
      console.error("Errore durante la ricerca per tag:", error);
      // Fallback alla ricerca locale
      handleSearch(tag);
    }
  };

  const handleUploadComplete = (uploadedFiles) => {
    console.log("File caricati:", uploadedFiles);

    // Ricarica le immagini dal backend per avere i dati aggiornati
    loadUserImages();

    // Mostra messaggio di successo
    alert(`${uploadedFiles.length} immagine/i caricate con successo!`);
  };

  const checkApiHealth = async () => {
    try {
      const response = await apiService.healthCheck();
      setError("");
      console.log("API Health:", response);
    } catch (error) {
      setError("API non raggiungibile");
      console.error("API Health Error:", error);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      {/* Header della pagina */}
      <div
        style={{
          backgroundColor: "white",
          borderBottom: "1px solid #dee2e6",
          padding: "20px 0",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1 style={{ margin: "0 0 10px 0", fontSize: "2rem" }}>
              La tua Galleria
            </h1>
            <p style={{ margin: 0, color: "#6c757d" }}>
              Benvenuto, {username}!
            </p>
          </div>
          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <SearchBar onSearch={handleSearch} className="search-bar" />
            <UploadButton onUploadComplete={handleUploadComplete} />
            <button
              onClick={() => loadUserImages()}
              style={{
                padding: "8px 16px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "14px",
              }}
              title="Ricarica immagini"
            >
              🔄 Ricarica
            </button>
            <button
              onClick={checkApiHealth}
              style={{
                padding: "8px 16px",
                backgroundColor: "#17a2b8",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "14px",
              }}
              title="Test API"
            >
              🔗 Test API
            </button>
            <button
              onClick={handleSignOut}
              style={{
                padding: "10px 20px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Contenuto principale */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "20px",
        }}
      >
        {/* Errori */}
        {error && (
          <div
            style={{
              backgroundColor: "#f8d7da",
              border: "1px solid #f5c6cb",
              color: "#721c24",
              padding: "12px",
              borderRadius: "6px",
              marginBottom: "20px",
            }}
          >
            <strong>Errore:</strong> {error}
          </div>
        )}

        {/* Tag Cloud */}
        <div style={{ marginBottom: "20px" }}>
          <TagCloud
            userId={username}
            onTagClick={handleTagClick}
            maxTags={15}
          />
        </div>

        {/* Galleria Immagini */}
        <section style={{ marginBottom: "40px" }}>
          {isLoading ? (
            <ImageSkeleton />
          ) : filteredImages.length > 0 ? (
            <ImageGallery images={filteredImages} />
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                backgroundColor: "white",
                borderRadius: "8px",
              }}
            >
              <p style={{ color: "#6c757d", fontSize: "18px" }}>
                {searchQuery
                  ? `Nessuna immagine trovata per "${searchQuery}"`
                  : images.length === 0
                  ? "Nessuna immagine caricata. Carica la tua prima immagine!"
                  : "Nessun risultato trovato"}
              </p>
              {images.length === 0 && (
                <div style={{ marginTop: "20px" }}>
                  <UploadButton onUploadComplete={handleUploadComplete} />
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
