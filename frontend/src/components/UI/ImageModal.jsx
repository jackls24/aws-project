import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";
import { Button } from "./button";
import { Badge } from "./badge";
import {
  Download,
  Trash2,
  Heart,
  Share2,
  Tag,
  User,
} from "lucide-react";

export default function ImageModal({
  image,
  isOpen,
  onClose,
  onDownload,
  onDelete,
  onLike,
  onShare,
  onCopyLink,
  onMoveToAlbum,
}) {
  if (!image) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-800">
            {image.title || image.name || "Untitled"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="relative group">
              <img
                src={image.url || "/placeholder.svg"}
                alt={image.title}
                className="w-full rounded-lg shadow-lg transition-transform duration-300 hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300 rounded-lg" />
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={() => onDownload(image)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 transition-all duration-200 hover:scale-105"
              >
                <Download className="h-4 w-4 mr-2" />
                Scarica
              </Button>
              <Button
                onClick={() => onLike(image.id)}
                variant="outline"
                className="flex-1 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200 hover:scale-105"
              >
                <Heart className="h-4 w-4 mr-2" />
                Mi piace ({image.likes || 0})
              </Button>
              <Button
                onClick={() => onDelete(image.id)}
                variant="destructive"
                className="flex-1 transition-all duration-200 hover:scale-105"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Elimina
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-50 rounded-lg p-4 transition-colors duration-200 hover:bg-slate-100">
              <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Informazioni
              </h3>
              <div className="space-y-3 text-slate-600">
                <div className="flex justify-between items-center">
                  <span>Autore:</span>
                  <span className="font-medium text-slate-800">
                    {image.metadata?.userid || "Unknown"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Data:</span>
                  <span className="font-medium text-slate-800">
                    {image.metadata?.upload_date
                      ? new Date(image.metadata.upload_date).toLocaleDateString("it-IT")
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Mi piace:</span>
                  <span className="font-medium text-red-600 flex items-center">
                    <Heart className="h-4 w-4 mr-1" />
                    {image.metadata?.likes || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Download:</span>
                  <span className="font-medium text-blue-600 flex items-center">
                    <Download className="h-4 w-4 mr-1" />
                    {image.metadata?.download_count || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4 transition-colors duration-200 hover:bg-green-100">
              <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
                <Tag className="h-5 w-5 mr-2 text-green-600" />
                Tag ({image.tags ? image.tags.length : 0})
              </h3>
              <div className="flex flex-wrap gap-2">
                {image.tags &&
                  image.tags.map((tag, tagIndex) => (
                    <Badge
                      key={`${image.id}-${tag}-${tagIndex}`}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition-all duration-200 cursor-pointer hover:scale-105"
                      style={{ animationDelay: `${tagIndex * 50}ms` }}
                    >
                      #{tag}
                    </Badge>
                  ))}
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4 transition-colors duration-200 hover:bg-orange-100">
              <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
                <Share2 className="h-5 w-5 mr-2 text-orange-600" />
                Azioni
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="transition-all duration-200 hover:bg-blue-50 hover:scale-105 bg-transparent"
                  onClick={() => onShare(image)}
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Condividi
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="transition-all duration-200 hover:bg-green-50 hover:scale-105 bg-transparent"
                  onClick={() => onCopyLink(image)}
                >
                  <Tag className="h-4 w-4 mr-1" />
                  Copia link
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="transition-all duration-200 hover:bg-purple-50 hover:scale-105 bg-transparent"
                  onClick={() => alert("Funzionalità in arrivo!")}
                >
                  <Heart className="h-4 w-4 mr-1" />
                  Aggiungi a preferiti
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="transition-all duration-200 hover:bg-yellow-50 hover:scale-105 bg-transparent"
                  onClick={() => alert("Segnalazione inviata!")}
                >
                  <User className="h-4 w-4 mr-1" />
                  Segnala
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="transition-all duration-200 hover:bg-indigo-50 hover:scale-105 bg-transparent"
                  onClick={() => onMoveToAlbum(image)}
                >
                  <Tag className="h-4 w-4 mr-1 text-indigo-600" />
                  Sposta in album
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
