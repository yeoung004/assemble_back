const AWS = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3')
const path = require('path')
const params = require('../config/key')

AWS.config.update({
  region: 'ap-northeast-2',
  accessKeyId: params.AWS_ACCESS_KEY_ID,
  secretAccessKey: params.AWS_SECRET_ACCESS_KEY
})
const s3 = new AWS.S3()
const allowedExtensions = ['.png', '.jpg', '.jpeg', '.bmp']
const imageUploader = multer({
  storage: multerS3({
    s3,
    bucket: 'assemble-image',
    key: (req, file, callback) => {
      const uploadDirectory = req.headers.uri;
      const extension = path.extname(file.originalname)
      if (!allowedExtensions.includes(extension))
        return callback(new Error('wrong extension'))
      callback(null, `${uploadDirectory}`)
    },
    acl: 'public-read-write'
  }),
})

module.exports = imageUploader;