const cloudinary = require('../config/cloudinary');

// Upload a file buffer to Cloudinary
const uploadToCloudinary = (fileBuffer, fileName, folder = 'student_uploads') => {
  return new Promise((resolve, reject) => {
    try {
      // Determine file type
      const fileExtension = fileName.split('.').pop().toLowerCase();
      const isPDF = fileExtension === 'pdf';

      const uploadOptions = {
        folder,
        public_id: fileName,
        resource_type: isPDF ? 'raw' : 'image',
        timeout: 60000,
        access_mode: 'public'
      };

      if (isPDF) {
        uploadOptions.format = 'pdf';
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            return reject(error);
          }
          // Always use result.secure_url for all file types
          resolve(result.secure_url);
        }
      );

      uploadStream.end(fileBuffer);
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = uploadToCloudinary;