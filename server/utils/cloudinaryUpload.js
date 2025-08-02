const cloudinary = require('../config/cloudinary');

// Upload a file buffer to Cloudinary
const uploadToCloudinary = (fileBuffer, fileName, folder = 'student_uploads') => {
  return new Promise((resolve, reject) => {
    try {
      // Determine file type
      const fileExtension = fileName.split('.').pop().toLowerCase();
      const isPDF = fileExtension === 'pdf';
      const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);

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

          if (isPDF) {
            const url = `https://res.cloudinary.com/${cloudinary.config().cloud_name}/raw/upload/${result.public_id}.${result.format}`;
            resolve(url);
          } else {
            resolve(result.secure_url);
          }
        }
      );

      uploadStream.end(fileBuffer);
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = uploadToCloudinary;