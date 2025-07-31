const cloudinary = require('../config/cloudinary');

// Upload a file buffer to Cloudinary
const uploadToCloudinary = (fileBuffer, fileName, folder = 'student_uploads') => {
  return new Promise((resolve, reject) => {
    try {
      // Determine resource type based on file extension
      const fileExtension = fileName.split('.').pop().toLowerCase();
      const isPDF = fileExtension === 'pdf';
      const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);

      const uploadOptions = {
        folder,
        public_id: fileName,
        resource_type: isPDF ? 'raw' : 'image', // PDFs as raw, images as image
        timeout: 60000, // 60 seconds timeout
        access_mode: 'public' // Ensure all files are publicly accessible
      };

      // For PDFs, ensure they're uploaded as raw files with proper URL structure
      if (isPDF) {
        uploadOptions.format = 'pdf';
        uploadOptions.flags = 'attachment';
      }

      cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            // Cloudinary upload error
            return reject(error);
          }

          resolve(result.secure_url);
        }
      ).end(fileBuffer);
    } catch (err) {
      // Error in uploadToCloudinary
      reject(err);
    }
  });
};

module.exports = uploadToCloudinary;
