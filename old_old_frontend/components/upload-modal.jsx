"use client"

import { useState } from "react"
import "./upload-modal.css"

const UploadModal = ({ onClose, onUpload }) => {
  const [uploadData, setUploadData] = useState({
    title: "",
    tags: "",
    file: null,
    preview: null,
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setUploadData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadData((prev) => ({
          ...prev,
          file: file,
          preview: e.target.result,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (uploadData.title && uploadData.file) {
      const tags = uploadData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      const newPhoto = {
        title: uploadData.title,
        tags: tags,
        url: uploadData.preview,
        size: `${(uploadData.file.size / (1024 * 1024)).toFixed(1)} MB`,
      }

      onUpload(newPhoto)
    }
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="upload-modal">
        <div className="modal-header">
          <h2>📤 Carica Nuova Foto</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="file-upload-section">
            <div className="file-input-container">
              <input type="file" id="photo-file" accept="image/*" onChange={handleFileChange} className="file-input" />
              <label htmlFor="photo-file" className="file-label">
                {uploadData.preview ? (
                  <img src={uploadData.preview || "/placeholder.svg"} alt="Preview" className="preview-image" />
                ) : (
                  <div className="upload-placeholder">
                    <span className="upload-icon">📷</span>
                    <span>Clicca per selezionare una foto</span>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="form-fields">
            <div className="field-group">
              <label htmlFor="title">Titolo *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={uploadData.title}
                onChange={handleInputChange}
                placeholder="Inserisci il titolo della foto"
                required
              />
            </div>

            <div className="field-group">
              <label htmlFor="tags">Tag</label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={uploadData.tags}
                onChange={handleInputChange}
                placeholder="natura, paesaggio, tramonto (separati da virgola)"
              />
              <small className="field-hint">Separa i tag con virgole</small>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Annulla
            </button>
            <button type="submit" className="btn btn-primary" disabled={!uploadData.title || !uploadData.file}>
              Carica Foto
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UploadModal
