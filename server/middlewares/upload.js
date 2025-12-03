const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// Storage configuration for team logos
const teamLogoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/teams/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `team-${uuidv4()}${ext}`);
  },
});

// Storage configuration for user avatars
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/avatars/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${uuidv4()}${ext}`);
  },
});

// Image filter
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error("Only image formats are allowed (jpeg, jpg, png, gif, webp)."));
};

// Upload for team logo
const uploadTeamLogo = multer({
  storage: teamLogoStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: imageFilter,
}).single("logo");

// Upload for user avatar
const uploadAvatar = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
  fileFilter: imageFilter,
}).single("avatar");

// Middleware wrapper for better error handling
const handleUpload = (uploadMiddleware) => {
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "File is too large.",
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      next();
    });
  };
};

module.exports = {
  uploadTeamLogo: handleUpload(uploadTeamLogo),
  uploadAvatar: handleUpload(uploadAvatar),
};
