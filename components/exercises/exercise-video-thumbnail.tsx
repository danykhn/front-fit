'use client';

import { useState } from 'react';
import { Play, Dumbbell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getYoutubeId, getYoutubeThumbnail, getYoutubeEmbedUrl } from '@/lib/video-utils';

interface ExerciseVideoThumbnailProps {
  videoUrl?: string | null;
  /** Si true, al hacer click se reemplaza la miniatura por el iframe embed (sin abrir nueva pestaña) */
  inlinePlay?: boolean;
  className?: string;
  /** Calidad de la miniatura. Por defecto 'hqdefault' */
  quality?: 'default' | 'mqdefault' | 'hqdefault' | 'sddefault' | 'maxresdefault';
  /** Muestra siempre el overlay con icono de play, incluso sin hover */
  showPlayOverlay?: boolean;
}

/**
 * Muestra la miniatura de YouTube para un video de ejercicio.
 * Si la URL no es de YouTube, muestra un placeholder con un ícono de mancuerna.
 * Si `inlinePlay` es true, al hacer click cambia a un iframe embebido (autoplay).
 */
export function ExerciseVideoThumbnail({
  videoUrl,
  inlinePlay = true,
  className,
  quality = 'hqdefault',
  showPlayOverlay = false,
}: ExerciseVideoThumbnailProps) {
  const [playing, setPlaying] = useState(false);
  const [imgError, setImgError] = useState(false);

  const youtubeId = getYoutubeId(videoUrl);
  const thumbnail = youtubeId && !imgError ? getYoutubeThumbnail(videoUrl, quality) : '';
  const embedUrl = getYoutubeEmbedUrl(videoUrl, { autoplay: true });

  // Si no hay URL de YouTube válida, mostrar placeholder
  if (!youtubeId) {
    return (
      <div
        className={cn(
          'relative aspect-video bg-secondary/50 overflow-hidden flex items-center justify-center',
          'bg-gradient-to-br from-primary/5 to-transparent',
          className,
        )}
      >
        <Dumbbell className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground/30" />
      </div>
    );
  }

  // Si está en modo reproducción inline, mostrar el iframe
  if (inlinePlay && playing) {
    return (
      <div className={cn('relative aspect-video bg-black overflow-hidden', className)}>
        <iframe
          src={embedUrl}
          title="YouTube video player"
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // Mostrar miniatura con opción de play
  return (
    <div
      className={cn(
        'relative aspect-video bg-secondary/50 overflow-hidden group/thumb cursor-pointer',
        className,
      )}
      onClick={(e) => {
        if (inlinePlay) {
          e.preventDefault();
          e.stopPropagation();
          setPlaying(true);
        }
      }}
    >
      {thumbnail ? (
        <img
          src={thumbnail}
          alt="Video thumbnail"
          loading="lazy"
          onError={() => setImgError(true)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/5 to-transparent">
          <Dumbbell className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground/30" />
        </div>
      )}

      {/* Overlay oscuro + botón play */}
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-center transition-opacity bg-black/40',
          showPlayOverlay ? 'opacity-100' : 'opacity-0 group-hover/thumb:opacity-100',
        )}
      >
        <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary shadow-lg">
          <Play className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground ml-0.5" />
        </div>
      </div>
    </div>
  );
}
