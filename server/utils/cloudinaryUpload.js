const cloudinary = require('../config/cloudinary');

// Upload a file buffer to Cloudinary
const uploadToCloudinary = (fileBuffer, fileName, folder = 'student_uploads') => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: fileName,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    ).end(fileBuffer);
  });
};

module.exports = uploadToCloudinary;
