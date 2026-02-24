//multer is a middleware that is used for the storage of files on some cloud platform(in our case cloudinary)
import multer from "multer";

//diskStorage is a method in multer that enables us to store the data in the disk
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/temp");
  },

  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

//this is the method we gonna use everywhere to upload the things so that the destination
//and filename doesnt need to be defined again and again
export const upload = multer({ storage });
