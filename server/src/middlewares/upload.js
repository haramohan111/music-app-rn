// middlewares/upload.js
const multer = require('multer');
const path = require('path');

// Store files in local `/uploads` directory before Cloudinary
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/audio'); // store temporarily before uploading
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else {
    cb(new Error('Only audio files are allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
});

module.exports = upload;
