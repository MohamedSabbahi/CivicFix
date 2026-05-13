export const resolveImageUrl = (photo) => {
  if (!photo) return null;

  if (photo.startsWith('http://') || photo.startsWith('https://')) return photo;

  const base = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api')
    .replace(/\/api$/, '')   
    .replace(/\/+$/, '');    

  const path = photo.replace(/^\/+/, ''); 
  if (import.meta.env.DEV) {
    console.log('[resolveImageUrl] base:', base);
    console.log('[resolveImageUrl] path:', path);
    console.log('[resolveImageUrl] full:', `${base}/${path}`);
  }

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