export function cloudinaryVideo(url: string): string {
  if (!url || !url.includes('cloudinary.com')) return url;
  return url.replace('/upload/', '/upload/q_auto,f_auto/');
}

export function cloudinaryPoster(url: string): string {
  if (!url || !url.includes('cloudinary.com')) return '';
  return url
    .replace('/upload/', '/upload/q_auto,f_jpg,so_0/')
    .replace(/\.(mp4|mov|webm)$/i, '.jpg');
}
