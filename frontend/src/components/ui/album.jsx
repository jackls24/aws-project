import { useState } from "react";
import { ChevronRight, Eye } from "lucide-react";

export default function Album({ tag, images, onImageClick, open, onToggle, onDeleteAlbum }) {
  const [imageHover, setImageHover] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <div className="group">
      {/* Album Container */}
      <div
        className={`relative overflow-hidden rounded-2xl border cursor-pointer transition-all duration-300 ${
          open ? "shadow-xl border-gray-200" : "shadow-sm border-gray-100"
        } bg-gradient-to-br from-white to-slate-50 hover:shadow-md hover:border-gray-200`}
        onClick={() => onToggle(tag)}
      >
        {/* Main Content Area */}
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                {tag}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {images.length} {images.length === 1 ? "photo" : "photos"}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              {/* Delete Button */}
              {onDeleteAlbum && (
                <button
                  className="group/delete relative flex items-center justify-center w-8 h-8 bg-red-100 rounded-full border border-red-200 transition-all duration-300 hover:w-24 hover:px-3 hover:bg-red-200"
                  onClick={async (e) => {
                    e.stopPropagation();
                    setIsDeleting(true);
                    await onDeleteAlbum(tag);
                    setIsDeleting(false);
                  }}
                  title="Elimina album"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <svg
                      className="animate-spin h-5 w-5 text-red-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                  ) : (
                    <>
                      <span className="absolute text-gray-600 text-lg font-bold transition-all group-hover/delete:opacity-0">
                        ×
                      </span>
                      <span className="ml-0 text-xs font-semibold opacity-0 group-hover/delete:opacity-100 group-hover/delete:ml-3 text-gray-700 transition-all duration-200 whitespace-nowrap">
                        Elimina
                      </span>
                    </>
                  )}
                </button>
              )}

              {/* Chevron */}
              <ChevronRight
                className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                  open ? "rotate-90" : "group-hover:translate-x-1"
                }`}
              />
            </div>
          </div>

          {/* Thumbnails */}
          <div className="flex items-center space-x-3 mb-4">
            {images.length === 0 ? (
              <div className="flex items-center justify-center w-14 h-14 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                <span className="text-xs font-medium text-gray-400">Vuoto</span>
              </div>
            ) : (
              <>
                {images.slice(0, 3).map((img, idx) => (
                  <div
                    key={img.id}
                    className="relative w-14 h-14 rounded-xl overflow-hidden shadow-sm"
                    style={{ animationDelay: `${idx * 80}ms` }}
                  >
                    <img
                      src={img.url || "/placeholder.svg"}
                      alt={img.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                  </div>
                ))}
                {images.length > 3 && (
                  <div className="flex items-center justify-center w-14 h-14 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                    <span className="text-xs font-medium text-gray-500">
                      +{images.length - 3}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>{open ? "Click to collapse" : "Click to expand"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Gallery */}
      {open && (
        <div className="mt-4 bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6">
            {images.length === 0 ? (
              <div className="text-center text-gray-400 py-8 text-lg">
                Nessuna immagine in questo album
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {images.map((img, idx) => (
                  <div
                    key={img.id}
                    className="group/item relative aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer shadow-sm hover:shadow-lg transition-shadow"
                    style={{
                      animationDelay: `${idx * 40}ms`,
                      animation: `slideUp 0.4s ease-out both`,
                    }}
                    onMouseEnter={() => setImageHover(img.id)}
                    onMouseLeave={() => setImageHover(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      onImageClick(img);
                    }}
                  >
                    <img
                      src={img.url || "/placeholder.svg"}
                      alt={img.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-110"
                    />
                    {/* Overlay */}
                    <div
                      className={`absolute inset-0 bg-black/0 group-hover/item:bg-black/20 transition-all duration-300 flex items-center justify-center ${
                        imageHover === img.id ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 transform scale-75 group-hover/item:scale-100 transition-transform duration-300">
                        <Eye className="w-5 h-5 text-gray-700" />
                      </div>
                    </div>
                    {/* Image info */}
                    {imageHover === img.id && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                        <p className="text-white text-sm font-medium truncate">
                          {img.title || "Untitled"}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
