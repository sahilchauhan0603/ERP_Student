const cloudinary = require('../config/cloudinary');

// Upload a file buffer to Cloudinary
const uploadToCloudinary = (fileBuffer, fileName, folder = 'student_uploads') => {
  return new Promise((resolve, reject) => {
    // Determine resource type based on file extension
    const fileExtension = fileName.split('.').pop().toLowerCase();
    const isPDF = fileExtension === 'pdf';
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);
    
    const uploadOptions = {
      folder,
      public_id: fileName,
      resource_type: isPDF ? 'raw' : (isImage ? 'image' : 'auto'),
      // For PDFs, ensure they are publicly accessible
      access_mode: isPDF ? 'public' : 'auto',
    };

    cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    ).end(fileBuffer);
  });
};

module.exports = uploadToCloudinary;
