import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";

export default function MoveToAlbumModal({ open, onClose, albums, onMove, image }) {
  const [selectedAlbum, setSelectedAlbum] = useState("");
  const [error, setError] = useState("");

  const handleMove = () => {
    if (!selectedAlbum) {
      setError("Seleziona un album");
      return;
    }
    onMove(selectedAlbum);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Sposta in album</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Seleziona album</label>
          <select
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
            value={selectedAlbum}
            onChange={e => {
              setSelectedAlbum(e.target.value);
              setError("");
            }}
          >
            <option value="">-- Seleziona --</option>
            {albums.map(album => (
              <option key={album.albumName || album} value={album.albumName || album}>
                {album.albumName || album}
              </option>
            ))}
          </select>
          {error && <div className="text-red-600 text-xs mt-2">{error}</div>}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Annulla</Button>
          <Button onClick={handleMove}>Sposta</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
