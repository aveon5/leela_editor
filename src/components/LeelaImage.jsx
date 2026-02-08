import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { cn } from '../lib/utils';
import { Loader2 } from 'lucide-react';

export default function LeelaImage({ path, alt, className }) {
    const imageUrls = useStore((state) => state.imageUrls);
    const fetchImage = useStore((state) => state.fetchImage);
    const [loading, setLoading] = useState(!imageUrls[path]);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!path) return;
        if (imageUrls[path]) {
            setLoading(false);
            return;
        }

        setLoading(true);
        fetchImage(path)
            .then((url) => {
                if (!url) setError(true);
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, [path, imageUrls, fetchImage]);

    if (loading) {
        return (
            <div className={cn("flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400", className)}>
                <Loader2 className="w-6 h-6 animate-spin" />
            </div>
        );
    }

    if (error || !imageUrls[path]) {
        return (
            <div className={cn("flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400 text-xs", className)}>
                No Image
            </div>
        );
    }

    return (
        <img
            src={imageUrls[path]}
            alt={alt}
            className={cn("object-cover", className)}
        />
    );
}
