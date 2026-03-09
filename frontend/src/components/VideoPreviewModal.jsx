import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Download, Clock, Scissors } from 'lucide-react';
import { useState, useRef } from 'react';

function formatTime(seconds) {
  if (seconds === null || seconds === undefined) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function VideoPreviewModal({ isOpen, onClose, video, rendition }) {
  const videoSrc = rendition?.outputUrl || rendition?.previewUrl || video?.videoUrl;
  const title = rendition ? `${video?.title}` : video?.title;
  const isVertical = !!rendition;

  if (!videoSrc) return null;

  // Calcular tiempo de fin del segmento
  const segmentStart = rendition?.segmentStart;
  const segmentDuration = rendition?.segmentDuration;
  const segmentEnd = (segmentStart !== undefined && segmentDuration) 
    ? segmentStart + segmentDuration 
    : null;

  const isShort = rendition?.processingMode?.includes('short');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`p-0 overflow-hidden border-0 bg-transparent shadow-none ${isVertical ? 'max-w-sm' : 'max-w-4xl'}`}>
        {isVertical ? (
          /* Phone Frame para videos verticales */
          <div className="relative flex flex-col items-center gap-4 py-4">
            {/* Header con título y botón cerrar */}
            <div className="flex items-center justify-between w-full px-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-outfit font-semibold text-white text-lg truncate">
                  {title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0 text-xs capitalize">
                    {rendition?.platform}
                  </Badge>
                  <Badge variant="outline" className="border-white/30 text-white/80 text-xs">
                    {rendition?.processingMode?.replace('_', ' ')}
                  </Badge>
                  <Badge variant="outline" className="border-white/30 text-white/80 text-xs capitalize">
                    {rendition?.quality}
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white/70 hover:text-white hover:bg-white/10 rounded-full flex-shrink-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Info del segmento para shorts */}
            {isShort && segmentStart !== undefined && (
              <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm">
                <Scissors className="h-4 w-4 text-purple-400" />
                <span className="text-white/90 text-sm">
                  <span className="text-white/60">Inicio:</span> {formatTime(segmentStart)}
                </span>
                <span className="text-white/40">→</span>
                <span className="text-white/90 text-sm">
                  <span className="text-white/60">Fin:</span> {formatTime(segmentEnd)}
                </span>
                <span className="text-white/40">|</span>
                <Clock className="h-4 w-4 text-blue-400" />
                <span className="text-white/90 text-sm">
                  {segmentDuration}s
                </span>
              </div>
            )}

            {/* Phone device frame - 80% size */}
            <div className="relative scale-[0.8] origin-top">
              {/* Phone outer frame */}
              <div className="relative bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-900 rounded-[2.5rem] p-1.5 shadow-2xl shadow-black/60">
                {/* Subtle shine effect */}
                <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />
                
                {/* Phone inner bezel */}
                <div className="relative bg-black rounded-[2.2rem] overflow-hidden">
                  {/* Small notch - más discreto */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20">
                    <div className="w-20 h-5 bg-black rounded-full flex items-center justify-center gap-2 border border-zinc-800/50">
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-800 ring-1 ring-zinc-700/50" />
                    </div>
                  </div>

                  {/* Video container */}
                  <div className="relative w-64 h-[520px] bg-black">
                    <video
                      src={videoSrc}
                      controls
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                      data-testid="video-preview-player"
                    />
                  </div>

                  {/* Home indicator */}
                  <div className="absolute bottom-1.5 left-0 right-0 flex justify-center pointer-events-none">
                    <div className="w-28 h-1 bg-white/20 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Phone side buttons - más sutiles */}
              <div className="absolute -left-0.5 top-24 w-0.5 h-6 bg-zinc-600 rounded-l-sm" />
              <div className="absolute -left-0.5 top-36 w-0.5 h-12 bg-zinc-600 rounded-l-sm" />
              <div className="absolute -left-0.5 top-52 w-0.5 h-12 bg-zinc-600 rounded-l-sm" />
              <div className="absolute -right-0.5 top-32 w-0.5 h-16 bg-zinc-600 rounded-r-sm" />
            </div>

            {/* Botón de descarga estilizado - fuera del video */}
            {rendition?.outputUrl && (
              <Button
                asChild
                className="w-64 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all"
              >
                <a href={rendition.outputUrl} download target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar para {rendition?.platform}
                </a>
              </Button>
            )}

            {/* Info adicional */}
            <div className="text-xs text-white/40 text-center">
              Fondo: {rendition?.backgroundMode?.replace('_', ' ')} • Creado: {new Date(rendition?.createdAt).toLocaleDateString()}
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
