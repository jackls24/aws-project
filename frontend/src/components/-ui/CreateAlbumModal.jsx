import { useState } from "react";
import apiService from "../../services/apiService";

export default function CreateAlbumModal({
  isOpen,
  onClose,
  images,
  onCreateAlbum,
  onError,
  username,
}) {
  const [newAlbumName, setNewAlbumName] = useState("");
  const [selectedForAlbum, setSelectedForAlbum] = useState([]);
  const [newAlbumError, setNewAlbumError] = useState("");

  const handleClose = () => {
    onClose();
    setNewAlbumName("");
    setSelectedForAlbum([]);
    setNewAlbumError("");
  };

  const handleCreateAlbum = async () => {
    if (!newAlbumName.trim()) {
      setNewAlbumError("Inserisci un nome per l'album.");
      return;
    }
    try {
      await apiService.createAlbum(newAlbumName, username);
      // Sposta le immagini selezionate nell'album appena creato
      for (const imgId of selectedForAlbum) {
        const img = images.find(i => i.id === imgId);
        if (img) {
          const filename = img.name || img.filename.split('/').pop();
          await apiService.moveImageToAlbum(username, filename, newAlbumName);
        }
      }
      await onCreateAlbum();
      handleClose();
    } catch (err) {
      setNewAlbumError("Errore nella creazione dell'album: " + (err?.message || ""));
      if (onError) onError(err);
    }
  };

  return (
    isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative animate-fade-in">
          <button
            className="absolute top-2 right-2 text-slate-400 hover:text-red-500 text-xl"
            onClick={handleClose}
            title="Chiudi"
          >
            ×
          </button>
          <h3 className="text-lg font-bold mb-2">Crea nuovo album</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Nome album</label>
            <input
              type="text"
              value={newAlbumName}
              onChange={e => setNewAlbumName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
              placeholder="Inserisci nome album"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Seleziona immagini</label>
            <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
              {images.map(img => (
                <div
                  key={img.id}
                  className={`border rounded-lg p-1 cursor-pointer transition-all ${
                    selectedForAlbum.includes(img.id)
                      ? "border-blue-500 ring-2 ring-blue-300"
                      : "border-slate-200"
                  }`}
                  onClick={() => {
                    setSelectedForAlbum(sel =>
                      sel.includes(img.id)
                        ? sel.filter(id => id !== img.id)
                        : [...sel, img.id]
                    );
                  }}
                >
                  <img
                    src={img.url || "/placeholder.svg"}
                    alt={img.title}
                    className="w-full h-16 object-cover rounded"
                  />
                </div>
              ))}
            </div>
          </div>
          {newAlbumError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mb-2 text-sm">
              {newAlbumError}
            </div>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <button
              className="px-4 py-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
              onClick={handleClose}
            >
              Annulla
            </button>
            <button
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              onClick={handleCreateAlbum}
            >
              Crea Album
            </button>
          </div>
        </div>
      </div>
    )
  );
}
