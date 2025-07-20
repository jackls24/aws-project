import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ImageGallery } from "../.UI/image-gallery";
import { SearchBar } from "../.UI/search-bar";
import { UploadButton } from "../.UI/upload-button";
import { ImageSkeleton } from "../.UI/image-skeleton";
import { TagCloud } from "../.UI/tag-cloud";
import apiService from "../../services/apiService";
import authService from "../../services/authService";

const Dashboard = () => {
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const username = localStorage.getItem("username") || "anonymous";

  useEffect(() => {
    loadUserImages();
  }, []);

  const loadUserImages = async () => {
    setIsLoading(true);
    setError("");

    try {
      console.log("Caricamento immagini per utente:", username);

      const response = await apiService.getUserImages(username);
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
      console.log("Iniziando processo di logout...");

      const confirmLogout = window.confirm(
        "Sei sicuro di voler effettuare il logout?"
      );
      if (!confirmLogout) {
        return;
      }

      authService.logout();
    } catch (error) {
      console.error("Errore durante il logout:", error);

      authService.logoutLocal();
      navigate("/login");
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
      const response = await apiService.searchImagesByTag(username, tag);
      const filteredByTag = response.images || [];

      setFilteredImages(filteredByTag);
      console.log(
        `Trovate ${filteredByTag.length} immagini per il tag "${tag}"`
      );
    } catch (error) {
      console.error("Errore durante la ricerca per tag:", error);
      handleSearch(tag);
    }
  };

  const handleUploadComplete = (uploadedFiles) => {
    console.log("File caricati:", uploadedFiles);
    loadUserImages();
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
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 20px",
          }}
        >
          <div>
            <h1 style={{ margin: 0, color: "#333" }}>Galleria Immagini</h1>
            <p style={{ margin: "5px 0 0 0", color: "#666" }}>
              Benvenuto, {username}
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <UploadButton onUploadComplete={handleUploadComplete} />
            <button
              onClick={loadUserImages}
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

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "20px",
        }}
      >
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

        <div style={{ marginBottom: "20px" }}>
          <SearchBar onSearch={handleSearch} searchQuery={searchQuery} />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <TagCloud
            userId={username}
            onTagClick={handleTagClick}
            maxTags={15}
          />
        </div>

        <section style={{ marginBottom: "40px" }}>
          {isLoading ? (
            <ImageSkeleton />
          ) : (
            <ImageGallery images={filteredImages} />
          )}
        </section>

        <div
          style={{
            textAlign: "center",
            color: "#666",
            fontSize: "14px",
          }}
        >
          {searchQuery && (
            <p>
              Mostrando {filteredImages.length} immagini per "{searchQuery}"
            </p>
          )}
          <p>Totale immagini: {images.length}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
