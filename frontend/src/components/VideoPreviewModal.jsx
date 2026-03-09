import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Download, Smartphone, Maximize2 } from 'lucide-react';

export function VideoPreviewModal({ isOpen, onClose, video, rendition }) {
  const videoSrc = rendition?.outputUrl || rendition?.previewUrl || video?.videoUrl;
  const title = rendition ? `${video?.title} - ${rendition.platform}` : video?.title;

  if (!videoSrc) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/95 border-white/10">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="font-outfit font-semibold text-white truncate max-w-md">
                {title}
              </h3>
              {rendition && (
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  {rendition.processingMode}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {rendition?.outputUrl && (
                <Button
                  asChild
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border-0"
                >
                  <a href={rendition.outputUrl} download target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </a>
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Video Player */}
        <div className="relative flex items-center justify-center min-h-[400px] max-h-[80vh]">
          {rendition ? (
            // Vertical video (9:16)
            <div className="relative h-[70vh] max-h-[600px] aspect-[9/16] mx-auto">
              <video
                src={videoSrc}
                controls
                autoPlay
                className="w-full h-full object-contain rounded-lg"
                data-testid="video-preview-player"
              />
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-white/60 text-sm">
                <Smartphone className="h-4 w-4" />
                <span>Vista vertical 9:16</span>
              </div>
            </div>
          ) : (
            // Horizontal video (16:9)
            <video
              src={videoSrc}
              controls
              autoPlay
              className="w-full max-h-[70vh] object-contain"
              data-testid="video-preview-player"
            />
          )}
        </div>

        {/* Info Footer */}
        {rendition && (
          <div className="p-4 bg-black/50 border-t border-white/10">
            <div className="flex items-center justify-center gap-6 text-sm text-white/70">
              <span>Plataforma: <strong className="text-white">{rendition.platform}</strong></span>
              <span>Calidad: <strong className="text-white">{rendition.quality || 'Normal'}</strong></span>
              <span>Fondo: <strong className="text-white">{rendition.backgroundMode || 'Smart Crop'}</strong></span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
