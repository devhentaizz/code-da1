const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedAudio = /\.(mp3|wav|ogg|m4a|aac)$/i;
  const allowedImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i;

  if (file.fieldname === 'audio' || file.mimetype.startsWith('audio/')) {
    if (!file.originalname.match(allowedAudio)) {
      return cb(new Error('Chỉ chấp nhận file âm thanh (.mp3, .wav, .ogg, .m4a)'), false);
    }
  } else if (file.fieldname === 'image' || file.fieldname === 'avatar' || file.fieldname === 'coverImage' || file.mimetype.startsWith('image/')) {
    if (!file.originalname.match(allowedImage)) {
      return cb(new Error('Chỉ chấp nhận file hình ảnh (.jpg, .png, .webp...)'), false);
    }
  }

  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max file size (đủ cho file mp3 chất lượng cao)
  }
});

module.exports = upload;

