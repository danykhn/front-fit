/**
 * Utilidades para trabajar con URLs de videos de YouTube.
 *
 * Formatos soportados:
 *  - https://www.youtube.com/watch?v=VIDEO_ID
 *  - https://www.youtube.com/watch?v=VIDEO_ID&t=42s
 *  - https://www.youtube.com/shorts/VIDEO_ID
 *  - https://www.youtube.com/embed/VIDEO_ID
 *  - https://youtu.be/VIDEO_ID
 *  - https://youtu.be/VIDEO_ID?t=42
 *  - https://m.youtube.com/watch?v=VIDEO_ID
 */

const YOUTUBE_ID_REGEX =
  /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;

/**
 * Extrae el ID de un video de YouTube desde una URL.
 * Devuelve string vacío si la URL no es válida.
 */
export function getYoutubeId(url: string | null | undefined): string {
  if (!url) return '';
  const match = url.match(YOUTUBE_ID_REGEX);
  return match ? match[1] : '';
}

/**
 * Verifica si una URL es de YouTube y devuelve su ID.
 */
export function isYoutubeUrl(url: string | null | undefined): boolean {
  return getYoutubeId(url).length > 0;
}

export type YoutubeThumbnailQuality = 'default' | 'mqdefault' | 'hqdefault' | 'sddefault' | 'maxresdefault';

/**
 * Genera la URL de la miniatura de YouTube.
 *
 * Calidad disponibles:
 *  - default:    120x90
 *  - mqdefault:  320x180
 *  - hqdefault:  480x360
 *  - sddefault:  640x480
 *  - maxresdefault: 1280x720
 *
 * Por defecto 'hqdefault' (buena relación calidad/tamaño).
 */
export function getYoutubeThumbnail(
  url: string | null | undefined,
  quality: YoutubeThumbnailQuality = 'hqdefault',
): string {
  const id = getYoutubeId(url);
  if (!id) return '';
  return `https://img.youtube.com/vi/${id}/${quality}.jpg`;
}

/**
 * Genera la URL del embed de YouTube (iframe src).
 * Acepta opcionalmente un tiempo de inicio en segundos.
 */
export function getYoutubeEmbedUrl(
  url: string | null | undefined,
  options: { autoplay?: boolean; start?: number } = {},
): string {
  const id = getYoutubeId(url);
  if (!id) return '';
  const params = new URLSearchParams();
  if (options.autoplay) params.set('autoplay', '1');
  if (options.start) params.set('start', String(options.start));
  const qs = params.toString();
  return `https://www.youtube.com/embed/${id}${qs ? `?${qs}` : ''}`;
}
