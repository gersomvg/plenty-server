const AWS = require('aws-sdk');
const sharp = require('sharp');

const s3 = new AWS.S3({endpoint: `${process.env.AWS_ENDPOINT}`});

const upload = async ({path, filename, extension, body}) => {
    const params = {
        Bucket: process.env.AWS_BUCKET,
        ACL: 'public-read',
        Key: `${path}/${filename}.${extension}`,
        Body: body,
    };
    return new Promise((resolve, reject) => {
        s3.upload(params, (err, data) => {
            if (err) reject(err);
            resolve(data);
        });
    });
};

const uploadWithThumbs = async ({path, filename, extension, body}) => {
    const large = await sharp(body)
        .resize(900, 900)
        .toBuffer();
    const small = await sharp(body)
        .resize(180, 180)
        .toBuffer();
    await upload({path, filename, extension, body});
    await upload({path, filename: `${filename}.large`, extension, body: large});
    await upload({path, filename: `${filename}.small`, extension, body: small});
};

const removeAllSizes = async ({path, filename, extension}) => {
    var params = {
        Bucket: process.env.AWS_BUCKET,
        Delete: {
            Objects: [
                {Key: `${path}/${filename}.${extension}`},
                {Key: `${path}/${filename}.large.${extension}`},
                {Key: `${path}/${filename}.small.${extension}`},
            ],
            Quiet: true,
        },
    };
    return new Promise((resolve, reject) => {
        s3.deleteObjects(params, (err, data) => {
            if (err) reject(err);
            resolve(data);
        });
    });
};

module.exports = {upload, uploadWithThumbs, removeAllSizes};
