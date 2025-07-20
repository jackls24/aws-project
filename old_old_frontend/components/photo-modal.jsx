"use client"

import { useEffect } from "react"
import "./photo-modal.css"

const PhotoModal = ({ photo, onClose, onDelete, onDownload, isLoggedIn }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [onClose])

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleDelete = () => {
    if (window.confirm("Sei sicuro di voler eliminare questa foto?")) {
      onDelete(photo.id)
    }
  }

  const handleDownload = () => {
    onDownload(photo)
  }

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="photo-modal">
        <div className="modal-header">
          <h2>{photo.title}</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-content">
          <div className="photo-section">
            <img src={photo.url || "/placeholder.svg"} alt={photo.title} className="modal-photo" />
          </div>

          <div className="info-section">
            <div className="photo-details">
              <div className="detail-item">
                <span className="detail-label">📅 Data caricamento:</span>
                <span className="detail-value">{photo.uploadDate}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">📏 Dimensione:</span>
                <span className="detail-value">{photo.size}</span>
              </div>
            </div>

            <div className="tags-section">
              <h4>🏷️ Tag</h4>
              <div className="tags-container">
                {photo.tags.map((tag) => (
                  <span key={tag} className="tag">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="actions-section">
              <button className="btn btn-primary" onClick={handleDownload}>
                📥 Scarica
              </button>
              {isLoggedIn && (
                <button className="btn btn-danger" onClick={handleDelete}>
                  🗑️ Elimina
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PhotoModal
