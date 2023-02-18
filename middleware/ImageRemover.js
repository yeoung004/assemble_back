const AWS = require('aws-sdk')
const params = require('../config/key')

AWS.config.update({
  region: 'ap-northeast-2',
  accessKeyId: params.AWS_ACCESS_KEY_ID,
  secretAccessKey: params.AWS_SECRET_ACCESS_KEY
})

const s3 = new AWS.S3()
const Bucket = 'assemble-image';

module.exports.deleteImage = (Key) => {
  s3.deleteObject({ Bucket, Key },
    (error, data) => {
      if (error)
        console.log('deleteImage', error)
      else
        console.log(data)
    }
  )
};
