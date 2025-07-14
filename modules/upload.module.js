import AWS from 'aws-sdk';
import path from 'path';
import multer from 'multer';
import multerS3 from 'multer-s3';

const s3 = new AWS.S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
}); 

const fileFilter = (req, file, cb) => {
    const allowed = /jpg|jpeg|png|gif/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.test(ext)) {
        cb(null,true);
    } else {
        cb(new Error('Only images are allowed!'), false);
    }
    };

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_S3_BUCKET,
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: (req, file, cb) => {
            const fileName = `${Date.now().toString()}-${file.originalname}`;
            cb(null, `uploads/${fileName}`);
        }   
    }),
    fileFilter: fileFilter,

export default upload;