import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
    // destination: function (req, file, cb) {
    //   const dir = "public/turfImages/";
    //   if (!fs.existsSync(dir)) {
    //     fs.mkdirSync(dir, { recursive: true });
    //   }
    //   cb(null, dir);
    // },
    filename: function (req, file, cb) {
      const name = Date.now() + "-" + file.originalname;
      cb(null, name);
    },
  });
  const upload = multer({ storage: storage });
export const productImage = upload.array("image", 4);




