"use client"
import "./gallery.css"

const Gallery = ({ photos, onPhotoClick }) => {
  return (
    <div className="gallery">
      <div className="gallery-grid">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="photo-card"
            onClick={() => onPhotoClick(photo)}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="photo-container">
              <img src={photo.url || "/placeholder.svg"} alt={photo.title} className="photo-image" />
              <div className="photo-overlay">
                <div className="photo-info">
                  <h3 className="photo-title">{photo.title}</h3>
                  <div className="photo-tags">
                    {photo.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="tag">
                        #{tag}
                      </span>
                    ))}
                    {photo.tags.length > 3 && <span className="tag">+{photo.tags.length - 3}</span>}
                  </div>
                </div>
                <div className="photo-actions">
                  <span className="action-hint">ettagli</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {photos.length === 0 && (
        <div className="empty-gallery">
          <div className="empty-content">
            <span className="empty-icon">📷</span>
            <h3>Nessuna foto trovata</h3>
            <p>Prova a modificare i termini di ricerca</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Gallery
