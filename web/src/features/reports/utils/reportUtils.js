export const resolveImageUrl = (photo) => {
  if (!photo) return null;

  const image = photo.trim();

  if (image.startsWith('http://') || image.startsWith('https://')) return image;

  const base = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api')
    .replace(/\/api$/, '')   
    .replace(/\/+$/, '');    

  const normalizedPath = image.replace(/^\/+/, '');
  const path = normalizedPath.includes('/') ? normalizedPath : `uploads/${normalizedPath}`;

  return `${base}/${path}`;
};

const DATE_FORMAT_OPTIONS = {
  day:    'numeric',
  month:  'short',
  year:   'numeric',
  hour:   '2-digit',
  minute: '2-digit',
};

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', DATE_FORMAT_OPTIONS);

export const openInGoogleMaps = (lat, lng) => {
  window.open(
    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
    '_blank',
    'noopener,noreferrer',
  );
};
