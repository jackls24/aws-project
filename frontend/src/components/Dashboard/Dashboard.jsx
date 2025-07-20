import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../services/apiService";
import authService from "../../services/authService";
import UploadButton from "../ui/upload-button";
import NavigationBar from "../ui/navigation-bar";
import MoveToAlbumModal from "../ui/move-to-album-modal";
import ImageSkeleton from "../ui/image-skeleton";
import AlbumSection from "../ui/AlbumSection";
import ImageGrid from "../ui/ImageGrid";
import ImageModal from "../ui/ImageModal";
import CreateAlbumModal from "../ui/CreateAlbumModal";
import ErrorMessage from "../ui/ErrorMessage";
import EmptyState from "../ui/EmptyState";
import DragDropUpload from "../ui/DragDropUpload";

export default function Dashboard() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "anonymous";

  // Core state
  const [images, setImages] = useState([]);
  const [album, setAlbum] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewAlbumOpen, setIsNewAlbumOpen] = useState(false);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Album and image management
  const [openedAlbumTag, setOpenedAlbumTag] = useState(null);
  const [imageToMove, setImageToMove] = useState(null);
  const [draggedFile, setDraggedFile] = useState(null);

  useEffect(() => {
    loadUserImages();
  }, []);

  const loadUserImages = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await apiService.getUserImages(username);
      setImages(response.images || []);
      setAlbum(response.album || []);
    } catch (error) {
      console.error("Errore durante il caricamento delle immagini:", error);
      setError(`Errore durante il caricamento delle immagini: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredImages = useMemo(() => {
    if (!searchTerm) return images;
    return images.filter(
      (image) =>
        (image.title && image.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (image.tags && image.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))) ||
        (image.author && image.author.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [images, searchTerm]);

  const albumByTag = useMemo(() => {
    const albumMap = {};
    images.forEach((img) => {
      if (img.tags && img.tags.length > 0) {
        img.tags.forEach((tag) => {
          if (!albumMap[tag]) albumMap[tag] = [];
          albumMap[tag].push(img);
        });
      }
    });
    return albumMap;
  }, [images]);

  const handleSignOut = async () => {
    try {
      const confirmLogout = window.confirm("Sei sicuro di voler effettuare il logout?");
      if (!confirmLogout) return;

      authService.logout();
      navigate("/login");
    } catch (error) {
      console.error("Errore durante il logout:", error);
      authService.logoutLocal();
      navigate("/login");
    }
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  const handleDownload = (image) => {
    const link = document.createElement("a");
    link.href = image.url;
    link.download = `${(image.title || image.name || "image").replace(/\s+/g, "_")}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setImages((prev) =>
      prev.map((img) =>
        img.id === image.id ? { ...img, downloads: (img.downloads || 0) + 1 } : img
      )
    );

    if (selectedImage && selectedImage.id === image.id) {
      setSelectedImage((prev) => ({
        ...prev,
        downloads: (prev.downloads || 0) + 1,
      }));
    }
  };

  const handleDelete = async (imageId, imageObj) => {
    const image = imageObj || selectedImage;
    const filename = selectedImage?.name || image?.name;
    const owner = selectedImage?.owner || username;
    
    setIsModalOpen(false);
    setSelectedImage(null);
    
    await apiService.client.delete(`/api/images/${owner}/${filename}`);
    loadUserImages();
  };

  const handleLike = (imageId) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === imageId ? { ...img, likes: (img.likes || 0) + 1 } : img
      )
    );
    
    if (selectedImage && selectedImage.id === imageId) {
      setSelectedImage((prev) => ({ ...prev, likes: (prev.likes || 0) + 1 }));
    }
  };

  const handleShare = (image) => {
    const title = image.title || image.name || "Untitled";
    if (navigator.share) {
      navigator.share({
        title: title,
        text: `Guarda questa bellissima immagine: ${title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copiato negli appunti!");
    }
  };

  const handleCopyLink = (image) => {
    const imageUrl = `${window.location.origin}${image.url}`;
    navigator.clipboard.writeText(imageUrl).then(() => {
      alert("Link dell'immagine copiato negli appunti!");
    });
  };

  const handleDeleteAlbum = async (albumName) => {
    try {
      await apiService.deleteAlbum(albumName, username);
      await loadUserImages();
    } catch (err) {
      setError("Errore nell'eliminazione dell'album: " + (err?.message || ""));
    }
  };

  const handleToggleAlbum = (tag) => {
    setOpenedAlbumTag((prev) => (prev === tag ? null : tag));
  };

  const handleOpenMoveModal = (image) => {
    setImageToMove(image);
    setMoveModalOpen(true);
  };

  const handleCloseMoveModal = () => {
    setMoveModalOpen(false);
    setImageToMove(null);
  };

  const handleMoveToAlbum = async (albumName) => {
    if (!imageToMove || !albumName) return;
    const filename = imageToMove.name || imageToMove.filename;
    
    try {
      await apiService.moveImageToAlbum(username, filename, albumName);
      handleCloseMoveModal();
      await loadUserImages();
    } catch (err) {
      setError("Errore nello spostamento dell'immagine: " + (err?.message || ""));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setDraggedFile(file);
      setShowUploadModal(true);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    setDraggedFile(null);
  };

  const handleUploadComplete = () => {
    setShowUploadModal(false);
    setDraggedFile(null);
    loadUserImages();
  };

  return (
    <DragDropUpload onDrop={handleDrop} onDragOver={handleDragOver}>
      {showUploadModal && (
        <UploadButton
          onUploadComplete={handleUploadComplete}
          initialFile={draggedFile}
          onClose={handleCloseUploadModal}
        />
      )}

      <NavigationBar
        isLoading={isLoading}
        filteredImages={filteredImages}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        username={username}
        handleSignOut={handleSignOut}
        loadUserImages={loadUserImages}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AlbumSection
          albumByTag={albumByTag}
          album={album}
          openedAlbumTag={openedAlbumTag}
          onImageClick={handleImageClick}
          onToggleAlbum={handleToggleAlbum}
          onDeleteAlbum={handleDeleteAlbum}
          onCreateAlbum={() => setIsNewAlbumOpen(true)}
        />

        <ErrorMessage error={error} />

        {isLoading ? (
          <ImageSkeleton count={12} />
        ) : filteredImages.length === 0 ? (
          <EmptyState searchTerm={searchTerm} />
        ) : (
          <ImageGrid
            images={filteredImages}
            onImageClick={handleImageClick}
            onDownload={handleDownload}
            onDelete={handleDelete}
            onLike={handleLike}
          />
        )}
      </main>

      <ImageModal
        image={selectedImage}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDownload={handleDownload}
        onDelete={handleDelete}
        onLike={handleLike}
        onShare={handleShare}
        onCopyLink={handleCopyLink}
        onMoveToAlbum={handleOpenMoveModal}
      />

      <CreateAlbumModal
        isOpen={isNewAlbumOpen}
        onClose={() => setIsNewAlbumOpen(false)}
        images={images}
        onCreateAlbum={loadUserImages}
        onError={setError}
        username={username}
      />

      <MoveToAlbumModal
        open={moveModalOpen}
        onClose={handleCloseMoveModal}
        albums={album}
        onMove={handleMoveToAlbum}
        image={imageToMove}
      />
    </DragDropUpload>
  );
}