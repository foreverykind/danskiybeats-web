export function cloudinaryVideo(url: string): string {
  if (!url || !url.includes('cloudinary.com')) return url;
  // best quality + auto format + cap at 1080p width
  return url.replace('/upload/', '/upload/q_auto:best,f_auto,w_1920/');
}

export function cloudinaryVideoMobile(url: string): string {
  if (!url || !url.includes('cloudinary.com')) return url;
  // lighter variant for phones — narrower + good quality (fast, autoplay-safe)
  return url.replace('/upload/', '/upload/q_auto:good,f_auto,w_854/');
}

export function cloudinaryPoster(url: string): string {
  if (!url || !url.includes('cloudinary.com')) return '';
  return url
    .replace('/upload/', '/upload/q_auto,f_jpg,so_0/')
    .replace(/\.(mp4|mov|webm)$/i, '.jpg');
}
