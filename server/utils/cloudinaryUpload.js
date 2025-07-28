const cloudinary = require('../config/cloudinary');

// Upload a file buffer to Cloudinary
const uploadToCloudinary = (fileBuffer, fileName, folder = 'student_uploads') => {
  return new Promise((resolve, reject) => {
    try {
      // Determine resource type based on file extension and MIME type
      const fileExtension = fileName.split('.').pop().toLowerCase();
      const isPDF = fileExtension === 'pdf' || fileName.toLowerCase().includes('pdf');
      const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension) || 
                     fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/);
      

      
      const uploadOptions = {
        folder,
        public_id: fileName,
        resource_type: isPDF ? 'raw' : (isImage ? 'image' : 'auto'),
        // Add timeout and other options for better reliability
        timeout: 60000, // 60 seconds timeout
      };

      // Only set access_mode for PDFs
      if (isPDF) {
        uploadOptions.access_mode = 'public';
      }

      

      cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return reject(error);
          }

          resolve(result.secure_url);
        }
      ).end(fileBuffer);
    } catch (err) {
      console.error('Error in uploadToCloudinary:', err);
      reject(err);
    }
  });
};

module.exports = uploadToCloudinary;
