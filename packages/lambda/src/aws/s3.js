import AWS from 'aws-sdk'
import mime from 'mime'
import { getCacheControl } from 'utils/cache'

export default class S3 {
  getObject (region, bucketName, objectName) {
    const awsS3 = new AWS.S3({ region })
    return new Promise((resolve, reject) => {
      const params = {
        Bucket: bucketName,
        Key: objectName
      }
      awsS3.getObject(params, (err, result) => {
        if (err) {
          return reject(err)
        }
        resolve(result)
      })
    })
  }

  putObject (region, bucketName, objectName, body, mimeType = undefined, cacheControl = undefined) {
    const awsS3 = new AWS.S3({ region })
    return new Promise((resolve, reject) => {
      if (mimeType === undefined) {
        mimeType = mime.lookup(objectName)
      }
      if (cacheControl === undefined) {
        cacheControl = getCacheControl(mimeType)
      }
      const params = {
        Bucket: bucketName,
        Body: body,
        Key: objectName,
        ContentType: mimeType,
        CacheControl: cacheControl
      }
      awsS3.putObject(params, (err, result) => {
        if (err) {
          return reject(err)
        }
        resolve()
      })
    })
  }

  // can't list more than 1000 keys
  listObjects (region, bucketName, path) {
    const awsS3 = new AWS.S3({ region })
    return new Promise((resolve, reject) => {
      const params = {
        Bucket: bucketName,
        Prefix: path
      }
      awsS3.listObjectsV2(params, (err, result) => {
        if (err) {
          return reject(err)
        }
        return resolve(result.Contents)
      })
    })
  }

  async listAllObjects (region, bucketName, path) {
    const awsS3 = new AWS.S3({ region })
    const objects = []
    let continuationToken
    do {
      const params = {
        Bucket: bucketName,
        Prefix: path
      }
      if (continuationToken) {
        params.ContinuationToken = continuationToken
      }
      // eslint-disable-next-line no-await-in-loop
      const result = await new Promise((resolve, reject) => {
        awsS3.listObjectsV2(params, (err, data) => {
          if (err) {
            return reject(err)
          }
          return resolve(data)
        })
      })
      if (result.Contents && result.Contents.length > 0) {
        objects.push(...result.Contents)
      }
      continuationToken = result.IsTruncated ? result.NextContinuationToken : undefined
    } while (continuationToken)
    return objects
  }

  async deleteObjects (region, bucketName, objectKeys) {
    if (!objectKeys || objectKeys.length === 0) return
    const awsS3 = new AWS.S3({ region })
    const chunkSize = 1000
    for (let i = 0; i < objectKeys.length; i += chunkSize) {
      const chunk = objectKeys.slice(i, i + chunkSize).map((key) => ({ Key: key }))
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve, reject) => {
        const params = {
          Bucket: bucketName,
          Delete: {
            Objects: chunk,
            Quiet: true
          }
        }
        awsS3.deleteObjects(params, (err) => {
          if (err) {
            return reject(err)
          }
          resolve()
        })
      })
    }
  }

  copyObject (region, srcBucketName, srcObjectName, destBucketName, destObjectName) {
    const awsS3 = new AWS.S3({ region })
    return new Promise((resolve, reject) => {
      const contentType = mime.lookup(destObjectName)
      const cacheControl = getCacheControl(contentType)
      const params = {
        Bucket: destBucketName,
        Key: destObjectName,
        ContentType: contentType,
        CacheControl: cacheControl,
        CopySource: srcBucketName + '/' + srcObjectName,
        MetadataDirective: 'REPLACE'
      }
      awsS3.copyObject(params, (err, result) => {
        if (err) {
          return reject(err)
        }
        console.log('copied: ' + destObjectName)
        resolve()
      })
    })
  }
}
