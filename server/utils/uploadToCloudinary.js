const cloudinary = require('cloudinary').v2;
const {
  cloudinary: { cloudName, apiKey, apiSecret },
} = require('../config');

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

const uploadToCloudinary = ({ file, path, allowedExts }) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      file.tempFilePath,
      {
        folder: path,
        allowedFormats: allowedExts,
      },
      // eslint-disable-next-line consistent-return
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result.public_id);
      },
    );
  });

module.exports = uploadToCloudinary;
