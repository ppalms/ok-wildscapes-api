import { Logger } from '@aws-lambda-powertools/logger';
import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware';
import * as dynamodb from '@aws-sdk/client-dynamodb';
import * as ses from '@aws-sdk/client-ses';
import * as sts from '@aws-sdk/client-sts';
import { marshall } from '@aws-sdk/util-dynamodb';
import middy from '@middy/core';
import ssm from '@middy/ssm';
import { Context } from 'aws-lambda';
import { v4 } from 'uuid';
import { ConsultationRequestInput } from '../src/generated/graphql';

const {
  SERVICE_NAME,
  SSM_STAGE,
  TABLE_NAME,
  SERVICE_ROLE_ARN,
  AWS_DEFAULT_REGION,
  INTEG_TEST
} = process.env;

const logger = new Logger({ serviceName: SERVICE_NAME });

let middyCacheEnabled = INTEG_TEST
  ? false
  : JSON.parse(process.env.MIDDY_CACHE_ENABLED);

let middyCacheExpiration = INTEG_TEST
  ? 0
  : JSON.parse(process.env.MIDDY_CACHE_EXPIRATION_MILLISECONDS);

const lambdaHandler = async (
  event: {
    arguments: ConsultationRequestInput;
  },
  context: Context & {
    config: {
      noReplyEmail: string;
      contactEmail: string;
      basecampEmail: string;
    };
  }
): Promise<string | undefined> => {
  let request: ConsultationRequestInput;
  try {
    request = <ConsultationRequestInput>event.arguments;
  } catch (error) {
    logger.error('Invalid request', error as Error);
    throw new Error('Invalid consultation request format');
  }

  const consultationId = v4();
  logger.info(`Creating consultation ${consultationId}`);

  try {
    const ddbClient = new dynamodb.DynamoDBClient();
    const consultationReqItem = {
      PK: `CONSULTATION#${consultationId}`,
      SK: 'REQUEST',
      ...request,
      createdAt: new Date().toISOString()
    };

    const putItemCommand = new dynamodb.PutItemCommand({
      TableName: TABLE_NAME!,
      Item: marshall(consultationReqItem)
    });

    await ddbClient.send(putItemCommand);
    logger.info(`Saved consultation request ${consultationReqItem.PK}`);
  } catch (error) {
    logger.error('Error saving consultation request', error as Error);
    throw new Error('Failed to save consultation request to database');
  }

  try {
    const stsClient = new sts.STSClient({ region: AWS_DEFAULT_REGION });
    const assumedRole = await stsClient.send(
      new sts.AssumeRoleCommand({
        RoleArn: SERVICE_ROLE_ARN,
        RoleSessionName: `WorkloadAccess_${consultationId}`
      })
    );

    const accessKeyId = assumedRole.Credentials?.AccessKeyId;
    const secretAccessKey = assumedRole.Credentials?.SecretAccessKey;
    const sessionToken = assumedRole.Credentials?.SessionToken;
    if (!accessKeyId || !secretAccessKey || !sessionToken) {
      logger.critical(
        'Failed to assume service role',
        JSON.stringify(assumedRole)
      );
      throw new Error('Failed to assume service role for email sending');
    }

    logger.info('Emailing consultation request');
    const sesClient = new ses.SESClient({
      credentials: {
        accessKeyId,
        secretAccessKey,
        sessionToken
      },
      region: AWS_DEFAULT_REGION
    });

    await sesClient.send(
      new ses.SendEmailCommand({
        Source: context.config.noReplyEmail,
        Destination: {
          ToAddresses: [context.config.contactEmail],
          BccAddresses: [context.config.basecampEmail]
        },
        Message: {
          Subject: {
            Data: `Consultation Request - ${request.firstName} ${request.lastName}`
          },
          Body: {
            Html: {
              Charset: 'UTF-8',
              Data: `<h1>Project Details</h1>
<div>
  <p>
    Name: ${request.firstName} ${request.lastName}<br />
    Email: ${request.email}<br />
    Phone: ${request.phone}<br />
    Project Size: ${request.projectSize}<br />
    Message: ${request.message}
  </p>
</div>`
            },
            Text: {
              Charset: 'UTF-8',
              Data: `Project Details

Name: ${request.firstName} ${request.lastName}
Email: ${request.email}
Phone: ${request.phone}
Project Size: ${request.projectSize}
Message: ${request.message}`
            }
          }
        }
      })
    );
  } catch (error) {
    logger.critical('Consultation request email failed', error as Error);
    throw new Error('Failed to send consultation request email');
  }

  return consultationId;
};

export const handler = middy()
  .use(injectLambdaContext(logger, { logEvent: true }))
  .use(
    ssm({
      cache: middyCacheEnabled,
      cacheExpiry: middyCacheExpiration,
      setToContext: true,
      fetchData: {
        config: `/${SERVICE_NAME}/${SSM_STAGE}/config`
      }
    })
  )
  .handler(lambdaHandler);
