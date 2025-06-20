
import React, { useState } from 'react';
import { ZoomIn, ZoomOut, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ImageViewerProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageViewer = ({ src, alt, isOpen, onClose }: ImageViewerProps) => {
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = alt.replace(/\s+/g, '_') + '.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetZoom = () => {
    setZoom(1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <div className="relative bg-black">
          {/* Toolbar */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-black/50 p-4 flex justify-between items-center">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleZoomIn}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleZoomOut}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleDownload}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={onClose}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Image container */}
          <div className="overflow-auto max-h-[90vh] flex items-center justify-center p-4">
            <img
              src={src}
              alt={alt}
              className="transition-transform duration-200 cursor-pointer"
              style={{ transform: `scale(${zoom})` }}
              onClick={resetZoom}
            />
          </div>

          {/* Zoom indicator */}
          <div className="absolute bottom-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
            {Math.round(zoom * 100)}%
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
