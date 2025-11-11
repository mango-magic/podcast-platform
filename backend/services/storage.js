const AWS = require('aws-sdk');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Configure AWS SDK for MinIO
const s3 = new AWS.S3({
  endpoint: `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`,
  s3ForcePathStyle: true,
  accessKeyId: process.env.MINIO_ACCESS_KEY,
  secretAccessKey: process.env.MINIO_SECRET_KEY,
  signatureVersion: 'v4'
});

// Configure multer for memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB
  },
  fileFilter: (req, file, cb) => {
    // Accept audio and video files
    const allowedMimes = [
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/webm', 'audio/ogg',
      'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio and video files are allowed.'));
    }
  }
});

// Ensure bucket exists
async function ensureBucket() {
  try {
    await s3.headBucket({ Bucket: process.env.MINIO_BUCKET }).promise();
  } catch (error) {
    if (error.statusCode === 404) {
      await s3.createBucket({ Bucket: process.env.MINIO_BUCKET }).promise();
      console.log(`Created bucket: ${process.env.MINIO_BUCKET}`);
    }
  }
}

// Initialize bucket on module load
ensureBucket().catch(console.error);

// Upload file to MinIO
async function uploadFile(file, folder = 'uploads') {
  try {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${folder}/${uuidv4()}${fileExtension}`;
    
    const params = {
      Bucket: process.env.MINIO_BUCKET,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        originalName: file.originalname
      }
    };
    
    await s3.putObject(params).promise();
    
    return {
      key: fileName,
      url: getFileUrl(fileName),
      size: file.size,
      mimetype: file.mimetype
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error('Failed to upload file');
  }
}

// Get file URL
function getFileUrl(key) {
  return `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${process.env.MINIO_BUCKET}/${key}`;
}

// Get signed URL (for private files)
function getSignedUrl(key, expiresIn = 3600) {
  return s3.getSignedUrl('getObject', {
    Bucket: process.env.MINIO_BUCKET,
    Key: key,
    Expires: expiresIn
  });
}

// Delete file
async function deleteFile(key) {
  try {
    await s3.deleteObject({
      Bucket: process.env.MINIO_BUCKET,
      Key: key
    }).promise();
    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
}

module.exports = {
  upload,
  uploadFile,
  getFileUrl,
  getSignedUrl,
  deleteFile,
  ensureBucket
};

