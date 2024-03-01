import fs from 'fs';
import multer from 'multer';
import path from 'path';

const uploadFolder = path.join(path.resolve(), 'uploads');

// Create a folder if it doesn't exist
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    return cb(null, uploadFolder);
  },
  filename: (_req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});
