"use client"

import { useState, useEffect } from "react"
import Navbar from "./components/navbar"
import Gallery from "./components/gallery"
import PhotoModal from "./components/photo-modal"
import UploadModal from "./components/upload-modal"
import "./app.css"

// Mock data iniziali
const initialPhotos = [
  {
    id: 1,
    url: "/placeholder.svg?height=300&width=400",
    title: "Sunset Beach",
    tags: ["nature", "sunset", "beach", "ocean"],
    uploadDate: "2024-01-15",
    size: "2.4 MB",
  },
  {
    id: 2,
    url: "/placeholder.svg?height=300&width=400",
    title: "Mountain View",
    tags: ["landscape", "mountains", "nature"],
    uploadDate: "2024-01-14",
    size: "3.1 MB",
  },
  {
    id: 3,
    url: "/placeholder.svg?height=300&width=400",
    title: "City Lights",
    tags: ["urban", "night", "city", "lights"],
    uploadDate: "2024-01-13",
    size: "1.8 MB",
  },
  {
    id: 4,
    url: "/placeholder.svg?height=300&width=400",
    title: "Forest Path",
    tags: ["nature", "forest", "trees", "path"],
    uploadDate: "2024-01-12",
    size: "2.7 MB",
  },
  {
    id: 5,
    url: "/placeholder.svg?height=300&width=400",
    title: "Ocean Waves",
    tags: ["ocean", "waves", "blue", "water"],
    uploadDate: "2024-01-11",
    size: "3.5 MB",
  },
  {
    id: 6,
    url: "/placeholder.svg?height=300&width=400",
    title: "Desert Dunes",
    tags: ["desert", "sand", "dunes", "landscape"],
    uploadDate: "2024-01-10",
    size: "2.2 MB",
  },
]

function App() {
  const [photos, setPhotos] = useState(initialPhotos)
  const [filteredPhotos, setFilteredPhotos] = useState(initialPhotos)
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Filtra le foto in base al termine di ricerca
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPhotos(photos)
    } else {
      const filtered = photos.filter(
        (photo) =>
          photo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          photo.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
      )
      setFilteredPhotos(filtered)
    }
  }, [searchTerm, photos])

  const handleSearch = (term) => {
    setSearchTerm(term)
  }

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
  }

  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo)
  }

  const handleCloseModal = () => {
    setSelectedPhoto(null)
  }

  const handleDeletePhoto = (photoId) => {
    setPhotos(photos.filter((photo) => photo.id !== photoId))
    setSelectedPhoto(null)
  }

  const handleDownloadPhoto = (photo) => {
    // Simula il download
    const link = document.createElement("a")
    link.href = photo.url
    link.download = `${photo.title}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleUploadPhoto = (newPhoto) => {
    const photo = {
      ...newPhoto,
      id: Date.now(),
      uploadDate: new Date().toISOString().split("T")[0],
    }
    setPhotos([photo, ...photos])
    setShowUploadModal(false)
  }

  return (
    <div className="app">
      <Navbar
        onSearch={handleSearch}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onUpload={() => setShowUploadModal(true)}
        isLoggedIn={isLoggedIn}
        searchTerm={searchTerm}
      />

      <main className="main-content">
        <div className="gallery-header">
          <h1>La Mia Galleria</h1>
          <p>{filteredPhotos.length} foto trovate</p>
        </div>

        <Gallery photos={filteredPhotos} onPhotoClick={handlePhotoClick} />
      </main>

      {selectedPhoto && (
        <PhotoModal
          photo={selectedPhoto}
          onClose={handleCloseModal}
          onDelete={handleDeletePhoto}
          onDownload={handleDownloadPhoto}
          isLoggedIn={isLoggedIn}
        />
      )}

      {showUploadModal && <UploadModal onClose={() => setShowUploadModal(false)} onUpload={handleUploadPhoto} />}
    </div>
  )
}

export default App
