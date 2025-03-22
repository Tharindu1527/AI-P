// Place this file at: src/services/ImageService.js

const ImageService = {
    // Store profile image URL in sessionStorage
    saveProfileImageUrl(imageUrl) {
        if (imageUrl) {
            sessionStorage.setItem('profileImageUrl', imageUrl);
            console.log('Profile image URL saved to sessionStorage:', imageUrl);
        } else {
            sessionStorage.removeItem('profileImageUrl');
            console.log('Profile image URL removed from sessionStorage');
        }
    },

    // Get profile image URL from sessionStorage
    getProfileImageUrl() {
        return sessionStorage.getItem('profileImageUrl');
    },

    // Create a blob URL from an image URL
    async fetchAndCreateBlobUrl(imageUrl) {
        if (!imageUrl) return null;
        
        try {
            console.log('Fetching image from URL:', imageUrl);
            
            const response = await fetch(imageUrl, {
                cache: 'no-store', // Prevent caching
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
            }
            
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            
            console.log('Created blob URL:', blobUrl);
            return blobUrl;
        } catch (error) {
            console.error('Error creating blob URL:', error);
            return null;
        }
    },

    // Revoke a blob URL
    revokeBlobUrl(blobUrl) {
        if (blobUrl && blobUrl.startsWith('blob:')) {
            URL.revokeObjectURL(blobUrl);
            console.log('Revoked blob URL:', blobUrl);
        }
    }
};

export default ImageService;