export function cloudinaryVideo(url: string): string {
  if (!url || !url.includes('cloudinary.com')) return url;
  // best quality, force H.264 (avc1) — universally playable; cap at 1080p width.
  // NB: f_auto serves HEVC to Apple UAs, which breaks inline autoplay on many phones.
  return url.replace('/upload/', '/upload/q_auto:best,vc_h264,w_1920/');
}

export function cloudinaryVideoMobile(url: string): string {
  if (!url || !url.includes('cloudinary.com')) return url;
  // phones — native 1080p width at good quality, H.264 (autoplay-safe everywhere)
  return url.replace('/upload/', '/upload/q_auto:good,vc_h264,w_1920/');
}

// SVG logos don't benefit from raster conversion — pass through as-is.
export function vercelImage(path: string, width = 300): string {
  if (!path || path.endsWith('.svg')) return path;
  return `/_vercel/image?url=${encodeURIComponent(path)}&w=${width}&q=80`;
}

export function cloudinaryPoster(url: string): string {
  if (!url || !url.includes('cloudinary.com')) return '';
  return url
    .replace('/upload/', '/upload/q_auto,f_jpg,so_0/')
    .replace(/\.(mp4|mov|webm)$/i, '.jpg');
}
