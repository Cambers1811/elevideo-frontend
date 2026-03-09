import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Download, Volume2, VolumeX } from 'lucide-react';
import { useState, useRef } from 'react';

export function VideoPreviewModal({ isOpen, onClose, video, rendition }) {
  const videoSrc = rendition?.outputUrl || rendition?.previewUrl || video?.videoUrl;
  const title = rendition ? `${video?.title} - ${rendition.platform}` : video?.title;
  const isVertical = !!rendition; // Los renditions son verticales
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef(null);

  if (!videoSrc) return null;

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`p-0 overflow-hidden border-0 bg-transparent shadow-none ${isVertical ? 'max-w-md' : 'max-w-4xl'}`}>
        {isVertical ? (
          /* Phone Frame para videos verticales */
          <div className="relative flex items-center justify-center py-8">
            {/* Phone device frame */}
            <div className="relative">
              {/* Phone outer frame */}
              <div className="relative bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-[3rem] p-2 shadow-2xl shadow-black/50">
                {/* Phone inner bezel */}
                <div className="relative bg-black rounded-[2.5rem] overflow-hidden">
                  {/* Dynamic Island / Notch */}
                  <div className="absolute top-0 left-0 right-0 z-20 flex justify-center pt-3">
                    <div className="w-28 h-7 bg-black rounded-full flex items-center justify-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-zinc-800" />
                      <div className="w-3 h-3 rounded-full bg-zinc-800 ring-1 ring-zinc-700" />
                    </div>
                  </div>

                  {/* Video container */}
                  <div className="relative w-72 h-[580px] bg-black">
                    <video
                      ref={videoRef}
                      src={videoSrc}
                      controls
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                      data-testid="video-preview-player"
                    />

                    {/* Overlay header */}
                    <div className="absolute top-0 left-0 right-0 z-10 p-4 pt-12 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
                      <h3 className="font-outfit font-semibold text-white text-sm truncate">
                        {title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-white/20 text-white border-0 text-xs">
                          {rendition?.platform}
                        </Badge>
                        <Badge variant="outline" className="border-white/30 text-white text-xs">
                          {rendition?.processingMode}
                        </Badge>
                      </div>
                    </div>

                    {/* Bottom actions overlay */}
                    <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/60 to-transparent">
                      <div className="flex items-center justify-between">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-white hover:bg-white/20"
                          onClick={toggleMute}
                        >
                          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                        </Button>
                        {rendition?.outputUrl && (
                          <Button
                            asChild
                            size="sm"
                            className="bg-white text-black hover:bg-white/90"
                          >
                            <a href={rendition.outputUrl} download target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4 mr-2" />
                              Descargar
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Home indicator */}
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                    <div className="w-32 h-1 bg-white/30 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Phone side buttons */}
              <div className="absolute -left-1 top-28 w-1 h-8 bg-zinc-700 rounded-l-sm" />
              <div className="absolute -left-1 top-44 w-1 h-16 bg-zinc-700 rounded-l-sm" />
              <div className="absolute -left-1 top-64 w-1 h-16 bg-zinc-700 rounded-l-sm" />
              <div className="absolute -right-1 top-36 w-1 h-20 bg-zinc-700 rounded-r-sm" />

              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute -top-2 -right-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-sm"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Platform indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-white/50">
              Vista previa para {rendition?.platform}
            </div>
          </div>
        ) : (
          /* Standard player para videos horizontales */
          <div className="relative bg-black rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-outfit font-semibold text-white truncate max-w-md">
                    {title}
                  </h3>
                </div>
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

            {/* Video */}
            <video
              ref={videoRef}
              src={videoSrc}
              controls
              autoPlay
              className="w-full max-h-[75vh] object-contain"
              data-testid="video-preview-player"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
