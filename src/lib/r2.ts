import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID!,
        secretAccessKey: R2_SECRET_ACCESS_KEY!,
    },
});

export async function getPresignedUploadUrl(key: string, mimeType: string, expiresIn = 900) {
    const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        ContentType: mimeType,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
}

export async function getPresignedDownloadUrl(key: string, expiresIn = 3600) {
    const command = new GetObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
}

export async function deleteObject(key: string) {
    const command = new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
    });

    return await s3Client.send(command);
}

export function generateFileKey(projectId: string, filename: string) {
    const uuid = crypto.randomUUID();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `projects/${projectId}/files/${uuid}-${sanitizedFilename}`;
}
