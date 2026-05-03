/**
 * Optimizes image URLs for better quality/performance.
 * Specifically handles Unsplash images by appending quality parameters.
 * 
 * @param url The source image URL
 * @param width Target width (default 2560 for high res)
 * @param quality Quality setting 1-100 (default 100)
 * @returns Optimized URL string
 */
// Helper to get optimized image URL
export function getOptimizedImageUrl(url: string | null | undefined, width: number = 2560, quality: number = 100): string {
    if (!url) return '/placeholder.svg';

    // Handle Unsplash images
    if (url.includes('images.unsplash.com')) {
        const separator = url.includes('?') ? '&' : '?';
        // Force set width/quality params that override defaults
        return `${url}${separator}w=${width}&q=${quality}&fit=clip&auto=format`;
    }

    // Handle Supabase Storage images
    // Try to use Supabase Image Transformation if the URL follows the standard storage pattern
    // URL format: .../storage/v1/object/public/bucket/file
    // Transformation format: .../storage/v1/render/image/public/bucket/file
    if (url.includes('/storage/v1/object/public/')) {
        // We attempt to use the render endpoint. If Supabase Image Transformation is NOT enabled for the project,
        // this might fail. However, standard storage often redirects or handles it if enabled.
        // Safest bet for "generic" Supabase without confirming Pro plan is to NOT force this unless we know.
        // BUT user says quality is bad.
        // Let's stick to returning original for Supabase to be safe, but maybe the user is using a resized version?
        // No, standard `getPublicUrl` returns original. 
        return url;
    }

    return url;
}
