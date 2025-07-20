import React from "react";
import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

const ImageSkeleton = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="overflow-hidden bg-white/70 backdrop-blur-sm border-slate-200">
          <CardContent className="p-0">
            {/* Skeleton per l'immagine */}
            <Skeleton className="w-full h-48" />
            
            <div className="p-4">
              {/* Skeleton per il titolo */}
              <Skeleton 
                className="h-5 mb-2" 
                style={{ width: `${Math.random() * 40 + 60}%` }} 
              />
              
              {/* Skeleton per le informazioni autore/data */}
              <div className="flex items-center justify-between mb-3">
                <Skeleton 
                  className="h-4" 
                  style={{ width: `${Math.random() * 30 + 40}%` }} 
                />
                <Skeleton className="h-4 w-20" />
              </div>
              
              {/* Skeleton per i tag */}
              <div className="flex flex-wrap gap-1">
                {Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map((_, tagIndex) => (
                  <Skeleton
                    key={tagIndex}
                    className="h-6 rounded-full"
                    style={{ width: `${Math.random() * 30 + 40}px` }}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ImageSkeleton;
