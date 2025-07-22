import { Card, CardContent } from "./card";
import { Button } from "./button";
import { Badge } from "./badge";
import { Download, Trash2, Heart, User, Calendar } from "lucide-react";

export default function ImageGrid({ images, onImageClick, onDownload, onDelete, onLike }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {images.map((image, index) => (
        <Card
          key={image.id}
          className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-2 bg-white/70 backdrop-blur-sm border-slate-200 animate-fade-in-up"
          style={{ animationDelay: `${index * 100}ms` }}
          onClick={() => onImageClick(image)}
        >
          <CardContent className="p-0">
            <div className="relative overflow-hidden">
              <img
                src={image.url || "/placeholder.svg"}
                alt={image.title}
                className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0 bg-white/90 hover:bg-white transition-all duration-200 hover:scale-110"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLike(image.id);
                  }}
                  title="Mi piace"
                >
                  <Heart className="h-4 w-4 text-red-500" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0 bg-white/90 hover:bg-white transition-all duration-200 hover:scale-110"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload(image);
                  }}
                  title="Scarica"
                >
                  <Download className="h-4 w-4 text-blue-500" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0 bg-white/90 hover:bg-white transition-all duration-200 hover:scale-110"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(image.id, image);
                  }}
                  title="Elimina"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>

              <div className="absolute bottom-2 left-2 flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                <div className="flex items-center space-x-1 text-white text-sm bg-black/30 rounded-full px-2 py-1">
                  <Heart className="h-3 w-3" />
                  <span>{image.likes || 0}</span>
                </div>
                <div className="flex items-center space-x-1 text-white text-sm bg-black/30 rounded-full px-2 py-1">
                  <Download className="h-3 w-3" />
                  <span>{image.downloads || 0}</span>
                </div>
              </div>
            </div>

            <div className="p-4">
  
              <div className="flex items-center text-sm text-slate-500 mb-3">
                <User className="h-3 w-3 mr-1" />
                <span className="truncate">{image.owner || "Unknown"}</span>
                <Calendar className="h-3 w-3 ml-3 mr-1" />
                <span>
                  {image.last_modified
                    ? new Date(image.last_modified).toLocaleDateString("it-IT")
                    : "N/A"}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {image.tags &&
                  image.tags.slice(0, 3).map((tag, tagIndex) => (
                    <Badge
                      key={`${image.id}-${tag}-${tagIndex}`}
                      variant="outline"
                      className="text-xs bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors duration-200"
                    >
                      {tag}
                    </Badge>
                  ))}
                {image.tags && image.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs text-slate-500">
                    +{image.tags.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}