export function cloudinaryVideo(url: string): string {
  if (!url || !url.includes('cloudinary.com')) return url;
  // eco quality + auto format (webm/vp9 to Chrome) + cap at 1080p width
  return url.replace('/upload/', '/upload/q_auto:eco,f_auto,w_1920/');
}

export function cloudinaryPoster(url: string): string {
  if (!url || !url.includes('cloudinary.com')) return '';
  return url
    .replace('/upload/', '/upload/q_auto,f_jpg,so_0/')
    .replace(/\.(mp4|mov|webm)$/i, '.jpg');
}
