const fs = require('fs');
const path = require('path');
const multer = require('multer');

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const dir = './uploads/audio';
    
//     // Create directory if it doesn't exist
//     if (!fs.existsSync(dir)) {
//       fs.mkdirSync(dir, { recursive: true });
//     }

//     cb(null, dir);
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     cb(null, `${Date.now()}-${file.originalname}`);
//   },
// });

// const fileFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith('audio/')) {
//     cb(null, true);
//   } else {
//     cb(new Error('Only audio files are allowed!'), false);
//   }
// };

// const upload = multer({
//   storage,
//   fileFilter,
// });

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });


module.exports = upload;
