const { upload, deleteFile } = require('../utils/fileUpload');
const ApiError = require('../utils/ApiError');

const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    const singleUpload = upload.single(fieldName);
    
    singleUpload(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(ApiError.badRequest('File too large. Max size is 5MB'));
        }
        return next(ApiError.badRequest(err.message));
      }
      
      if (!req.file) {
        return next();
      }
      
      // Add file path to request
      req.fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      next();
    });
  };
};

const uploadMultiple = (fieldName, maxCount = 5) => {
  return (req, res, next) => {
    const multipleUpload = upload.array(fieldName, maxCount);
    
    multipleUpload(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(ApiError.badRequest('File too large. Max size is 5MB'));
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return next(ApiError.badRequest(`Too many files. Max ${maxCount} files allowed`));
        }
        return next(ApiError.badRequest(err.message));
      }
      
      if (!req.files || req.files.length === 0) {
        return next();
      }
      
      // Add file paths to request
      req.fileUrls = req.files.map(file => ({
        filename: file.filename,
        url: `${req.protocol}://${req.get('host')}/uploads/${file.filename}`,
      }));
      
      next();
    });
  };
};

module.exports = { uploadSingle, uploadMultiple };