const multer = require('multer');

const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (['image/jpeg', 'image/png'].includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    },
    limits: {
        fileSize: 20971520,
        files: 1,
    },
});

module.exports = upload;
