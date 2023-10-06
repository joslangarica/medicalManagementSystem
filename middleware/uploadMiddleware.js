const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads'); // Destination folder
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname); // Filename
  }
});

const fileFilter = (req, file, cb) => {
  console.log("Multer: Checking file type...");  

  // Accept only images and PDFs
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 25 // 5 MB max file size
  },
  fileFilter: fileFilter
});

module.exports = upload;
