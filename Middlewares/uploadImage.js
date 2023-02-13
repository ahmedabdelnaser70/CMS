const multer = require("multer");

// storage and image name
const multerStorage = multer.diskStorage({
   destination: (request, file, cb) => {
      cb(null, "./uploads/images");
   },
   filename: function (request, file, cb) {
      return cb(null, `${Date.now()} ${file.originalname}`);
   },
});

//Filtering
const multerFilter = (request, file, cb) => {
   if (file.mimetype.startsWith("image")) {
      cb(null, true);
   } else {
      cb("Not an image! please upload only image.", false);
   }
};

const upload = multer({
   storage: multerStorage,
   limits: { fileSize: 1024 * 1024 * 5 },
   fileFilter: multerFilter,
}).single("image");

module.exports = { upload };
