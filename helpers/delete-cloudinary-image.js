import cloudinary from '../configs/cloudinary.js';

/**
 * Extracts the public_id from a Cloudinary URL and deletes the image.
 * @param {string} imageUrl - The full URL of the image in Cloudinary.
 */
export const deleteImageFromCloudinary = async (imageUrl) => {
    if (!imageUrl || !imageUrl.includes('res.cloudinary.com')) return;

    try {
        // Example URL: https://res.cloudinary.com/cloud_name/image/upload/v1234567/folder/image_id.jpg
        // We need: folder/image_id
        const parts = imageUrl.split('/');
        const fileNameWithExtension = parts.pop(); // image_id.jpg
        const publicIdWithoutExtension = fileNameWithExtension.split('.')[0]; // image_id
        
        // The folder is usually the second to last part if it exists
        // However, it's safer to join the parts after 'upload/' (or after 'v[number]/')
        const uploadIndex = parts.indexOf('upload');
        if (uploadIndex === -1) return;

        // Skip 'upload' and the version (e.g., 'v1713212345')
        let startIndex = uploadIndex + 1;
        if (parts[startIndex] && parts[startIndex].startsWith('v') && !isNaN(parts[startIndex].substring(1))) {
            startIndex++;
        }

        const publicId = [...parts.slice(startIndex), publicIdWithoutExtension].join('/');
        
        console.log(`Deleting image from Cloudinary with public_id: ${publicId}`);
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
    }
};
