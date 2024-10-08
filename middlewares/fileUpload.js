import multer from 'multer';
import fs from 'fs';


const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        const folder = `public/${file.fieldname}/`;

        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true });
        }
        cb(null, folder);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '---' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/') ) {
        cb(null, true);
    }else {
        cb(new Error('Only image files allowed'),false);
    }
}

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 , //5 mb limit
    }
});

export default upload