import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';

dotenv.config();

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Bucket name from environment variables
const bucketName = process.env.AWS_S3_BUCKET_NAME;

/**
 * Upload a file to S3
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {string} key - The key (filename) to use in S3
 * @param {string} contentType - The MIME type of the file
 * @returns {Promise} - Promise resolving to S3 upload result
 */
export const uploadFileToS3 = async (fileBuffer, key, contentType) => {
  const uploadParams = {
    Bucket: bucketName,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType
  };

  const command = new PutObjectCommand(uploadParams);
  return await s3Client.send(command);
};

/**
 * Generate a signed URL for downloading a file from S3
 * @param {string} key - The key (filename) in S3
 * @param {number} expiresIn - Expiration time in seconds
 * @returns {Promise<string>} - Promise resolving to signed URL
 */
export const generateSignedUrl = async (key, expiresIn = 600) => {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
};

export default {
  s3Client,
  bucketName,
  uploadFileToS3,
  generateSignedUrl
};
