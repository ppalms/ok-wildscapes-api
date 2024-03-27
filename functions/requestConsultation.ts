import * as sts from '@aws-sdk/client-sts';
import * as ses from '@aws-sdk/client-ses';
import * as dynamodb from '@aws-sdk/client-dynamodb';
import { Logger } from '@aws-lambda-powertools/logger';
import { marshall } from '@aws-sdk/util-dynamodb';
import { v4 } from 'uuid';
import { ConsultationRequest } from '../src/generated/graphql';

const { SERVICE_NAME, TABLE_NAME, SERVICE_ROLE_ARN } = process.env;
const logger = new Logger({ serviceName: SERVICE_NAME });

export const handler = async (event: {
  arguments: ConsultationRequest;
}): Promise<string | undefined> => {
  logger.info(
    `Received consultation request ${JSON.stringify(event.arguments)}`
  );
  let consultationReq: ConsultationRequest;

  try {
    consultationReq = <ConsultationRequest>event.arguments;
  } catch (error) {
    logger.error('Invalid request', error as Error);

    return undefined;
  }

  const consultationId = v4();
  logger.info(`Creating consultation ${consultationId}`);

  try {
    const stsClient = new sts.STSClient({ region: 'us-east-1' });
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
        'Failed to assume shared services role',
        JSON.stringify(assumedRole)
      );
      return undefined;
    }

    logger.info('Emailing consultation request');
    const sesClient = new ses.SESClient({
      credentials: {
        accessKeyId,
        secretAccessKey,
        sessionToken
      },
      region: 'us-east-1'
    });
    await sesClient.send(
      new ses.SendEmailCommand({
        Source: 'no-reply@okwildscapes.com',
        Destination: {
          ToAddresses: ['patrick@okwildscapes.com']
        },
        Message: {
          Subject: {
            Data: `Consultation request - ${consultationReq.firstName} ${consultationReq.lastName}`
          },
          Body: {
            Html: {
              Charset: 'UTF-8',
              Data: `<h1>New consultation request 🚀</h1>
<div>
  <p>
    Name: ${consultationReq.firstName} ${consultationReq.lastName}<br />
    Email: ${consultationReq.email}<br />
    Phone: ${consultationReq.phone}<br />
    Project Size: ${consultationReq.projectSize}<br />
    Message: ${consultationReq.message}
  </p>
</div>`
            },
            Text: {
              Charset: 'UTF-8',
              Data: `New consultation request
Name: ${consultationReq.firstName} ${consultationReq.lastName}
Email: ${consultationReq.email}
Phone: ${consultationReq.phone}
Project Size: ${consultationReq.projectSize}
Message: ${consultationReq.message}`
            }
          }
        }
      })
    );
  } catch (error) {
    logger.critical('Consultation request email failed', error as Error);
    return undefined;
  }

  try {
    const dbClient = new dynamodb.DynamoDBClient();

    const consultationReqItem = {
      PK: `CONSULTATION#${consultationId}`,
      SK: 'REQUEST',
      ...consultationReq,
      createdAt: new Date().toISOString()
    };

    const putItemCommand = new dynamodb.PutItemCommand({
      TableName: TABLE_NAME!,
      Item: marshall(consultationReqItem)
    });

    await dbClient.send(putItemCommand);
    logger.info(`Saved consultation request ${consultationReqItem.PK}`);

    return consultationId;
  } catch (error) {
    logger.error('Error saving consultation request', error as Error);
    return undefined;
  }
};
