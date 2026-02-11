const multer = require('multer');
//multer is a middleware for handling multipart/form-data, which is primarily used for uploading files. It makes it easy to handle file uploads in Node.js applications. In this code, we are configuring multer to store uploaded files on disk and to filter the uploaded files to only allow images. We also set a file size limit of 5MB.
const path = require('path');
// The 'path' module provides utilities for working with file and directory paths. We use it here to ensure that the uploaded files have the correct file extension when we save them to disk.
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = 'public/uploads/';

        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = upload;
