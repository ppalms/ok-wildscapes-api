import { Logger } from '@aws-lambda-powertools/logger';
import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import middy from '@middy/core';
import { Context } from 'aws-lambda/handler';
import { PresignedUrlResponse } from '../src/generated/graphql';

const { SERVICE_NAME, BUCKET_NAME } = process.env;

const client = new S3Client();
const logger = new Logger({ serviceName: SERVICE_NAME });
const allowedFileTypes = new Map([
  ['pdf', 'application/pdf'],
  [
    'docx',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
]);

async function lambdaHandler(
  event: { arguments: { key: string; title: string } },
  _context: Context
): Promise<PresignedUrlResponse | undefined> {
  const { key, title } = event.arguments;
  const fileExt = key.split('.').pop();
  const contentType = allowedFileTypes.get(fileExt);
  if (!contentType) {
    logger.error(`Invalid file extension: ${fileExt}`);
    return;
  }

  logger.info(`Generating presigned URL for ${key}`);
  try {
    const presignedUrl = await getSignedUrl(
      client,
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: contentType,
        Metadata: { title }
      })
    );
    logger.info('Generated presigned URL', presignedUrl);
    return { url: presignedUrl };
  } catch (error) {
    logger.error(error);
  }
}

export const handler = middy()
  .use(injectLambdaContext(logger, { logEvent: true }))
  .handler(lambdaHandler);
