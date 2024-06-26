import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { Logger } from '@aws-lambda-powertools/logger';
import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware';
import middy from '@middy/core';
import { Context } from 'aws-lambda';

const { SERVICE_NAME, BUCKET_NAME } = process.env;

const client = new S3Client();
const logger = new Logger({ serviceName: SERVICE_NAME });

const lambdaHandler = async (
  _event: { arguments: { maxKeys: number } },
  _context: Context
) => {
  let plantSheets: { fileName: string; lastModified: string }[] = [];
  try {
    const s3Objects = await client.send(
      new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: 'plant-sheets'
      })
    );

    plantSheets = s3Objects.Contents.filter(
      (obj) => !obj.Key.endsWith('/')
    ).map((obj) => ({
      fileName: obj.Key.split('/').pop(),
      lastModified: obj.LastModified.toISOString()
    }));
  } catch (error) {
    logger.error(error);
  } finally {
    return plantSheets;
  }
};

export const handler = middy()
  .use(injectLambdaContext(logger, { logEvent: true }))
  .handler(lambdaHandler);
