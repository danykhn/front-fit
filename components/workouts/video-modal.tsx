'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Play, ExternalLink, Dumbbell, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getYoutubeId, getYoutubeEmbedUrl } from '@/lib/video-utils';
import { cn } from '@/lib/utils';

interface VideoModalProps {
  videoUrl?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Título del modal (ej. nombre del ejercicio) */
  title?: string;
  /** Descripción opcional (ej. categoría o notas) */
  description?: string;
}

export function VideoModal({ videoUrl, open, onOpenChange, title, description }: VideoModalProps) {
  const youtubeId = getYoutubeId(videoUrl);
  const embedUrl = getYoutubeEmbedUrl(videoUrl, { autoplay: true });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-3 border-b border-border">
          <DialogTitle className="flex items-center gap-2 pr-8">
            <Play className="h-4 w-4 text-primary" />
            {title ?? 'Video'}
          </DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="aspect-video w-full bg-black">
          {youtubeId ? (
            <iframe
              src={embedUrl}
              title={title ?? 'Video'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-white/70 gap-2">
              <AlertCircle className="h-8 w-8" />
              <p className="text-sm">No se pudo cargar el video</p>
            </div>
          )}
        </div>

        {videoUrl && (
          <div className="p-3 border-t border-border flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground truncate flex-1">{videoUrl}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(videoUrl, '_blank')}
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1" />
              Abrir en YouTube
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface VideoButtonProps {
  videoUrl?: string | null;
  title?: string;
  description?: string;
  /** Variante: 'icon' = solo ícono circular; 'full' = botón con texto */
  variant?: 'icon' | 'full';
  className?: string;
}

/**
 * Botón que abre un modal con el video cuando se hace click.
 * Se oculta automáticamente si no hay videoUrl.
 */
export function VideoButton({
  videoUrl,
  title,
  description,
  variant = 'icon',
  className,
}: VideoButtonProps) {
  const [open, setOpen] = useState(false);

  if (!videoUrl) return null;

  return (
    <>
      {variant === 'icon' ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          title="Ver video"
          className={cn(
            'inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors',
            className,
          )}
        >
          <Play className="h-3.5 w-3.5 fill-current" />
        </button>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
          className={className}
        >
          <Play className="h-3.5 w-3.5 mr-1 fill-current" />
          Ver video
        </Button>
      )}

      <VideoModal
        videoUrl={videoUrl}
        open={open}
        onOpenChange={setOpen}
        title={title}
        description={description}
      />
    </>
  );
}
