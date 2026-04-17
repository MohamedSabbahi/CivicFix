import { useState, memo } from 'react';
import { MapPin } from 'lucide-react';

const ImageWithFallback = memo(({ src, alt }) => {
    const [hasError, setHasError] = useState(false);

    if (!src || hasError) {
    return (
        <div
        className="flex items-center justify-center h-full w-full"
        role="img"
        aria-label="Image unavailable"
        >
        <MapPin size={48} className="text-slate-600" aria-hidden="true" />
    </div>
    );
    }

    return (
    <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        onError={() => setHasError(true)}
    />
    );
});

ImageWithFallback.displayName = 'ImageWithFallback';

export default ImageWithFallback;